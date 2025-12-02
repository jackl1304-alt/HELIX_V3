# 🚀 Server Start-Anleitung

## Problem: ERR_CONNECTION_REFUSED

Der Server läuft nicht oder antwortet nicht auf Port 5000.

---

## ✅ Lösung: Server starten

### Option 1: PowerShell Script (Empfohlen)

```powershell
.\start-windows.ps1
```

### Option 2: npm Script

```powershell
npm run dev
```

### Option 3: Direkt

```powershell
npm start
```

---

## ⚠️ Falls Port 5000 belegt ist

Wenn Port 5000 bereits belegt ist, aber der Server nicht antwortet:

### 1. Alten Prozess beenden

```powershell
# Prozess-ID finden
netstat -ano | findstr :5000

# Prozess beenden (ersetze 31128 mit der tatsächlichen PID)
taskkill /PID 31128 /F
```

### 2. Dann Server neu starten

```powershell
npm run dev
```

---

## 🔍 Server-Status prüfen

Nach dem Start sollte erscheinen:

```
🚀 HELIX Regulatory Informationsplattform
📍 Environment: development
🔗 Binding to: 0.0.0.0:5000
✅ API routes registered successfully
🎉 HELIX System Successfully Started!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Server URL: http://0.0.0.0:5000
📊 Health Check: http://0.0.0.0:5000/health
```

---

## ✅ Testen

Nach erfolgreichem Start:

1. **Health Check**:
   ```
   http://localhost:5000/health
   ```

2. **Debug Endpoint**:
   ```
   http://localhost:5000/api/debug/ongoing-approvals
   ```

3. **Alle Projekte**:
   ```
   http://localhost:5000/api/projects
   ```

---

## 🆘 Wenn Server nicht startet

### Fehler: "DATABASE_URL not set"

1. Erstelle `.env` Datei:
   ```bash
   cp .env.example .env
   ```

2. Bearbeite `.env` und setze:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/database
   ```

### Fehler: "Port 5000 already in use"

1. Beende den Prozess:
   ```powershell
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

2. Oder ändere Port in `.env`:
   ```env
   PORT=5001
   ```

---

*Letzte Aktualisierung: 2025-01-27*
