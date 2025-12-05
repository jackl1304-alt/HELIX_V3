#!/bin/bash
# Installiere SSH-Key auf Netcup Server

set -e

PUBLIC_KEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGdVKmYHB0yRUZBqCoB38TwwT3cco9XxzDhqJg+ulajH marco.hoeft@deltaways.de"
SERVER="root@152.53.191.99"
SSH_PASSWORD="KkZrHw5wrJJnn6TH"

echo "🔑 SSH-Key Installation auf Netcup"
echo "═════════════════════════════════════════"
echo ""

echo "📋 Public Key:"
echo "   $PUBLIC_KEY"
echo ""

echo "📤 Installiere SSH-Key..."
echo ""

# Nutze expect um SSH-Key zu installieren
expect << EOFEXPECT
set timeout 30
log_user 1

spawn ssh -o StrictHostKeyChecking=no root@152.53.191.99

expect {
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    "password:" {
        send "$SSH_PASSWORD\r"
    }
}

expect "# "
send "mkdir -p ~/.ssh\r"
expect "# "

send "chmod 700 ~/.ssh\r"
expect "# "

send "echo '$PUBLIC_KEY' >> ~/.ssh/authorized_keys\r"
expect "# "

send "chmod 600 ~/.ssh/authorized_keys\r"
expect "# "

send "echo ''\r"
expect "# "
send "echo '✅ SSH-Key installiert!'\r"
expect "# "

send "cat ~/.ssh/authorized_keys | wc -l\r"
expect "# "

send "exit\r"
expect eof
EOFEXPECT

echo ""
echo "═════════════════════════════════════════"
echo "✅ SSH-Key erfolgreich installiert!"
echo ""
echo "Jetzt kannst du dich anmelden ohne Passwort:"
echo ""
echo "   ssh root@152.53.191.99"
echo ""
echo "oder"
echo ""
echo "   ssh root@deltaways-helix.de"
echo ""
