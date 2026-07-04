#!/bin/bash

cat << 'EOF'

╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                    🔑 SSH-KEY LOGIN - VON DEINEM PC                         ║
║                                                                              ║
║              Du kannst jetzt direkt vom lokalen Rechner SSH nutzen          ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

✅ Public Key aktuell:
   ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGdVKmYHB0yRUZBqCoB38TwwT3cco9XxzDhqJg+ulajH marco.hoeft@deltaways.de

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 SO FUNKTIONIERT ES:

1️⃣ Auf DEINEM lokalen Rechner (Mac/Linux):

   Öffne Terminal und speichere den Private-Key (den du bei ssh-keygen erstellt hast):

   # Falls noch nicht vorhanden, erstelle einen:
   ssh-keygen -t ed25519 -f ~/.ssh/deltaways -N ""

   # Oder falls du den Key hast:
   cat ~/.ssh/deltaways

   # Dann SSH-Config hinzufügen:
   cat >> ~/.ssh/config << 'SSHCONFIG'
Host deltaways
    HostName deltaways-helix.de
    User root
    IdentityFile ~/.ssh/deltaways
    StrictHostKeyChecking no

Host deltaways-ip
    HostName 152.53.191.99
    User root
    IdentityFile ~/.ssh/deltaways
    StrictHostKeyChecking no
   SSHCONFIG

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2️⃣ Public-Key AUF DEM SERVER installieren (via Netcup Console):

   VNC-Konsole in Netcup öffnen und folgende Befehle eingeben:

   mkdir -p ~/.ssh
   chmod 700 ~/.ssh

   # Danach diese Zeile EINFÜGEN (als eine Zeile):
   echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGdVKmYHB0yRUZBqCoB38TwwT3cco9XxzDhqJg+ulajH marco.hoeft@deltaways.de" >> ~/.ssh/authorized_keys

   chmod 600 ~/.ssh/authorized_keys

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3️⃣ VON DEINEM PC AUS - DANN FUNKTIONIERT SSH PASSWORDLESS:

   # Login ohne Passwort:
   ssh deltaways

   # ODER direkt Befehle ausführen:
   ssh deltaways "cd /var/www/helix.deltaways.de && ls -lh"

   # ODER ein ganzes Script:
   ssh deltaways << 'ENDSSH'
   cd /var/www/helix.deltaways.de
   npm start
   ENDSSH

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 QUICK START - HELIX STARTEN:

Auf deinem PC (nach SSH-Setup):

   ssh deltaways << 'ENDSSH'
   cd /var/www/helix.deltaways.de
   
   # Installiere Dependencies falls nötig
   npm install --omit=dev
   
   # Starte App
   PORT=5000 NODE_ENV=production npm start
   ENDSSH

Nach ~10 Sekunden sollte die App live sein:
   https://www.deltaways-helix.de ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 NÄCHSTE SCHRITTE FÜR DICH:

1. Private-Key organisieren (falls nicht vorhanden)
2. Public-Key via VNC-Konsole auf Server installieren
3. SSH-Config auf deinem PC erstellen
4. Test: ssh deltaways "whoami"
5. App starten: ssh deltaways "cd /var/www/helix.deltaways.de && npm start"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️ TIMING:

Setup: 5-10 Minuten (nur einmal)
App starten danach: 30 Sekunden

╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                         👉 LOS GEHT'S! 🚀                                   ║
║                                                                              ║
║              Folge die Schritte oben und melde dich dann zurück              ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

EOF
