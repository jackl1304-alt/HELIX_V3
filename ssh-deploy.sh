#!/bin/bash
sshpass -p "7724@Serpha" ssh -o StrictHostKeyChecking=no root@152.53.191.99 << 'ENDSSH'
systemctl stop fail2ban
cd /opt/helix
git pull origin main
pm2 restart helix
pm2 logs helix --lines 20
ENDSSH
