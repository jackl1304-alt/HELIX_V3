#!/bin/bash
# Fix bash_logout and check status
ssh -t root@152.53.191.99 bash << 'ENDSSH'
# Fix corrupted bash_logout
echo "# Standard bash logout" > /root/.bash_logout

cd /opt/helix

echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📝 Latest Logs:"
pm2 logs helix --lines 30 --nostream || echo "No logs yet"

echo ""
echo "🌐 Port Check:"
netstat -tlnp | grep 5000 || echo "Port 5000 not bound"

echo ""
echo "🔥 Firewall:"
ufw status 2>/dev/null || echo "UFW not active"

echo ""
echo "📁 Files in /opt/helix:"
ls -lh /opt/helix/

echo ""
echo "✅ Check complete"

ENDSSH
