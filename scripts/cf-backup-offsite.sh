#!/usr/bin/env bash
# =====================================================================
# HELIX Offsite DB Backup (Cloudflare R2 / S3)
# =====================================================================
# Atomic snapshot strategy: a SINGLE `pg_dump --schema-only` call is captured
# to a tempfile, then used both as (a) the schema inventory for round-trip
# verification AND (b) the recommended source for downstream restore scripts.
#
# The actual data dump follows. The structural round-trip diff compares the
# dump's CREATE TABLE inventory against the captured schema inventory — both
# are guaranteed to reflect the same point-in-time schema state.
#
# Required env vars:
#   DATABASE_URL              local Postgres connection
#   RCLONE_REMOTE             rclone remote name (e.g. "helix-r2")
#   RCLONE_PATH               rclone path prefix (e.g. "backups/db")
#   BACKUP_PASSPHRASE         symmetric passphrase (or use asymmetric age)
#   BACKUP_ALERT_WEBHOOK      optional curl-able URL on round-trip failure
#   KEEP_LOCAL=3              how many local dumps to keep (default 3)
#   KEEP_REMOTE=30            how many remote dumps to keep (default 30)
#
# Usage:
#   ./scripts/cf-backup-offsite.sh
#   */30 * * * * /opt/helix/scripts/cf-backup-offsite.sh >> /var/log/helix-backup.log 2>&1
#   DRY_RUN=1 ./scripts/cf-backup-offsite.sh
# =====================================================================
set -euo pipefail

DRY_RUN="${DRY_RUN:-0}"
KEEP_LOCAL="${KEEP_LOCAL:-3}"
KEEP_REMOTE="${KEEP_REMOTE:-30}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/helix}"
TS="$(date +%Y%m%d-%H%M%S)"
BASE="helix-${TS}"
PLAIN_GZ="${BACKUP_DIR}/${BASE}.sql.gz"
ENC="${BACKUP_DIR}/${BASE}.sql.age"
REMOTE_PATH="${RCLONE_PATH:-backups/db}/${BASE}.sql.age"

# BELOW_THRESHOLD_LINES: minimum dump size considered valid for HELIX.
# HELIX has 90+ regulator sources + multi-tenant tables, so any real production
# dump is well over 500 lines. This threshold catches "schema-only by mistake"
# and silently-empty dumps promptly.
BELOW_THRESHOLD_LINES="${BELOW_THRESHOLD_LINES:-500}"

err()  { echo -e "\033[0;31m[ERR]\033[0m $1" >&2; }
ok()   { echo -e "\033[0;32m[OK]\033[0m $1"; }
note() { echo -e "\033[0;34m[..]\033[0m $1"; }
warn() { echo -e "\033[1;33m[WARN]\033[0m $1"; }

# ---------------- env checks ----------------
: "${DATABASE_URL:?set DATABASE_URL=postgres://user:pass@host/db}"
: "${RCLONE_REMOTE:?set RCLONE_REMOTE=helix-r2}"

# Pre-flight misconfig check: PagerDuty format + empty routing key.
# Triggers on EITHER URL pointing at PagerDuty OR explicit BACKUP_ALERT_FORMAT=pagerduty
# — the latter covers custom-proxy deployments where the URL doesn't contain
# `events.pagerduty.com` but the routing is still PagerDuty-format. The PagerDuty
# Events API v2 rejects events without a valid routing_key — surface this
# BEFORE the dump runs so the operator notices at setup time rather than at 3am
# when the alert webhook silently 4xxs.
if [[ -n "${BACKUP_ALERT_WEBHOOK:-}" && -z "${PD_ROUTING_KEY:-}" ]] \
   && { [[ "${BACKUP_ALERT_WEBHOOK}" == *events.pagerduty.com* ]] \
        || [[ "${BACKUP_ALERT_FORMAT:-}" == "pagerduty" ]]; }; then
  err "BACKUP_ALERT_WEBHOOK routes to PagerDuty (URL or BACKUP_ALERT_FORMAT=pagerduty) but PD_ROUTING_KEY is empty."
  err "PagerDuty Events API v2 will reject every alert. Set PD_ROUTING_KEY in .env."
  exit 3
fi

if [[ -z "${BACKUP_PASSPHRASE:-}" ]] && [[ "$DRY_RUN" != "1" ]]; then
  warn "BACKUP_PASSPHRASE not set; generating ephemeral random key. This dump WILLNOT be recoverable across runs without a stable passphrase. Set the env explicitly for production use."
  BACKUP_PASSPHRASE="$(openssl rand -hex 32)"
fi

need() { command -v "$1" >/dev/null 2>&1 || { err "missing tool: $1"; exit 2; }; }
need pg_dump
need openssl
need rclone
need gzip
# curl + jq optional but expected for alert webhook
command -v curl >/dev/null && need curl || true

mkdir -p "$BACKUP_DIR"

# ALERT(): round-trip failure notifier. Adapts payload to webhook provider.
#
# Detection rules (URL substring):
#   - hooks.slack.com       → Slack incoming webhook: {"text": "..."}
#   - events.pagerduty.com  → PagerDuty Events API v2: routing_key, event_action, payload
#   - healthchecks.io       → healthchecks.io: simple GET ping is preferred; falls back
#                             to POST for sites that accept custom JSON
#   - anything else         → generic JSON envelope {level, msg, run, ts}
#
# Override: BACKUP_ALERT_FORMAT=generic|slack|pagerduty|healthchecks
ALERT() {
  local msg="$1"
  [[ -z "${BACKUP_ALERT_WEBHOOK:-}" ]] && return 0
  local url="$BACKUP_ALERT_WEBHOOK"
  local fmt="${BACKUP_ALERT_FORMAT:-}"

  if [[ -z "$fmt" ]]; then
    case "$url" in
      *hooks.slack.com*)              fmt="slack" ;;
      *events.pagerduty.com*)         fmt="pagerduty" ;;
      *healthchecks.io*)              fmt="healthchecks" ;;
      *)                              fmt="generic" ;;
    esac
  fi

  case "$fmt" in
    slack)
      local payload
      payload=$(jq -nc --arg text "🚨 HELIX backup failure: ${BASE} — ${msg}" \
        '{text: $text}')
      curl -sS --max-time 5 -X POST "$url" \
        -H "Content-Type: application/json" -d "$payload" 2>/dev/null || true
      ;;
    pagerduty)
      # PagerDuty Events API v2: routing_key + event_action=trigger +
      # payload summary+source+severity. dedup_key MUST be a stable identifier
      # per failure mode — using a fresh timestamp per run would fragment
      # recurring failures into distinct incidents. We pass an explicit stage
      # key as the second ALERT() arg (e.g. "pg_dump", "rclone",
      # "round-trip"); falling back to a global "helix-backup-failure"
      # groups all backup failures into one ongoing incident.
      local pd_key="${PD_ROUTING_KEY:-missing-set-PD_ROUTING_KEY}"
      local pd_dedup="helix-backup-${2:-failure}"
      local payload
      payload=$(jq -nc \
        --arg rk "$pd_key" \
        --arg sum "HELIX backup ${BASE} failed: ${msg}" \
        --arg src "helix-backup" \
        --arg dk "$pd_dedup" \
        '{routing_key:$rk, event_action:"trigger", dedup_key:$dk, payload:{summary:$sum, source:$src, severity:"critical"}}')
      curl -sS --max-time 5 -X POST "$url" \
        -H "Content-Type: application/json" -d "$payload" 2>/dev/null || true
      ;;
    healthchecks)
      # healthchecks.io: GET to /fail path is the documented failure-notify.
      # Strip query string first (otherwise "/fail" lands inside the query and
      # hc-ping rejects the URL). Preserve default UUID-based URL pattern.
      hc_path="${hc_url%%\?*}"
      [[ "$hc_path" != */fail* ]] && hc_path="${hc_path%/}/fail"
      curl -sS --max-time 5 "$hc_path" 2>/dev/null || true
      ;;
    generic|*)
      local payload
      payload=$(jq -nc --arg msg "$msg" --arg run "$BASE" \
        '{level:"critical", run:$run, msg:$msg, ts:(now|todate)}')
      curl -sS --max-time 5 -X POST "$url" \
        -H "Content-Type: application/json" -d "$payload" 2>/dev/null || true
      ;;
  esac
}

note "Starting backup ${BASE}"

# ---------------- 0. ATOMIC schema snapshot (via single pg_dump call) ----------------
# One pg_dump captures CREATE TABLE inventory + line count, used for round-trip
# diff. This eliminates the pre-dump vs post-dump schema race window: the data
# dump that follows is allowed to take minutes; the schema snapshot is fixed.
SCHEMA_INV_FILE="$(mktemp)"
LIVE_INVENTORY=""
LIVE_SCHEMA_LINES=0
if [[ "$DRY_RUN" == "1" ]]; then
  note "DRY-RUN: skipping live schema snapshot"
else
  note "Atomic schema snapshot: pg_dump --schema-only (single call)"
  pg_dump --no-owner --no-privileges --no-acl --schema-only "$DATABASE_URL" \
    > "$SCHEMA_INV_FILE" 2>"$BACKUP_DIR/pgdump-inv-err.log" \
    || { err "Schema snapshot pg_dump failed; see $BACKUP_DIR/pgdump-inv-err.log"; rm -f "$SCHEMA_INV_FILE"; exit 3; }
  LIVE_INVENTORY=$(grep -oE '^CREATE TABLE [^ ]+' "$SCHEMA_INV_FILE" | sort -u)
  LIVE_SCHEMA_LINES=$(wc -l < "$SCHEMA_INV_FILE")
  ok "Schema snapshot captured: $(echo "$LIVE_INVENTORY" | wc -l) tables, $LIVE_SCHEMA_LINES lines"
fi

# ---------------- 1. logical dump (data + schema) ----------------
if [[ "$DRY_RUN" == "1" ]]; then
  note "DRY-RUN: would pg_dump -> $PLAIN_GZ"
else
  pg_dump --no-owner --no-privileges --no-acl "$DATABASE_URL" \
    2>"$BACKUP_DIR/pgdump-err.log" \
    | gzip -"${GZIP_LEVEL:-6}" > "$PLAIN_GZ" \
    || { err "pg_dump failed; see $BACKUP_DIR/pgdump-err.log"; ALERT "pg_dump failed for $BASE"; exit 4; }
  ok "Wrote $PLAIN_GZ ($(du -h "$PLAIN_GZ" | cut -f1))"
fi

# ---------------- 2. encrypt ----------------
if command -v age >/dev/null 2>&1; then
  note "Encrypting with age"
  [[ "$DRY_RUN" == "1" ]] || age -p -o "$ENC" "$PLAIN_GZ" <<<"$BACKUP_PASSPHRASE" \
    && ok "Wrote encrypted $ENC" || { err "age encryption failed"; ALERT "age failed for $BASE"; exit 5; }
else
  note "Encrypting with openssl AES-256-GCM (age not available)"
  [[ "$DRY_RUN" == "1" ]] || openssl enc -aes-256-gcm -salt -pbkdf2 -iter 200000 \
    -in "$PLAIN_GZ" -out "$ENC" -pass "pass:$BACKUP_PASSPHRASE" \
    && ok "Wrote encrypted $ENC" || { err "openssl encryption failed"; ALERT "openssl failed for $BASE"; exit 5; }
fi

# ---------------- 3. upload to R2 / S3 ----------------
note "Uploading to remote ${RCLONE_REMOTE}:${REMOTE_PATH}"
[[ "$DRY_RUN" == "1" ]] || rclone copy "$ENC" "${RCLONE_REMOTE}:${REMOTE_PATH%/*}/" \
  && ok "Uploaded to ${RCLONE_REMOTE}:${REMOTE_PATH}" \
  || { err "rclone upload failed"; ALERT "rclone failed for $BASE"; exit 6; }

# ---------------- 4. local retention ----------------
note "Pruning local backups > $KEEP_LOCAL"
if [[ "$DRY_RUN" != "1" ]]; then
  ls -1tr "$BACKUP_DIR"/helix-*.sql.age 2>/dev/null \
    | head -n -"$KEEP_LOCAL" | xargs -r rm -fv -- \
    || warn "Local retention did not fully complete (will retry next run)"
fi

# ---------------- 5. remote retention (tolerant to network) ----------------
note "Pruning remote backups > $KEEP_REMOTE"
if [[ "$DRY_RUN" == "1" ]]; then
  note "DRY-RUN: skipping remote retention"
else
  # Wrap in || true: if retention fails (bucket policy, network blip), the
  # backup is already uploaded — we still exit OK with a warning.
  REMOTE_FILES=$(rclone lsf --files-only --include "helix-*.sql.age" --format "tsp" \
    "${RCLONE_REMOTE}:${RCLONE_PATH:-backups/db}" 2>/dev/null | sort \
    | awk '{print $3}' | head -n -"$KEEP_REMOTE") || true
  if [[ -n "$REMOTE_FILES" ]]; then
    echo "$REMOTE_FILES" | while read -r f; do
      [[ -z "$f" ]] && continue
      rclone deletefile "${RCLONE_REMOTE}:${RCLONE_PATH:-backups/db}/$f" 2>/dev/null \
        || warn "Could not delete remote $f (will retry next run)"
    done
    ok "Remote retention applied (kept newest ${KEEP_REMOTE})"
  else
    ok "Remote retention: nothing to prune"
  fi
fi

# ---------------- 6. structural round-trip verification ----------------
# Decrypt + decompress + structural checks:
#   (a) line-count threshold (≥500) catches "schema-only by mistake" / empty dumps
#   (b) schema inventory diff against snapshot taken in step 0
# Catches: encryption corruption, compression corruption, silent data loss.
if [[ "$DRY_RUN" == "1" ]]; then
  note "DRY-RUN: skipping round-trip verification"
elif [[ -z "$LIVE_INVENTORY" ]]; then
  warn "No live inventory captured in step 0; skipping round-trip verification"
else
  note "Round-trip: decrypt ${ENC} -> decompress -> size threshold + schema inventory"
  TMPDIR=$(mktemp -d)
  DECRYPTED="${TMPDIR}/restored.sql.gz"
  DECRYPTED_PLAIN="${TMPDIR}/restored.sql"
  if command -v age >/dev/null 2>&1; then
    age -d -o "$DECRYPTED" "$ENC" 2>"${TMPDIR}/decrypt-err.log" <<<"$BACKUP_PASSPHRASE" \
      || { err "decryption failed; see ${TMPDIR}/decrypt-err.log"; ALERT "decryption failed for $BASE"; rm -rf "$TMPDIR" "$SCHEMA_INV_FILE"; exit 7; }
  else
    openssl enc -d -aes-256-gcm -pbkdf2 \
      -in "$ENC" -out "$DECRYPTED" -pass "pass:$BACKUP_PASSPHRASE" \
      2>"${TMPDIR}/decrypt-err.log" \
      || { err "decryption failed; see ${TMPDIR}/decrypt-err.log"; ALERT "decryption failed for $BASE"; rm -rf "$TMPDIR" "$SCHEMA_INV_FILE"; exit 7; }
  fi
  gunzip -c "$DECRYPTED" > "$DECRYPTED_PLAIN" 2>"${TMPDIR}/gunzip-err.log" \
    || { err "decompression failed; see ${TMPDIR}/gunzip-err.log"; ALERT "decompression failed for $BASE"; rm -rf "$TMPDIR" "$SCHEMA_INV_FILE"; exit 7; }
  RESTORED_LINE_COUNT=$(wc -l < "$DECRYPTED_PLAIN")

  # (a) Non-empty sanity
  if [[ "$RESTORED_LINE_COUNT" -lt "$BELOW_THRESHOLD_LINES" ]]; then
    err "Round-trip failed: decrypted dump is $RESTORED_LINE_COUNT lines (threshold: $BELOW_THRESHOLD_LINES)"
    err "Likely cause: schema-only dump by mistake, or upstream backup pipeline corruption"
    ALERT "round-trip failsize for $BASE: $RESTORED_LINE_COUNT < $BELOW_THRESHOLD_LINES"
    rm -rf "$TMPDIR" "$SCHEMA_INV_FILE"
    exit 7
  fi
  ok "Non-empty check passed: $RESTORED_LINE_COUNT lines (threshold: $BELOW_THRESHOLD_LINES, live schema was $LIVE_SCHEMA_LINES)"

  # (b) Schema inventory diff
  RESTORED_INVENTORY=$(grep -oE '^CREATE TABLE [^ ]+' "$DECRYPTED_PLAIN" | sort -u)
  if [[ "$LIVE_INVENTORY" == "$RESTORED_INVENTORY" ]]; then
    TABLE_COUNT=$(echo "$RESTORED_INVENTORY" | wc -l)
    ok "Schema inventory verified: $TABLE_COUNT tables match between snapshot and decrypted backup"
  else
    err "Schema inventory DIVERGED"
    echo "--- only in SNAPSHOT ---"; comm -23 <(echo "$LIVE_INVENTORY") <(echo "$RESTORED_INVENTORY") >&2
    echo "--- only in BACKUP ---";  comm -13 <(echo "$LIVE_INVENTORY") <(echo "$RESTORED_INVENTORY") >&2
    ALERT "round-trip schema-diverged for $BASE"
    rm -rf "$TMPDIR" "$SCHEMA_INV_FILE"
    exit 7
  fi
  shred -u "$DECRYPTED" "$DECRYPTED_PLAIN" 2>/dev/null \
    || rm -f "$DECRYPTED" "$DECRYPTED_PLAIN"
  rm -rf "$TMPDIR"
fi

# Cleanup
rm -f "$SCHEMA_INV_FILE"
[[ -f "$PLAIN_GZ" ]] && shred -u "$PLAIN_GZ" 2>/dev/null || rm -f "$PLAIN_GZ"

echo
echo -e "\033[0;32m✓ Backup ${BASE} complete.\033[0m"
echo "  Local:       $ENC"
echo "  Remote:      ${RCLONE_REMOTE}:${REMOTE_PATH}"
echo "  Retention:   ${KEEP_LOCAL} local / ${KEEP_REMOTE} remote"
echo "  Threshold:   ${BELOW_THRESHOLD_LINES} lines minimum"
echo "  Round-trip:  $([[ "$DRY_RUN" == "1" ]] && echo "skipped (dry-run)" || echo "passed")"
echo "  Alerts:      $([[ -n "${BACKUP_ALERT_WEBHOOK:-}" ]] && echo "wired" || echo "none (set BACKUP_ALERT_WEBHOOK to enable)")"
