# 🔧 Development Server Fehlerbehebung

## Problem: ERR_CONNECTION_REFUSED zu localhost:5000

Die Fehler im Browser-Console zeigen:
- `ERR_CONNECTION_REFUSED` zu `localhost:5000`
- WebSocket-Verbindungsfehler (Vite HMR)
- Dynamische Import-Fehler für Seiten-Komponenten
- 404 Page Not Found

**Ursache**: Der Development-Server läuft nicht auf Port 5000.

---

## ✅ Lösung: Server starten

### Option 1: PowerShell Script (Empfohlen für Windows)

```powershell
.\start-windows.ps1
```

### Option 2: npm Script

```bash
npm run dev
```

### Option 3: Direkt mit tsx

```bash
npm start
```

---

## 🔍 Voraussetzungen prüfen

### 1. Port 5000 ist frei

```powershell
# Prüfen ob Port 5000 belegt ist
netstat -ano | findstr :5000
```

Falls Port belegt:
- Anderen Prozess beenden
- Oder PORT in `.env` ändern: `PORT=5001`

### 2. .env Datei konfiguriert

Erstelle `.env` Datei im Root-Verzeichnis:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/database
SESSION_SECRET=your-secret-key-min-32-chars
```

**Wichtig**: Kopiere `.env.example` zu `.env` und fülle die Werte aus.

### 3. Dependencies installiert

```bash
npm install
```

---

## 🚀 Start-Prozess

Nach dem Start sollte folgendes erscheinen:

```
🚀 HELIX Regulatory Informationsplattform
📍 Environment: development
🔗 Binding to: 0.0.0.0:5000
✅ API routes registered successfully
🔧 Development mode: Setting up Vite dev server
🎉 HELIX System Successfully Started!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Server URL: http://0.0.0.0:5000
📊 Health Check: http://0.0.0.0:5000/health
```

---

## 🌐 Browser öffnen

Nach erfolgreichem Start:
1. Öffne Browser: `http://localhost:5000`
2. Die Anwendung sollte jetzt laden
3. WebSocket-Verbindung sollte funktionieren
4. Dynamische Imports sollten funktionieren

---

## ⚠️ Häufige Probleme

### Problem 1: "DATABASE_URL not set"

**Lösung**: 
- Erstelle `.env` Datei
- Setze `DATABASE_URL` (siehe `.env.example`)
- Für lokale Entwicklung: Nutze kostenlose Neon-Datenbank (https://neon.tech)

### Problem 2: Port bereits belegt

**Lösung**:
```powershell
# Port ändern in .env
PORT=5001
```

Oder Prozess beenden:
```powershell
# Prozess-ID finden
netstat -ano | findstr :5000
# Prozess beenden (ersetze PID)
taskkill /PID <PID> /F
```

### Problem 3: Vite Setup failed

**Lösung**:
- Prüfe ob `client/` Verzeichnis existiert
- Prüfe ob `client/index.html` existiert
- Prüfe ob `node_modules` installiert sind: `npm install`

### Problem 4: WebSocket-Verbindung fehlgeschlagen

**Lösung**:
- Stelle sicher, dass Server läuft
- Prüfe Firewall-Einstellungen
- Prüfe ob Proxy die WebSocket-Verbindung blockiert

---

## 🔄 Hot Module Replacement (HMR)

Wenn der Server läuft, sollte Vite HMR automatisch funktionieren:
- Code-Änderungen werden automatisch im Browser aktualisiert
- WebSocket-Verbindung zeigt Status in Browser-Console

---

## 📝 Debugging

### Server-Logs prüfen

Der Server zeigt detaillierte Logs:
- `[DB]` - Datenbank-Verbindung
- `[VITE]` - Vite Dev Server
- `[API]` - API Requests
- `🚨` - Fehler

### Browser-Console prüfen

Öffne Developer Tools (F12):
- **Console Tab**: Zeigt JavaScript-Fehler
- **Network Tab**: Zeigt HTTP-Requests
- **WebSocket Tab**: Zeigt WebSocket-Verbindung

---

## ✅ Erfolgreicher Start - Checkliste

- [ ] Server läuft auf Port 5000
- [ ] Keine ERR_CONNECTION_REFUSED Fehler
- [ ] WebSocket-Verbindung funktioniert
- [ ] Seiten laden korrekt (keine 404)
- [ ] Dynamische Imports funktionieren
- [ ] Assets laden (Logo, etc.)
- [ ] API-Endpoints antworten (`/api/health`)

---

## 🆘 Wenn nichts funktioniert

1. **Server neu starten**:
   ```powershell
   # Strg+C zum Beenden
   # Dann neu starten
   npm run dev
   ```

2. **Cache leeren**:
   ```powershell
   # Node modules neu installieren
   rm -r node_modules
   npm install
   ```

3. **Browser-Cache leeren**:
   - Strg+Shift+R (Hard Reload)
   - Oder DevTools > Application > Clear Storage

4. **Port ändern**:
   ```env
   PORT=5001
   ```
   Dann: `http://localhost:5001`

---

*Letzte Aktualisierung: 2025-01-27*
