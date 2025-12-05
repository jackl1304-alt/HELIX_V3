#!/bin/bash
# Check server status on Netcup
ssh root@152.53.191.99 << 'ENDSSH'
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📝 Letzte Logs (50 Zeilen):"
pm2 logs helix --lines 50 --nostream

echo ""
echo "🔧 Prozesse:"
ps aux | grep -E 'node|tsx|helix' | grep -v grep

echo ""
echo "🌐 Port 5000 Status:"
netstat -tlnp | grep 5000 || ss -tlnp | grep 5000 || echo "Port 5000 nicht gebunden"

echo ""
echo "🔥 Firewall Status:"
ufw status || iptables -L INPUT -n | grep 5000 || echo "Kein Firewall-Filter"

ENDSSH
