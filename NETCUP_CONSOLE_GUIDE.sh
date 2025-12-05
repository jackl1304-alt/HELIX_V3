#!/bin/bash

cat << 'EOF'

╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║           HELIX V3 - NETCUP CONSOLE AKTIVIERUNG (5 Minuten)                ║
║                                                                              ║
║                    So startest du die App auf dem Server                    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

🎯 SCHRITT 1: Netcup Control Panel öffnen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Gehe zu: https://www.netcup.de/kontrollpanel
2. Login mit deinen Netcup-Zugangsdaten
3. Wähle: "vServer" → "VPS 4000" (oder dein Server)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 SCHRITT 2: VNC/KVM Konsole öffnen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Im Kontrollpanel: Klick auf "VNC/KVM"
2. Warte bis die Konsole lädt (ca. 10-20 Sekunden)
3. Du siehst jetzt den Server-Desktop oder Terminal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 SCHRITT 3: SSH-Port Prüfen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tippe in die VNC-Konsole:

  ssh -V

Falls "command not found" → SSH nicht installiert

FALLS SSH IST UFF & FIREWALL BLOCKIERT:

  sudo ufw disable
  sudo ufw allow 22

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 SCHRITT 4: HELIX App Starten
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Kopiere diese Befehle in die VNC-Konsole (einzeln):

  cd /var/www/helix.deltaways.de

  ls -lh

Solltest sehen: package.json, dist/, node_modules/ etc.

Falls nicht existiert:
  mkdir -p /var/www/helix.deltaways.de
  cd /var/www/helix.deltaways.de
  tar -xzf /tmp/helix-latest.tar.gz

Dann:
  npm install --omit=dev

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 SCHRITT 5: App mit PM2 oder direktem Node Starten
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPTION A - Mit PM2 (empfohlen):

  pm2 stop all 2>/dev/null || true
  pm2 delete all 2>/dev/null || true
  
  PORT=5000 NODE_ENV=production pm2 start npm --name helix -- start
  
  pm2 save
  pm2 status
  pm2 logs helix

OPTION B - Direkter Node Start:

  PORT=5000 NODE_ENV=production nohup npm start > /tmp/helix.log 2>&1 &
  
  sleep 3
  tail -20 /tmp/helix.log

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 SCHRITT 6: Verifizieren dass es läuft
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

In der VNC-Konsole:

  netstat -tlnp | grep 5000

Du solltest sehen:
  tcp    0    0 0.0.0.0:5000    0.0.0.0:*    LISTEN    [PID]/node

Wenn ja → SUCCESS! ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 SCHRITT 7: Im Browser testen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Öffne in deinem Browser:

  https://www.deltaways-helix.de

Du solltest jetzt die HELIX App sehen (nicht mehr 502)!

Admin-Panel:
  https://www.deltaways-helix.de/admin/sources

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❓ FEHLERBEHANDLUNG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Falls "Port 5000 already in use":
  sudo lsof -i :5000
  kill -9 [PID]

Falls "Permission denied":
  sudo chown -R root:root /var/www/helix.deltaways.de

Falls "npm: command not found":
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs

Falls weiterhin 502:
  tail -100 /tmp/helix.log
  pm2 logs helix --lines 50

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️ ZEITPLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Konsole öffnen:      1-2 Min
SSH prüfen:          1 Min
App starten:         1-2 Min
Verifizieren:        1 Min
TOTAL:               ~5 Minuten

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 WENN ETWAS SCHIEFGEHT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Schreib exakt den Fehler auf und teile ihn mit.
Ich kann dann remote helfen oder Anleitung anpassen.

Wichtige Log-Befehle:
  pm2 logs helix
  tail -50 /tmp/helix.log
  dmesg | tail -20

╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║              Nach diesen 5 Schritten sollte HELIX LIVE sein! 🚀             ║
║                                                                              ║
║              GitHub Code: https://github.com/jackl1304-alt/HELIX_V3         ║
║              Live Domain: https://www.deltaways-helix.de                    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

EOF
