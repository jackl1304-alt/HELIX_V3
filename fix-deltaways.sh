#!/bin/bash
# Direkt auf dem Server überprüfen und ggf. starten

ssh -t root@deltaways-helix.de bash << 'ENDSSH'

echo "🔍 HELIX V3 Status auf www.deltaways-helix.de"
echo "═══════════════════════════════════════════════════════════════"

cd /var/www/helix.deltaways.de

echo ""
echo "📁 Verzeichnis:"
ls -la | head -15

echo ""
echo "📋 npm start:"
echo "   Testing npm start command..."
timeout 5 npm start 2>&1 | head -20 || echo "   (Timeout oder Error)"

echo ""
echo "🔄 Starte mit direktem Node:"
if [ -f "dist/index.js" ]; then
    echo "   dist/index.js vorhanden ✓"
    timeout 5 node dist/index.js 2>&1 | head -15 || echo "   (Started...)"
else
    echo "   dist/index.js NICHT GEFUNDEN"
    ls -la dist/ | head -20
fi

ENDSSH
