# 🚀 Quick Start - HELIX Development Server

## Problem behoben: ERR_CONNECTION_REFUSED

Die Fehler im Browser zeigen, dass der Server nicht läuft. Hier die schnelle Lösung:

---

## ✅ Schritt 1: Server starten

### Windows PowerShell:

```powershell
.\start-windows.ps1
```

### Oder direkt:

```bash
npm run dev
```

---

## ✅ Schritt 2: Browser öffnen

Nach dem Start öffne:
```
http://localhost:5000
```

---

## ⚠️ Falls Fehler auftreten

### Fehler: "DATABASE_URL not set"

1. Erstelle `.env` Datei im Root:
```bash
cp .env.example .env
```

2. Bearbeite `.env` und setze:
```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

**Für lokale Entwicklung**: Nutze kostenlose Neon-Datenbank
- https://neon.tech
- Erstelle kostenloses Konto
- Kopiere Connection String in `.env`

### Fehler: "Port 5000 already in use"

Ändere Port in `.env`:
```env
PORT=5001
```

Dann: `http://localhost:5001`

---

## ✅ Erfolgreicher Start

Du solltest sehen:
```
🚀 HELIX Regulatory Informationsplattform
📍 Environment: development
🔗 Binding to: 0.0.0.0:5000
✅ API routes registered successfully
🎉 HELIX System Successfully Started!
```

Dann im Browser:
- ✅ Keine ERR_CONNECTION_REFUSED Fehler
- ✅ Seiten laden korrekt
- ✅ WebSocket-Verbindung funktioniert

---

## 📖 Detaillierte Anleitung

Siehe: `DEV_SERVER_FIX_GUIDE.md`
