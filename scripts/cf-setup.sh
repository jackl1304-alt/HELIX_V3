#!/usr/bin/env bash
# =====================================================================
# HELIX Cloudflare API Setup
# =====================================================================
# Provisions Cloudflare in front of HELIX via the Cloudflare API v4.
# Operations are idempotent (POST / PATCH / GET by name).
#
# Required env vars:
#   CF_API_TOKEN          Cloudflare API Token with Zone:Edit + DNS:Edit + SSL:Edit
#   CF_ACCOUNT_ID         Cloudflare Account ID
#   CF_ZONE                apex domain (e.g. deltaways.de)
#   NETCUP_IPV4            Netcup public IPv4 (A record target)
#
# Optional env vars:
#   DRY_RUN=1             Print planned changes without applying them
#   VERBOSE=1             Print API responses
#   AUTHCF_ORIGIN_HOST=helix.deltaways.de   vhost for /api/auth rate-limit
#
# Usage:
#   ./scripts/cf-setup.sh
#   DRY_RUN=1 ./scripts/cf-setup.sh
#   VERBOSE=1 ./scripts/cf-setup.sh
# =====================================================================
set -u
set -o pipefail

DRY_RUN="${DRY_RUN:-0}"
VERBOSE="${VERBOSE:-0}"

# Colors
if [[ -t 1 ]]; then
  RED='\033[0;31m'; GREEN='\033[0;32m'; YEL='\033[1;33m'; BLU='\033[0;34m'; NC='\033[0m'
else
  RED=''; GREEN=''; YEL=''; BLU=''; NC=''
fi

err()  { echo -e "${RED}[ERR]${NC} $1" >&2; }
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
note() { echo -e "${BLU}[..]${NC} $1"; }
warn() { echo -e "${YEL}[WARN]${NC} $1"; }

need() { command -v "$1" >/dev/null 2>&1 || { err "missing tool: $1"; exit 2; }; }
need curl
need jq

# ---------------- env validation ----------------
[[ -n "${CF_API_TOKEN:-}"    ]] || { err "CF_API_TOKEN not set"; exit 2; }
[[ -n "${CF_ACCOUNT_ID:-}"   ]] || { err "CF_ACCOUNT_ID not set"; exit 2; }
[[ -n "${CF_ZONE:-}"         ]] || { err "CF_ZONE not set (e.g. deltaways.de)"; exit 2; }
[[ -n "${NETCUP_IPV4:-}"     ]] || { err "NETCUP_IPV4 not set (A record target)"; exit 2; }

if ! curl -sS --max-time 10 -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/user/tokens/verify" | grep -q 200; then
  err "CF_API_TOKEN is invalid or has insufficient scope"; exit 2
fi
ok "CF_API_TOKEN valid"

if [[ "$DRY_RUN" == "1" ]]; then
  note "DRY-RUN mode: no changes will be applied"
fi

# ---------------- helper ----------------
cf_api() {
  local method="$1"; local path="$2"; local body="${3:-}"
  local code resp
  resp=$(curl -sS --max-time 15 -w "\n%{http_code}" \
    -X "$method" -H "Authorization: Bearer $CF_API_TOKEN" \
    -H "Content-Type: application/json" \
    ${body:+--data "$body"} \
    "https://api.cloudflare.com/client/v4$path")
  code=$(echo "$resp" | tail -1)
  body_resp=$(echo "$resp" | sed '$d')
  if [[ "$VERBOSE" == "1" ]]; then
    echo "[cf_api] $method $path  → HTTP $code"
    echo "$body_resp" | jq . 2>/dev/null || echo "$body_resp"
  fi
  if [[ "$code" =~ ^2 ]]; then
    echo "$body_resp"
  else
    err "CF API $method $path returned HTTP $code"
    echo "$body_resp" | jq . 2>/dev/null || echo "$body_resp"
    return 1
  fi
}

# ---------- 1. Zone ID ----------
ZONE_ID=$(cf_api GET "/zones?name=$CF_ZONE" | jq -r '.result[0].id // empty')
[[ -n "$ZONE_ID" ]] || { err "Zone $CF_ZONE not found in this account"; exit 2; }
ok "Zone $CF_ZONE has id $ZONE_ID"

# ---------- 2. DNS records (apex + wildcard) ----------
upsert_dns() {
  local name="$1"; local type="$2"; local content="$3"; local proxied="$4"
  local existing_id
  existing_id=$(cf_api GET "/zones/$ZONE_ID/dns_records?type=$type&name=$name" \
    | jq -r '.result[0].id // empty')
  local body
  body=$(jq -nc \
    --arg n "$name" --arg t "$type" --arg c "$content" \
    --argjson p "$proxied" \
    '{type:$t, name:$n, content:$c, proxied:$p, ttl:1}')
  if [[ -n "$existing_id" ]]; then
    note "  DNS ${type} ${name}: updating (id $existing_id)"
    [[ "$DRY_RUN" == "1" ]] && return 0
    cf_api PUT "/zones/$ZONE_ID/dns_records/$existing_id" "$body" >/dev/null
    ok "DNS ${type} ${name} → $content (proxied=$proxied)"
  else
    note "  DNS ${type} ${name}: creating"
    [[ "$DRY_RUN" == "1" ]] && return 0
    cf_api POST "/zones/$ZONE_ID/dns_records" "$body" >/dev/null
    ok "DNS ${type} ${name} → $content (proxied=$proxied)"
  fi
}

echo
note "DNS records"
upsert_dns "@" "A" "$NETCUP_IPV4" true
upsert_dns "*" "CNAME" "$CF_ZONE" true
# Monitoring sub: DNS only (grey cloud) — do NOT proxy through CF
upsert_dns "monitoring" "A" "$NETCUP_IPV4" false

# ---------- 3. SSL / TLS mode ----------
echo
note "SSL/TLS → Full (strict)"
[[ "$DRY_RUN" == "1" ]] || cf_api PATCH "/zones/$ZONE_ID/settings/ssl" \
  '{"value":"full"}' >/dev/null && ok "SSL mode: full"
[[ "$DRY_RUN" == "1" ]] || cf_api PATCH "/zones/$ZONE_ID/settings/min_tls_version" \
  '{"value":"1.2"}' >/dev/null && ok "Min TLS: 1.2"
[[ "$DRY_RUN" == "1" ]] || cf_api PATCH "/zones/$ZONE_ID/settings/tls_1_3" \
  '{"value":"on"}' >/dev/null && ok "TLS 1.3: on"
[[ "$DRY_RUN" == "1" ]] || cf_api PATCH "/zones/$ZONE_ID/settings/always_use_https" \
  '{"value":"on"}' >/dev/null && ok "Always-HTTPS: on"
[[ "$DRY_RUN" == "1" ]] || cf_api PATCH "/zones/$ZONE_ID/settings/http2" \
  '{"value":"on"}' >/dev/null && ok "HTTP/2: on"
[[ "$DRY_RUN" == "1" ]] || cf_api PATCH "/zones/$ZONE_ID/settings/http3" \
  '{"value":"on"}' >/dev/null && ok "HTTP/3 (QUIC): on"

# ---------- 4. Security / WAF rate-limit ----------
# Cloudflare WAF rate-limit (free: 1 rule; upgrade for more)
# Use a low-cost filter: only /api/auth/* POSTs
echo
note "WAF rate-limit rule for /api/auth/"
RULE_NAME="HELIX Rate-Limit /api/auth"
RULE_BODY=$(jq -nc \
  --arg n "$RULE_NAME" \
  --arg exp_top "(http.request.uri.path matches \"^/api/auth/.*\") and (http.request.method eq \"POST\")" \
  '{
    mode:"block",
    name:$n,
    priority:1000,
    action:{mode:"block"},
    filter:{expression:$exp_top},
    rate_limit:{ characteristics:["cf.colo.id"], period:60, requests_per_period:30 }
  }')

existing_rule=$(cf_api GET "/zones/$ZONE_ID/rulesets?type=rate_limit" \
  | jq -r --arg n "$RULE_NAME" '.result[] | select(.name==$n) | .id')
if [[ -n "$existing_rule" ]]; then
  note "  existing rule '$RULE_NAME' (id $existing_rule); skipped"
else
  [[ "$DRY_RUN" == "1" ]] || cf_api POST "/zones/$ZONE_ID/rulesets?type=rate_limit" "$RULE_BODY" >/dev/null \
    && ok "Rate-limit rule created: $RULE_NAME (30 req / 60 sec)"
fi

# ---------- 5. Custom Hostnames (SaaS) ----------
# This is paid feature on most plans; but if tenant onboarding is requested, we can attach
# via origin API. Skipped in default run to avoid tying to a tenant.
echo
note "Custom Hostnames (per-tenant): skipped — invoke manually for new tenants"

# ---------- 6. Caching rules (free tier: 5 / paid: 50) ----------
echo
note "Edge cache rule for static assets"
RULE_NAME_CACHE="HELIX Cache Static"
cache_rule_body=$(jq -nc --arg n "$RULE_NAME_CACHE" '
  { name:$n, priority:200, action:"cache", enable:true,
    conditions:[
      {type:"request.uri", operator:"matches", value:"^/assets/.*"}
    ],
    action_parameters:{ cache:{ edge_ttl:{ mode:"override_value", value:2592000 }, browser_ttl:{ mode:"override_value", value:2592000 } } }
  }')

existing_cache=$(cf_api GET "/zones/$ZONE_ID/rulesets?type=custom" \
  | jq -r --arg n "$RULE_NAME_CACHE" '.result[].rules[] | select(.name==$n) | .id' 2>/dev/null || echo "")
if [[ -z "$existing_cache" ]]; then
  [[ "$DRY_RUN" == "1" ]] || cf_api POST "/zones/$ZONE_ID/rulesets?type=custom" "$cache_rule_body" >/dev/null \
    && ok "Cache rule: $RULE_NAME_CACHE (30d edge TTL)"
fi

# ---------- Done ----------
echo
[[ "$DRY_RUN" == "1" ]] && {
  note "DRY-RUN completed: no changes applied. Re-run without DRY_RUN=1 to apply."
  exit 0
}
echo -e "${GREEN}✓ Cloudflare setup complete.${NC}"
echo
echo "Next steps:"
echo "  1. In Cloudflare dashboard → DNS → verify orange cloud on $CF_ZONE (A and CNAME)"
echo "  2. In Cloudflare dashboard → SSL/TLS → verify mode = Full"
echo "  3. Deploy HELIX: ./scripts/cf-deploy-netcup.sh"
echo "  4. Verify:     ./scripts/cf-smoke-test.sh"
echo "  5. (Optional)  Set up tenant custom hostname via Cloudflare dashboard"
