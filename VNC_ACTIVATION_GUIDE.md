#!/bin/bash

cat << 'EOF'

╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║          🎯 HELIX V3 - VNC KONSOLE AKTIVIERUNG (STEP-BY-STEP)               ║
║                                                                              ║
║              ⚠️ WICHTIG: Das machst du IN DER VNC-KONSOLE,                  ║
║                         NICHT in diesem Terminal hier!                      ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

📱 SCHRITT 1: VNC-Konsole öffnen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Öffne: https://www.netcup.de/kontrollpanel
2. Login mit deinen Netcup-Zugangsdaten
3. Wähle: "vServer" oder "VPS"
4. Klick auf deinen Server (z.B. "VPS 4000")
5. Klick auf Button "VNC/KVM" oder "VNC Konsole"
6. Warte 10-20 Sekunden bis die Konsole lädt

Du siehst jetzt ein schwarzes Terminal oder Linux-Desktop

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 SCHRITT 2: Befehle IN DER VNC-KONSOLE eingeben
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KOPIERE diese 3 Befehle EINZELN in die VNC-Konsole:

🔴 BEFEHL 1 (Drücke ENTER nach jedem Befehl):
   cd /var/www/helix.deltaways.de

🔴 BEFEHL 2:
   npm install --omit=dev

   (Das dauert ca. 30-60 Sekunden, warte bis "added XXX packages" angezeigt wird)

🔴 BEFEHL 3:
   PORT=5000 NODE_ENV=production npm start

   (Nach ~5-10 Sekunden solltest du sehen: "Server läuft auf Port 5000" oder ähnlich)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ SCHRITT 3: Verifizieren
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nach dem 3. Befehl solltest du Output sehen wie:

   ✓ Express Server läuft auf Port 5000
   ✓ Datenbank verbunden
   ✓ Vite Dev Server bereit

Falls du das siehst → SUCCESS! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 SCHRITT 4: Im Browser öffnen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Öffne in DEINEM Browser (nicht in der VNC-Konsole):

   https://www.deltaways-helix.de

Falls du einen Fehler siehst → das ist OK, der Server startet noch

WARTE 10-15 SEKUNDEN und aktualisiere dann (F5):

   https://www.deltaways-helix.de

Du solltest jetzt die HELIX App sehen! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ FEHLER? Das sind die häufigsten Probleme:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FEHLER: "bash: cd: /var/www/helix.deltaways.de: No such file or directory"
→ Das Verzeichnis existiert nicht. Tippe ein:
   mkdir -p /var/www/helix.deltaways.de
   cd /var/www/helix.deltaways.de
   tar -xzf /tmp/helix-latest.tar.gz 2>/dev/null || tar -xzf /tmp/helix*.tar.gz

FEHLER: "npm: command not found"
→ Node.js nicht installiert. Tippe:
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs

FEHLER: "Port 5000 already in use"
→ Andere App läuft auf Port 5000. Tippe:
   sudo lsof -i :5000
   sudo kill -9 [PID]

FEHLER: Immer noch 502 nach 30 Sekunden?
→ Schaue in die Logs:
   pm2 logs helix
   oder
   tail -50 /tmp/helix.log

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️ ZEITPLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Schritt 1 (VNC öffnen):      2-3 Min
Schritt 2 (Befehle):         2-3 Min (npm install dauert länger)
Schritt 3 (Verifizierung):   1 Min
Schritt 4 (Browser):         1 Min

TOTAL: ~7-10 Minuten

Danach läuft HELIX live! 🚀

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ NACH ERFOLGREICHEM START:

URL: https://www.deltaways-helix.de
Admin: https://www.deltaways-helix.de/admin
Data Sources: https://www.deltaways-helix.de/admin/sources
GitHub: https://github.com/jackl1304-alt/HELIX_V3

╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                         👉 LOS GEHT'S! 🚀                                   ║
║                                                                              ║
║            Öffne jetzt die Netcup VNC-Konsole und führe die                 ║
║            3 Befehle oben nacheinander aus!                                 ║
║                                                                              ║
║              Nach ~10 Minuten sollte HELIX LIVE sein!                       ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

EOF
