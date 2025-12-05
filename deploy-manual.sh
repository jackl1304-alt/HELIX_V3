#!/bin/bash
# HELIX V3 - Netcup Deploy (Interactive)
set -e

SERVER="root@152.53.191.99"
REMOTE_DIR="/opt/helix"

echo "🚀 HELIX V3 - Deployment nach Netcup"
echo "========================================"
echo ""

# 1. Create archive
echo "📦 Erstelle Deployment-Archiv..."
cd /workspaces/HELIX_V3
tar czf /tmp/helix-latest.tar.gz \
  dist/ \
  package.json \
  package-lock.json \
  server/ \
  client/ \
  shared/ \
  scripts/ \
  drizzle.config.ts \
  tsconfig.json \
  vite.config.ts \
  tailwind.config.ts \
  components.json

echo "✅ Archiv erstellt: $(du -h /tmp/helix-latest.tar.gz | cut -f1)"
echo ""

# 2. Upload
echo "📤 Uploade zu Server..."
echo "   Bitte Passwort eingeben: KkZrHw5wrJJnn6TH"
scp /tmp/helix-latest.tar.gz $SERVER:/tmp/

echo ""
echo "✅ Upload erfolgreich!"
echo ""

# 3. Deploy on server
echo "🚀 Deploye auf Server..."
echo "   Bitte nochmal Passwort eingeben: KkZrHw5wrJJnn6TH"
ssh $SERVER << 'ENDSSH'
set -e

echo "📁 Navigiere zu /opt/helix..."
cd /opt/helix || { mkdir -p /opt/helix && cd /opt/helix; }

echo "🛑 Stoppe laufende Services..."
pm2 stop helix 2>/dev/null || true
pm2 delete helix 2>/dev/null || true

echo "🗑️ Räume alte Files auf..."
rm -rf dist node_modules

echo "📦 Entpacke neuen Build..."
tar -xzf /tmp/helix-latest.tar.gz
rm /tmp/helix-latest.tar.gz

echo "📚 Installiere Dependencies..."
npm install --omit=dev

echo "🚀 Starte Anwendung..."
# Try bundled version first, fallback to tsx
if [ -f "dist/index.js" ]; then
  pm2 start dist/index.js --name helix --env production
else
  pm2 start tsx --name helix -- server/index.ts
fi

pm2 save

echo ""
echo "✅ Deployment abgeschlossen!"
echo ""
pm2 status
echo ""
pm2 logs helix --lines 20

ENDSSH

echo ""
echo "========================================"
echo "✅ DEPLOYMENT ERFOLGREICH!"
echo "========================================"
echo ""
echo "🌐 Anwendung läuft auf:"
echo "   http://152.53.191.99:5000"
echo ""
echo "📊 Logs anzeigen:"
echo "   ssh root@152.53.191.99"
echo "   pm2 logs helix"
echo ""
