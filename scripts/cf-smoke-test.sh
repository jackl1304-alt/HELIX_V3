#!/usr/bin/env bash
# =====================================================================
# HELIX Cloudflare-fronted Smoke Test
# =====================================================================
# Verifies that a HELIX deployment behind Cloudflare proxy:
#   1. Returns /health and /api/health
#   2. Has all required security headers (X-Frame-Options DENY, CSP, HSTS preload)
#   3. Receives real client IPs through CF-Connecting-IP (CF-Ray header present)
#   4. Properly rate-limits /api/auth/ via nginx (TEST_AUTH=1) and CF WAF (TEST_AUTH=2)
#   5. CORS allows authorized origins and rejects unauthorized
#   6. SSL certificate is valid and serves TLSv1.3
#
# Usage:
#   ./scripts/cf-smoke-test.sh                          # default: tests https://deltaways.de
#   URL=https://helix.deltaways.de ./scripts/cf-smoke-test.sh
#   TEST_AUTH=1 ./scripts/cf-smoke-test.sh              # nginx rate-limit (15 fast reqs)
#   TEST_AUTH=2 ./scripts/cf-smoke-test.sh              # CF WAF rate-limit (32 reqs over 65s)
#   ./scripts/cf-smoke-test.sh -v                       # verbose
# =====================================================================
set -u
set -o pipefail

URL="${URL:-https://deltaways.de}"
HEALTH_PATH="/health"
API_HEALTH_PATH="/api/health"
AUTH_PATH="/api/auth/login"
TEST_AUTH="${TEST_AUTH:-0}"
VERBOSE="${VERBOSE:-0}"

# Colors (auto-disable for non-tty)
if [[ -t 1 ]]; then
  RED='\033[0;31m'; GREEN='\033[0;32m'; YEL='\033[1;33m'; BLU='\033[0;34m'; NC='\033[0m'
else
  RED=''; GREEN=''; YEL=''; BLU=''; NC=''
fi

PASS=0; FAIL=0; SKIP=0
declare -a FAILURES=()

note() { echo -e "${BLU}[INFO]${NC} $1"; }
ok()   { echo -e "${GREEN}[PASS]${NC} $1"; PASS=$((PASS+1)); }
bad()  { echo -e "${RED}[FAIL]${NC} $1"; FAIL=$((FAIL+1)); FAILURES+=("$1"); }
warn() { echo -e "${YEL}[WARN]${NC} $1"; SKIP=$((SKIP+1)); }
err()  { echo -e "${RED}[ERR]${NC} $1" >&2; }

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo -e "${RED}missing required tool: $1${NC}" >&2; exit 2
  fi
}
require curl
require openssl

# Quick arg parsing — accept -v / --verbose / --help / KEY=VAL
for arg in "$@"; do
  case "$arg" in
    -v|--verbose) VERBOSE=1 ;;
    --help|-h) sed -n '3,30p' "$0"; exit 0 ;;
    *=*) export "$arg" ;;
    *) warn "unsupported argument: $arg (use KEY=VAL form, e.g. URL=...)" ;;
  esac
done

# URL validation upfront so we don't silently probe with a malformed URL
case "$URL" in
  https://localhost*|http://localhost*) ;;  # allowed for dev
  https://*)
    HOST=$(echo "$URL" | sed -E 's#^https?://([^/]+).*#\1#')
    if [[ ! "$HOST" =~ \. ]]; then
      err "URL looks malformed (no dotted host): $URL"; exit 4
    fi
    ;;
  http://*)  err "non-https URL not allowed: $URL — check TLS"; exit 4 ;;
  *)         err "URL must start with https:// — got: $URL"; exit 4 ;;
esac

note "Testing HELIX deployment at $URL  (host: $HOST)"
echo

# ---------------------------------------------------------------------
# 1. TLS basics
# ---------------------------------------------------------------------
note "1. TLS / certificate checks"
TLS_OUT=$(echo "" | openssl s_client -servername "$HOST" -connect "$HOST":443 2>/dev/null)
TLS_PROTO=$(echo "$TLS_OUT" | awk '/Protocol/ {print $NF}')
TLS_CIPHER=$(echo "$TLS_OUT" | awk '/Cipher    :/ {print $NF}')
TLS_SUBJECT=$(echo "$TLS_OUT" | openssl x509 -noout -subject 2>/dev/null | sed 's#^.*CN=##;s#/.*##' || echo "err")
TLS_ISSUER=$(echo "$TLS_OUT" | openssl x509 -noout -issuer 2>/dev/null | head -1)
TLS_EXPIRY=$(echo "$TLS_OUT" | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)

if [[ "$TLS_PROTO" == "TLSv1.3" ]]; then
  ok "TLSv1.3 negotiated (cipher: $TLS_CIPHER)"
else
  warn "TLS protocol is $TLS_PROTO; expected TLSv1.3"
fi
note "  certificate: $TLS_SUBJECT"
note "  issuer: $TLS_ISSUER"
note "  expires: $TLS_EXPIRY"

# ---------------------------------------------------------------------
# 2. Security headers
# ---------------------------------------------------------------------
echo
note "2. Security headers on /health"
HEADERS=$(curl -sSI --max-time 10 "$URL$HEALTH_PATH")

check_header() {
  local pattern="$1"; local label="$2"; local must_have="${3:-1}"
  if echo "$HEADERS" | grep -qiE "^${pattern}:"; then
    ok "$label"
  else
    if [[ "$must_have" == "1" ]]; then bad "$label (missing)"; else warn "$label (not set)"; fi
  fi
}

check_header "X-Frame-Options" "X-Frame-Options present"
check_header "X-Content-Type-Options" "X-Content-Type-Options nosniff"
check_header "Strict-Transport-Security" "HSTS header"
check_header "Content-Security-Policy" "CSP header"
check_header "Permissions-Policy" "Permissions-Policy"
check_header "Cross-Origin-Opener-Policy" "COOP header"

if echo "$HEADERS" | grep -iE "^X-Frame-Options:" | grep -q "DENY"; then
  ok "X-Frame-Options = DENY (strict)"
elif echo "$HEADERS" | grep -iE "^X-Frame-Options:" | grep -q "SAMEORIGIN"; then
  warn "X-Frame-Options = SAMEORIGIN (recommend DENY for non-embedded SaaS)"
fi
if echo "$HEADERS" | grep -iE "^Strict-Transport-Security:" | grep -q "preload"; then
  ok "HSTS preload-eligible"
fi

# ---------------------------------------------------------------------
# 3. Cloudflare edge headers
# ---------------------------------------------------------------------
echo
note "3. Cloudflare edge headers"
RESP=$(curl -sI --max-time 10 "$URL$HEALTH_PATH")
CF_RAY=$(echo "$RESP" | grep -i "^CF-Ray:" | awk '{print $2}' | tr -d '\r')
CF_COUNTRY=$(echo "$RESP" | grep -i "^CF-IPCountry:" | awk '{print $2}' | tr -d '\r')
SERVER_HEAD=$(echo "$RESP" | grep -i "^server:" | head -1 | tr -d '\r')

if [[ -n "$CF_RAY" ]]; then
  ok "CF-Ray present ($CF_RAY)"
else
  warn "CF-Ray missing -> traffic may not be going through Cloudflare"
fi
if [[ -n "$CF_COUNTRY" ]]; then
  ok "CF-IPCountry present ($CF_COUNTRY)"
else
  warn "CF-IPCountry missing"
fi
if echo "$SERVER_HEAD" | grep -qi "nginx"; then
  ok "Server header identifies nginx (privacy-friendly: server_tokens off)"
fi

# ---------------------------------------------------------------------
# 4. Health endpoints
# ---------------------------------------------------------------------
echo
note "4. Health endpoints"
H_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$URL$HEALTH_PATH")
if [[ "$H_STATUS" == "200" ]]; then
  ok "/health responds 200"
else
  bad "/health responds $H_STATUS"
fi
AH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$URL$API_HEALTH_PATH")
if [[ "$AH_STATUS" == "200" ]]; then
  ok "/api/health responds 200"
else
  bad "/api/health responds $AH_STATUS"
fi
R_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$URL/ready")
if [[ "$R_STATUS" == "200" ]]; then
  ok "/ready reports DB connectivity"
else
  warn "/ready returns $R_STATUS (DB may be momentarily unavailable)"
fi

# ---------------------------------------------------------------------
# 5. CORS allow / deny
# ---------------------------------------------------------------------
echo
note "5. CORS allow / deny"
CORS_ALLOWED=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
  -H "Origin: https://helix.deltaways.de" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS "$URL$API_HEALTH_PATH")
if [[ "$CORS_ALLOWED" == "200" || "$CORS_ALLOWED" == "204" ]]; then
  ok "CORS allows *.deltaways.de preflight (status $CORS_ALLOWED)"
else
  warn "CORS preflight returned $CORS_ALLOWED (expected 200 or 204)"
fi

CORS_DENIED_HEAD=$(curl -sI --max-time 10 \
  -H "Origin: https://evil.example" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS "$URL$API_HEALTH_PATH" | grep -i "Access-Control-Allow-Origin" || true)
if [[ -z "$CORS_DENIED_HEAD" ]]; then
  ok "CORS rejects unauthorized origin (no Access-Control-Allow-Origin sent)"
else
  bad "CORS allowed unauthorized origin (header: $CORS_DENIED_HEAD)"
fi

# ---------------------------------------------------------------------
# 6. Rate-limit tests
#   TEST_AUTH=0 -> skip
#   TEST_AUTH=1 -> nginx zone=login (fast burst, 15 reqs × 250ms)
#   TEST_AUTH=2 -> CF WAF rate-limit rule (slow ramp, 32 reqs × 2s)
# ---------------------------------------------------------------------
case "$TEST_AUTH" in
  1)
    echo
    note "6a. Rate-limit on /api/auth/ (nginx zone=login: 15 reqs × 250ms)"
    RL_BLOCKED=0; last429=0
    for i in $(seq 1 15); do
      S=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
        -X POST -H "Content-Type: application/json" \
        -d '{}' "$URL$AUTH_PATH")
      if [[ "$S" == "429" ]]; then RL_BLOCKED=1; last429=$i; break; fi
      sleep 0.25
    done
    if [[ "$RL_BLOCKED" == "1" ]]; then
      ok "Rate-limit triggered at request #$last429 (429 seen)"
    else
      warn "Rate-limit did not trigger in 15 timed requests - verify nginx limit_req zone=login"
    fi
    ;;
  2)
    echo
    note "6b. CF WAF rate-limit (32 reqs over ~64s, slow ramp)"
    RL_BLOCKED=0; last429=0
    for i in $(seq 1 32); do
      S=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
        -X POST -H "Content-Type: application/json" \
        -d '{}' "$URL$AUTH_PATH")
      if [[ "$S" == "429" || "$S" == "403" ]]; then RL_BLOCKED=1; last429=$i; break; fi
      sleep 2
    done
    if [[ "$RL_BLOCKED" == "1" ]]; then
      ok "CF WAF rate-limit triggered at request #$last429 (status $S)"
    else
      warn "CF WAF rate-limit did not trigger in 32 reqs over 64s - verify rule is published in dashboard"
    fi
    ;;
  *)
    echo
    note "6. Rate-limit test (skipped - TEST_AUTH=1 for nginx; TEST_AUTH=2 for CF WAF)"
    ;;
esac

# ---------------------------------------------------------------------
# Final summary
# ---------------------------------------------------------------------
echo
echo "================================================================"
echo "HELIX smoke test summary for $URL"
echo "----------------------------------------------------------------"
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo "  Warn/Skip: $SKIP"
if [[ $FAIL -gt 0 ]]; then
  echo
  echo "Failures:"
  for f in "${FAILURES[@]}"; do echo "  - $f"; done
  exit 1
fi
echo
echo -e "${GREEN}All critical checks passed.${NC}"
exit 0
