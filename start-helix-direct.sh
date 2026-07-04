#!/bin/bash
# Start HELIX on deltaways-helix.de directly

# SSH-Befehl ohne TTY - direkter Start
ssh root@deltaways-helix.de << 'ENDSSH' 2>&1 &
cd /var/www/helix.deltaways.de

# Prüfe ob alles da ist
echo "📁 Checking files..."
ls -la | grep -E "dist|package|node_modules" | head -5

echo ""
echo "🔄 Stop alte Prozesse..."
pm2 stop helix 2>/dev/null || true
pkill -f "node dist/index.js" 2>/dev/null || true

echo "🚀 Starte Node.js Server..."
cd /var/www/helix.deltaways.de

# Direkter Node-Start (nicht über npm)
if [ -f "dist/index.js" ]; then
    nohup node dist/index.js > /tmp/helix.log 2>&1 &
    echo "✅ Node started (PID: $!)"
    sleep 2
    echo "📊 Check Logs:"
    tail -10 /tmp/helix.log
else
    echo "❌ dist/index.js not found!"
    ls -la dist/ | head -10
fi

ENDSSH

sleep 3
echo ""
echo "✅ Server sollte nun starten..."
echo ""
echo "Test in 5 Sekunden:"
sleep 5
curl -k https://www.deltaways-helix.de/ 2>/dev/null | head -20 || echo "Noch nicht bereit..."
