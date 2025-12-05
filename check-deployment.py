#!/usr/bin/env python3
"""
HELIX V3 - Automated Netcup Deployment with Status Check
Uses pexpect for password automation
"""
import subprocess
import sys

SERVER = "root@152.53.191.99"
PASSWORD = "KkZrHw5wrJJnn6TH"

def run_ssh_command(command):
    """Run SSH command with password"""
    try:
        # Use subprocess with password in environment (less secure but functional)
        result = subprocess.run(
            f'sshpass -p "{PASSWORD}" ssh -o StrictHostKeyChecking=no {SERVER} "{command}"',
            shell=True,
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.stdout + result.stderr
    except Exception as e:
        return f"Error: {e}"

print("🔍 Checking HELIX deployment on Netcup...")
print("=" * 60)

# Install sshpass if not available
print("\n📦 Checking sshpass...")
subprocess.run("which sshpass || echo 'Installing sshpass...'", shell=True)

print("\n📊 PM2 Status:")
output = run_ssh_command("cd /opt/helix && pm2 status")
print(output)

print("\n📝 Latest Logs:")
output = run_ssh_command("cd /opt/helix && pm2 logs helix --lines 30 --nostream")
print(output)

print("\n🌐 Port Check:")
output = run_ssh_command("netstat -tlnp | grep 5000 || echo 'Port 5000 not listening'")
print(output)

print("\n📁 /opt/helix contents:")
output = run_ssh_command("ls -lh /opt/helix/ | head -20")
print(output)

print("\n✅ Check complete!")
print("=" * 60)
