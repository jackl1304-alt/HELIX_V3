# 📊 Echte Daten vs. Test-Daten - Erklärung

**Datum**: 2025-01-27

---

## ⚠️ Aktuelle Situation

### Was gerade im Backend liegt:

**2 Projekte** - **BEIDE sind Test-Daten**, die ich gerade erstellt habe:
1. "Test Produkt" - Test Company GmbH
2. "CardioSense AI Monitoring System" - MedTech Innovations GmbH

**Diese sind NICHT echte Daten!**

---

## 🔍 Unterschied: Echte Daten vs. Test-Daten

### Test-Daten (aktuell):
- ✅ Werden manuell erstellt via `/api/ongoing-approvals/create-test`
- ✅ Für Demo/Test-Zwecke
- ✅ Beispiel-Projekte

### Echte Daten (sollten sein):
- ✅ Projekte, die von Benutzern erfasst wurden
- ✅ Projekte, die aus externen Quellen importiert wurden
- ✅ Projekte aus der `projects` Tabelle mit echten Firmen-Daten

---

## 📋 Wo kommen echte laufende Zulassungen her?

### 1. **Manuelle Erfassung durch Benutzer**
- Benutzer erstellen Projekte über das Frontend
- Projekte werden in der `projects` Tabelle gespeichert
- Status: `regulatory_review`, `approval_pending`, `in_development`

### 2. **Regulatory Updates (nicht direkt Projekte)**
- System sammelt **Regulatory Updates** von FDA, EMA, BfArM, etc.
- Diese werden in `regulatory_updates` Tabelle gespeichert
- **ABER**: Regulatory Updates sind **nicht automatisch** laufende Zulassungen
- Laufende Zulassungen sind **eigene Projekte** des Benutzers

### 3. **Externe Quellen**
- FDA 510(k) Clearances → werden als **Regulatory Updates** gespeichert
- EMA Approvals → werden als **Regulatory Updates** gespeichert
- **NICHT** automatisch als laufende Zulassungen

---

## 🎯 Was sind "laufende Zulassungen"?

**Laufende Zulassungen** = **Eigene Projekte** des Benutzers, die:
- Aktuell in der Zulassungsphase sind
- Status haben: `regulatory_review`, `approval_pending`, `in_development`
- In der `projects` Tabelle gespeichert sind

**NICHT**:
- ❌ Regulatory Updates von externen Quellen
- ❌ Bereits genehmigte Produkte
- ❌ Öffentliche Zulassungsdatenbanken

---

## ✅ So erstellt man echte laufende Zulassungen

### Option 1: Via Frontend
1. Gehe zu `/zulassungen/laufende`
2. Klicke "Erste Zulassung erfassen" oder "Neue Zulassung starten"
3. Fülle die Daten aus
4. Speichern

### Option 2: Via API (ohne "test" im Namen)
```bash
POST /api/projects
{
  "name": "Echtes Produkt",
  "status": "regulatory_review",
  "targetMarkets": ["EU"],
  ...
}
```

### Option 3: Direkt in Datenbank
```sql
INSERT INTO projects (
  name, status, target_markets, ...
) VALUES (
  'Echtes Produkt', 'regulatory_review', ARRAY['EU'], ...
);
```

---

## 🔍 Prüfen ob echte Daten vorhanden sind

### 1. Alle Projekte anzeigen:
```
GET http://localhost:5000/api/projects
```

### 2. Debug-Info:
```
GET http://localhost:5000/api/debug/ongoing-approvals
```

### 3. Prüfe `created_at` Datum:
- Test-Daten: Heute erstellt
- Echte Daten: Ältere Daten oder von Benutzern erstellt

---

## 📊 Regulatory Updates (andere Datenquelle)

Regulatory Updates sind **separate Daten**:
- Werden von externen Quellen gesammelt (FDA, EMA, etc.)
- Werden in `regulatory_updates` Tabelle gespeichert
- Zeigen **öffentliche Zulassungen**, nicht eigene Projekte

**Prüfen**:
```
GET http://localhost:5000/api/regulatory-updates
```

---

## 💡 Zusammenfassung

| Daten-Typ | Tabelle | Quelle | Echt? |
|-----------|--------|--------|-------|
| **Laufende Zulassungen** | `projects` | Benutzer erfasst | ✅ Ja (wenn manuell erstellt) |
| **Test-Projekte** | `projects` | `/api/ongoing-approvals/create-test` | ❌ Nein |
| **Regulatory Updates** | `regulatory_updates` | FDA/EMA/etc. | ✅ Ja (echte öffentliche Daten) |

---

## 🎯 Nächste Schritte

1. **Test-Daten entfernen** (optional):
   - Via API oder direkt in Datenbank löschen

2. **Echte Projekte erstellen**:
   - Via Frontend oder API
   - Mit echten Firmen-Daten

3. **Regulatory Updates prüfen**:
   - Diese sind separate Daten
   - Werden nicht als "laufende Zulassungen" angezeigt

---

*Erklärung erstellt: 2025-01-27*
