#!/usr/bin/env bash
# =====================================================================
# HELIX Netcup-side deploy
# =====================================================================
# Pushes the HELIX repository to your Netcup VPS, rebuilds and restarts
# Docker containers, then triggers the smoke test.
#
# Required env vars:
#   NETCUP_SSH_HOST        e.g. root@helix.deltaways.de or root@1.2.3.4
#   NETCUP_SSH_KEY         path to SSH key (default $HOME/.ssh/id_ed25519)
#   NETCUP_APP_DIR         absolute path on the VPS where HELIX lives
#                          (default: /opt/helix)
#
# Optional:
#   SKIP_SMOKE=1           skip the post-deploy smoke test
#   SKIP_BUILD=1           skip the npm build (use existing dist/)
#   KEEP_RELEASES=3        how many release archives to keep (default 3)
#
# Usage:
#   NETCUP_SSH_HOST=root@1.2.3.4 ./scripts/cf-deploy-netcup.sh
#   SKIP_SMOKE=1 NETCUP_SSH_HOST=root@1.2.3.4 ./scripts/cf-deploy-netcup.sh
# =====================================================================
set -u
set -o pipefail

err()  { echo -e "\033[0;31m[ERR]\033[0m $1" >&2; }
ok()   { echo -e "\033[0;32m[OK]\033[0m $1"; }
note() { echo -e "\033[0;34m[..]\033[0m $1"; }
warn() { echo -e "\033[1;33m[WARN]\033[0m $1"; }

# ---------------- env checks ----------------
: "${NETCUP_SSH_HOST:?set NETCUP_SSH_HOST=root@1.2.3.4}"
: "${NETCUP_APP_DIR:=${NETCUP_APP_DIR:-/opt/helix}}"
: "${NETCUP_SSH_KEY:=${NETCUP_SSH_KEY:-$HOME/.ssh/id_ed25519}}"
: "${KEEP_RELEASES:=3}"
: "${SKIP_SMOKE:=0}"
: "${SKIP_BUILD:=0}"

need() { command -v "$1" >/dev/null 2>&1 || { err "missing local tool: $1"; exit 2; }; }
need ssh; need rsync; need tar

[[ -f "$NETCUP_SSH_KEY" ]] || { err "SSH key not found: $NETCUP_SSH_KEY"; exit 2; }
SSH_OPTS=(-i "$NETCUP_SSH_KEY" -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10)

# Verify SSH reachability
note "Probing SSH to $NETCUP_SSH_HOST"
if ! ssh "${SSH_OPTS[@]}" "$NETCUP_SSH_HOST" true 2>/dev/null; then
  err "cannot reach $NETCUP_SSH_HOST via SSH with key $NETCUP_SSH_KEY"; exit 3
fi
ok "SSH reachable"

# ---------------- build locally (optional) ----------------
RELEASE="helix-$(date +%Y%m%d-%H%M%S).tar.gz"
RELEASE_PATH="/tmp/$RELEASE"

if [[ "$SKIP_BUILD" != "1" ]]; then
  note "Building HELIX dist locally (npm run build)"
  if ! npm run build 2>&1 | tail -20; then
    err "npm run build failed"; exit 4
  fi
  ok "Build complete"
else
  ok "Skipping local build, using existing dist/"
fi

# ---------------- package ----------------
note "Packaging release: $RELEASE"
EXCLUDES=(
  --exclude=node_modules
  --exclude=.git
  --exclude='dist/public/.vite'
  --exclude=logs
  --exclude=attached_assets
  --exclude=.npm-cache
  --exclude='*.tar.gz'
)
tar "${EXCLUDES[@]}" -czf "$RELEASE_PATH" . || { err "tar failed"; exit 5; }
SIZE=$(du -h "$RELEASE_PATH" | cut -f1)
ok "Packaged $SIZE -> $RELEASE_PATH"

# ---------------- upload via rsync-over-ssh ----------------
note "Uploading to $NETCUP_SSH_HOST:$NETCUP_APP_DIR/releases/"
ssh "${SSH_OPTS[@]}" "$NETCUP_SSH_HOST" "mkdir -p $NETCUP_APP_DIR/releases"
rsync -az -e "ssh ${SSH_OPTS[*]}" "$RELEASE_PATH" "$NETCUP_SSH_HOST:$NETCUP_APP_DIR/releases/" || {
  err "rsync upload failed"; exit 6
}
ok "Upload complete"

# ---------------- swap & restart on remote ----------------
note "Switching active release and restarting containers"
REMOTE_CMD=$(cat <<SSH_EOF
set -e
cd "\$NETCUP_APP_DIR"
mv "releases/$RELEASE" "releases/$RELEASE" 2>/dev/null || true
ln -sfn "releases/$RELEASE" release-current.tar.gz
rm -rf current && mkdir current
tar -xzf release-current.tar.gz -C current

# Prune old releases (keep last KEEP_RELEASES)
cd releases
ls -1tr | head -n -\$KEEP_RELEASES | xargs -r rm --
cd ..

# Restart HELIX via docker compose using the .env in the unpacked release
cd current
docker compose --env-file ./.env up -d --build --remove-orphans
echo "Containers restarted. Health-check follows."
sleep 10

HEALTH=\$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://localhost:5000/health)
echo "Local /health status: \$HEALTH"
if [ "\$HEALTH" != "200" ]; then
  echo "WARN: local /health did not return 200; inspect docker logs"
  docker compose logs --tail=100 | tail -40
  exit 7
fi
echo "Deployment finished."
SSH_EOF
)

ssh "${SSH_OPTS[@]}" "$NETCUP_SSH_HOST" "export NETCUP_APP_DIR='$NETCUP_APP_DIR' KEEP_RELEASES='$KEEP_RELEASES' && bash -s" <<<"$REMOTE_CMD" || {
  err "remote swap/restart failed"; exit 7
}
ok "Containers restarted and local /health responds"

# ---------------- post-deploy smoke test ----------------
if [[ "$SKIP_SMOKE" != "1" ]]; then
  echo
  note "Running smoke test (URL=... or TEST_AUTH=1 to enable more checks)"
  if [[ -x "./scripts/cf-smoke-test.sh" ]]; then
    TEST_AUTH="${TEST_AUTH:-0}" ./scripts/cf-smoke-test.sh || {
      warn "smoke test reported failures; investigate via ./scripts/cf-smoke-test.sh -v"
    }
  else
    warn "scripts/cf-smoke-test.sh not found or not executable; skipping smoke test"
  fi
fi

echo
echo -e "\033[0;32m✓ Deploy complete.\033[0m"
echo "Active release: releases/$RELEASE"
echo "Smoke test:     ./scripts/cf-smoke-test.sh URL=https://$CF_ZONE"
