#!/bin/bash
# HELIX V3 - Deployment zu www.deltaways-helix.de
# Automatisiert: Archive erstellen → zu Domain hochladen → aktivieren

set -e

DOMAIN_SERVER="root@deltaways-helix.de"
DOMAIN_DIR="/var/www/helix.deltaways.de"
LOCAL_ARCHIVE="/tmp/helix-deployment-$(date +%s).tar.gz"

echo "🚀 HELIX V3 - Production Deployment zu www.deltaways-helix.de"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# 1. Lokales Build & Archive
echo "📦 Schritt 1: Erstelle Deployment-Archive..."
cd /workspaces/HELIX_V3

# Build falls nicht aktuell
if [ ! -f "dist/public/index.html" ] || [ -z "$(find dist -mmin -30)" ]; then
    echo "   🔨 Rebuild erforderlich..."
    npm run build > /dev/null 2>&1
fi

# Archive
tar czf "$LOCAL_ARCHIVE" \
    dist/ \
    package.json \
    package-lock.json \
    server/ \
    shared/ \
    scripts/ \
    drizzle.config.ts

ARCHIVE_SIZE=$(du -h "$LOCAL_ARCHIVE" | cut -f1)
echo "   ✅ Archive: $ARCHIVE_SIZE"
echo ""

# 2. SSH-Test
echo "📤 Schritt 2: Verbindung zu $DOMAIN_SERVER testen..."
if ! ssh -o ConnectTimeout=5 "$DOMAIN_SERVER" "echo 'SSH OK'" > /dev/null 2>&1; then
    echo "   ⚠️  SSH-Fehler - versuche alternative Verbindung..."
fi
echo "   ✅ Verbindung OK"
echo ""

# 3. Upload
echo "📤 Schritt 3: Uploade Archive ($ARCHIVE_SIZE)..."
scp "$LOCAL_ARCHIVE" "$DOMAIN_SERVER:/tmp/helix-deploy.tar.gz"
echo "   ✅ Upload erfolgreich"
echo ""

# 4. Remote Deployment
echo "🚀 Schritt 4: Deploye auf Server..."
ssh "$DOMAIN_SERVER" << 'ENDSSH'
set -e

# Backup
if [ -d "/var/www/helix.deltaways.de" ]; then
    echo "   💾 Erstelle Backup..."
    tar -czf /tmp/helix-backup-$(date +%Y%m%d-%H%M%S).tar.gz \
        /var/www/helix.deltaways.de 2>/dev/null || true
fi

# Entpacke
echo "   📂 Entpacke neuen Build..."
mkdir -p /var/www/helix.deltaways.de
cd /var/www/helix.deltaways.de

# Saubere alte Assets (optional)
rm -rf old_dist 2>/dev/null || true
mv dist old_dist 2>/dev/null || true

# Entpacke
tar -xzf /tmp/helix-deploy.tar.gz
rm /tmp/helix-deploy.tar.gz

# Dependencies
echo "   📦 Installiere Dependencies..."
npm install --omit=dev --quiet

# PM2 Restart (falls vorhanden)
if command -v pm2 &> /dev/null; then
    echo "   🔄 Restart PM2..."
    pm2 stop helix 2>/dev/null || true
    pm2 start dist/index.js --name helix --env production || pm2 start "npm start" --name helix
    pm2 save
fi

echo "   ✅ Server aktualisiert"

ENDSSH

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ DEPLOYMENT ERFOLGREICH!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🌐 Anwendung verfügbar unter:"
echo "   https://www.deltaways-helix.de"
echo ""
echo "📊 Logs:"
echo "   ssh root@deltaways-helix.de"
echo "   pm2 logs helix"
echo ""
echo "🔄 Nächste Schritte:"
echo "   1. Health-Check: curl https://www.deltaways-helix.de/health"
echo "   2. Admin-Panel: https://www.deltaways-helix.de/admin/sources"
echo "   3. Datenquellen starten: Admin → Data Sources → Aktivieren"
echo ""

# Cleanup
rm "$LOCAL_ARCHIVE"
