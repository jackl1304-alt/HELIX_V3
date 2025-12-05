#!/bin/bash
# Check HELIX status on deltaways-helix.de

echo "🔍 Prüfe HELIX V3 auf www.deltaways-helix.de"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Warte auf Server-Start
echo "⏳ Warte auf Server-Start (max 60 Sekunden)..."
for i in {1..30}; do
    if curl -sk https://www.deltaways-helix.de/health 2>/dev/null | grep -q "status\|health" || curl -sk http://152.53.191.99:5000/health 2>/dev/null | grep -q "status\|health"; then
        echo "✅ Server läuft!"
        break
    fi
    echo -n "."
    sleep 2
done

echo ""
echo ""
echo "📊 SERVER STATUS"
echo "─────────────────────────────────────────"

# Test HTTPS
echo "🌐 HTTPS-Test..."
STATUS=$(curl -sk -o /dev/null -w "%{http_code}" https://www.deltaways-helix.de/)
echo "   Status: $STATUS"

if [ "$STATUS" = "200" ]; then
    echo "   ✅ Anwendung lädt"
elif [ "$STATUS" = "502" ]; then
    echo "   ⏳ App startet noch (502 Bad Gateway)"
else
    echo "   ⚠️  Status: $STATUS"
fi

echo ""
echo "🔗 API-Endpoints:"
echo "   GET /health                      $(curl -sk -o /dev/null -w '%{http_code}' https://www.deltaways-helix.de/health)"
echo "   GET /api/health                  $(curl -sk -o /dev/null -w '%{http_code}' https://www.deltaways-helix.de/api/health)"
echo "   GET /api/regulatory-updates      $(curl -sk -o /dev/null -w '%{http_code}' https://www.deltaways-helix.de/api/regulatory-updates)"
echo ""

# Remote-Status
echo "📋 Remote Server Status:"
echo "─────────────────────────────────────────"
ssh root@deltaways-helix.de << 'ENDSSH' 2>/dev/null || echo "SSH-Fehler"
echo "PM2 Status:"
pm2 status 2>/dev/null || echo "  (PM2 nicht aktiv)"

echo ""
echo "Prozesse:"
ps aux | grep -E 'node|npm' | grep -v grep | head -3 || echo "  Keine Prozesse gefunden"

echo ""
echo "Port 5000:"
netstat -tlnp 2>/dev/null | grep 5000 || echo "  Port 5000 nicht gebunden"

ENDSSH

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🎯 ZUGANG:"
echo "   URL:   https://www.deltaways-helix.de"
echo "   Admin: https://www.deltaways-helix.de/admin"
echo "   Data:  https://www.deltaways-helix.de/admin/sources"
echo ""
