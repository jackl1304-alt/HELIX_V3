# ✅ Laufende Zulassungen - Problem behoben

**Datum**: 2025-01-27  
**Status**: ✅ Implementiert

---

## Problem

Laufende Zulassungen wurden nicht im Frontend angezeigt, obwohl es Quellen mit laufenden Zulassungen gab.

**Ursache**: 
- API-Endpoint `/api/ongoing-approvals` suchte in der falschen Tabelle (`approvals` statt `projects`)
- Die `approvals` Tabelle ist für Approval-Workflow (Newsletter, Artikel), nicht für laufende Zulassungen

---

## Lösung

### 1. Neue Funktion `getOngoingApprovals()` erstellt

**Datei**: `server/storage.ts`

**Funktionalität**:
- Holt Projekte mit Status:
  - `regulatory_review` - Regulatorische Prüfung läuft
  - `approval_pending` - Genehmigung ausstehend
  - `in_development` - In Entwicklung

**Daten-Transformation**:
- Projekte werden in `OngoingApproval` Format transformiert:
  - `productName` ← `name`
  - `company` ← `metadata.company`
  - `region` ← `target_markets[0]`
  - `regulatoryBody` ← basierend auf Region (FDA, MDR, Health Canada)
  - `status` ← Status-Mapping
  - `progressPercentage` ← basierend auf Status
  - `estimatedCosts` ← aus `estimated_cost_regulatory`
  - `keyMilestones` ← basierend auf Status
  - `priority` ← aus `risk_level`

### 2. API-Endpoint angepasst

**Datei**: `server/routes.ts`

**Änderung**:
```typescript
// Vorher: Suchte in approvals Tabelle
const approvals = await dbStorage.getPendingApprovals();

// Nachher: Sucht in projects Tabelle
const approvals = await dbStorage.getOngoingApprovals();
```

### 3. Neue Endpoints hinzugefügt

**`POST /api/ongoing-approvals/create-test`**
- Erstellt Test-Projekte für laufende Zulassungen
- Nützlich zum Testen und Demo-Zwecken

**`GET /api/projects`**
- Zeigt alle Projekte (für Debugging)

---

## Verwendung

### Projekte erstellen

**Via API**:
```bash
POST /api/ongoing-approvals/create-test
{
  "productName": "CardioSense AI Monitoring System",
  "company": "MedTech Innovations GmbH",
  "deviceClass": "Klasse IIa",
  "status": "regulatory_review",
  "targetMarkets": ["EU"],
  "submissionDate": "2025-06-15",
  "expectedApproval": "2025-12-15",
  "estimatedCosts": "180000"
}
```

**Via Storage**:
```typescript
await dbStorage.createProject({
  name: "Product Name",
  status: "regulatory_review",
  target_markets: ["EU"],
  // ... weitere Felder
});
```

---

## Status-Mapping

| Projekt Status | OngoingApproval Status | Progress |
|----------------|------------------------|----------|
| `planning` | `submitted` | 10% |
| `in_development` | `submitted` | 30% |
| `regulatory_review` | `under-review` | 60% |
| `approval_pending` | `pending-response` | 80% |
| `approved` | `approved` | 100% |

---

## Region → Regulatory Body Mapping

| Region | Regulatory Body |
|--------|----------------|
| US | FDA - Center for Devices and Radiological Health |
| EU | MDR - Benannte Stelle |
| CA | Health Canada |
| Other | Unknown |

---

## Frontend

Das Frontend (`laufende-zulassungen.tsx`) ruft jetzt:
```typescript
const response = await fetch('/api/ongoing-approvals');
```

Und erhält die transformierten Projekte im `OngoingApproval` Format.

---

## Nächste Schritte

1. **Projekte in Datenbank erstellen**:
   - Via API: `POST /api/ongoing-approvals/create-test`
   - Oder direkt in der Datenbank

2. **Status setzen**:
   - Projekte müssen Status `regulatory_review`, `approval_pending` oder `in_development` haben

3. **Frontend prüfen**:
   - Seite `/zulassungen/laufende` sollte jetzt Projekte anzeigen

---

## Testing

```bash
# Test-Projekt erstellen
curl -X POST http://localhost:5000/api/ongoing-approvals/create-test \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Test Device",
    "status": "regulatory_review",
    "targetMarkets": ["EU"]
  }'

# Alle Projekte anzeigen
curl http://localhost:5000/api/projects

# Laufende Zulassungen abrufen
curl http://localhost:5000/api/ongoing-approvals
```

---

*Implementiert am: 2025-01-27*
