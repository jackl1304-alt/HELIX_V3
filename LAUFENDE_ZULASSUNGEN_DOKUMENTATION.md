# 📋 Dokumentation: Laufende Zulassungen - Quellen und Definition

**Datum**: 2025-01-27  
**Status**: Zusammenfassung der vorhandenen Dokumentation

---

## 🎯 Definition: Was sind "laufende Zulassungen"?

**Laufende Zulassungen** sollen sein:
- ✅ **Weltweite Zulassungen**, an denen noch gearbeitet wird
- ✅ **Nicht vom Nutzer eingegebene Daten**
- ✅ **Aus externen Quellen** (FDA, EMA, BfArM, etc.)
- ✅ **Zulassungen, die noch nicht abgeschlossen sind** (in Prüfung, in Bearbeitung, pending)

**NICHT**:
- ❌ Eigene Projekte des Benutzers
- ❌ Bereits genehmigte Produkte (diese sind in `regulatory_updates`)
- ❌ Manuell erfasste Projekte

---

## 📚 Relevante Dokumentation

### 1. **GLOBAL_REGULATORY_SOURCE_CATALOG.md**

**Beschreibt**: Alle weltweiten Quellen für regulatorische Daten

**Wichtige Quellen für laufende Zulassungen**:

#### USA
- **FDA openFDA 510(k)**: `https://api.fda.gov/device/510k.json`
  - Geräte-Zulassungen
  - REST API mit `search=decision_date:[date+TO+date]`
  - **Problem**: Zeigt nur bereits genehmigte Zulassungen

- **FDA PMA Approvals**: `https://api.fda.gov/device/pma.json`
  - PMA Zulassungen
  - **Problem**: Zeigt nur bereits genehmigte Zulassungen

#### EU & EWR
- **EMA Newsroom**: `https://www.ema.europa.eu/en/news?_format=json`
  - News, Guidances, PRAC
  - JSON API verfügbar

- **EUDAMED**: `https://ec.europa.eu/tools/eudamed/api/search?`
  - Vigilanz, Zertifikate
  - **Potenzial**: Könnte laufende Zulassungen enthalten

- **EU Official Journal (EUR-Lex)**: Gesetze, Durchführungsverordnungen
  - REST API: `https://eur-lex.europa.eu/search.html?lang=en&qid=...&_format=json`

#### Weitere Regionen
- **MHRA** (UK): Drug and Device News
- **Swissmedic** (CH): News, Richtlinien
- **Health Canada** (CA): Recalls & Safety Alerts
- **PMDA** (JP): English News
- **TGA** (AU): News Feed
- **NMPA** (CN): Regulatory Updates

**Zugriffsmuster**:
- Direkte API Nutzung bevorzugen
- Offene JSON/Drupal Endpunkte (`?_format=json`)
- RSS/Atom Feeds
- HTML Scraping (falls nötig)

---

### 2. **REGULATORY_UPDATE_SOURCES_AND_TEMPLATES.md**

**Beschreibt**: Führende Quellen & Unternehmens-Vorlagen

**Primäre Globale & Regionale Behörden**:

| Quelle | Region | Typische Dokumente | Aktualisierungs-Frequenz |
|--------|--------|--------------------|--------------------------|
| FDA (CDRH, CBER) | USA | Guidance Documents, Final Rules, Safety Communications, Recalls, Warning Letters | Täglich / Wöchentlich |
| EMA | EU | EPAR, Scientific Guidelines, Q&A, Reflection Papers | Wöchentlich |
| Europäische Kommission / MDR / IVDR | EU | Delegierte Rechtsakte, Implementing Acts, FAQ, MDCG-Guidance | Unregelmäßig / mehrere/Monat |
| MDCG | EU | Guidance Docs, Position Papers | Mehrere/Monat |
| BfArM | DE | Leitfäden, Nationale Hinweise, Digitale Gesundheitsanwendungen (DiGA) | Unregelmäßig |
| MHRA | UK | Guidance, Safety Alerts, Software/Algorithm-Positionspapiere | Wöchentlich |
| Swissmedic | CH | Richtlinien, Sicherheitsmeldungen | Monatlich |

**Kategorisierung & Priorisierungsmatrix**:

| Kategorie | Beispiel | Priorität Umsetzung | Erstprüfung (Tage) |
|-----------|----------|---------------------|--------------------|
| Gesetz / Verordnung | MDR Delegierte Akte | Sehr hoch | 1–2 |
| Guidance (High Impact) | MDCG Klassifizierung | Hoch | 2–3 |
| Sicherheitswarnung | FDA Recall Class I | Sofort | <1 |
| Konsens-Standard Update | ISO 14971 Revision | Mittel | 5–7 |

---

### 3. **REGULATORY_INTEGRATIONS_STRATEGIE.md**

**Beschreibt**: Strategie für Integration externer Quellen

**Quellenkatalog (Initial Priorität)**:

| Quelle | Typ | Priorität | Zugriff | Format | Kommentar |
|--------|-----|----------|---------|--------|-----------|
| FDA (Guidances, 510(k), PMA) | Behörde | Hoch | Öffentliche API / HTML | JSON / HTML | Strukturierte Produkt- & Zulassungsdaten |
| EMA | Behörde | Hoch | HTML / PDF | HTML / PDF | Teilweise manuelles Parsing nötig |
| EU MDR / Gesetzesportal (EUR-Lex) | Gesetz | Hoch | HTML | HTML / XML | Versionierung + Konsolidierte Fassungen |
| BfArM / DKMA / MHRA | Behörde | Mittel | HTML / PDF | HTML | Regionale Ergänzung EU |
| EUDAMED (Geräte / Vigilanz) | Behörde | Mittel | (Teil-Öffentlich) | CSV / Web | Verfügbarkeit teils eingeschränkt |

**Update-Frequenzen (Empfohlen)**:

| Quelle | Pull Intervall | Delta Erkennung | Notfall / Ad-hoc |
|--------|----------------|-----------------|-----------------|
| FDA Zulassungen | stündlich | published_date + K-Nummer Hash | Manuell Trigger |
| FDA Guidances | täglich | Titel + URL Hash | Manuell |
| EMA | täglich | Dokument-URL + Titel Hash | Manuell |
| EUR-Lex Gesetz | wöchentlich | Versionskennung / konsolidierte Fassung | Manuell |

**Technische Adapter-Schnittstellen**:
```typescript
interface SourceAdapter {
  sourceKey: string;
  fetchRaw(deltaSince?: Date): Promise<RawRecord[]>;
  normalize(raw: RawRecord): NormalizedRecord;
  detectDelta?(raw: RawRecord, lastHash?: string): boolean;
}
```

**Beispiel: FDA Adapter**:
- `fetchRaw()`: Holt Daten von FDA API
- `normalize()`: Transformiert zu einheitlichem Format
- Speichert in `regulatory_updates` Tabelle

---

### 4. **GLOBAL_IMPORT_GUIDE.md**

**Beschreibt**: Vorgehen zur Ausführung aller regulatorischen Datenimporte

**Einzelimporte**:
```bash
npx tsx scripts/import-fda-510k.ts --limit=30
npx tsx scripts/import-ema-news.ts --limit=15
npx tsx scripts/import-who-guidance.ts
npx tsx scripts/import-mhra-updates.ts
npx tsx scripts/import-healthcanada-notices.ts
npx tsx scripts/import-tga-updates.ts
npx tsx scripts/import-pmda-announcements.ts
```

**Aggregierter Multi-Import**:
```bash
npx tsx scripts/import-all-global-sources.ts
```

**Verifikation**:
```sql
SELECT count(*) FROM regulatory_updates;
SELECT category, count(*) FROM regulatory_updates GROUP BY category ORDER BY count DESC;
SELECT title, published_date FROM regulatory_updates ORDER BY created_at DESC LIMIT 15;
```

---

## ⚠️ Problem: Aktuelle Implementierung vs. Dokumentation

### Aktuelle Implementierung (FALSCH):
- `getOngoingApprovals()` sucht in `projects` Tabelle
- Projekte werden vom Nutzer erfasst
- Status: `regulatory_review`, `approval_pending`, `in_development`

### Soll-Zustand (laut Dokumentation):
- Laufende Zulassungen sollen aus **externen Quellen** kommen
- Werden in `regulatory_updates` gespeichert (nicht `projects`)
- Müssen noch nicht abgeschlossen sein (in Prüfung, pending)

---

## 🔍 Herausforderung: "Laufende" vs. "Abgeschlossene" Zulassungen

**Problem**: Die meisten externen APIs zeigen nur **bereits abgeschlossene** Zulassungen:

1. **FDA 510(k)**: Zeigt nur genehmigte Zulassungen (`decision_date` ist bereits gesetzt)
2. **FDA PMA**: Zeigt nur genehmigte PMAs
3. **EMA**: Zeigt hauptsächlich abgeschlossene Approvals

**Mögliche Quellen für "laufende" Zulassungen**:

1. **FDA Dockets (Regulations.gov)**: Proposed Rules, Comments
   - URL: `https://www.regulations.gov`
   - Könnte laufende Zulassungsprozesse enthalten

2. **EUDAMED**: Teil-öffentliche Daten
   - Könnte laufende Zertifizierungen enthalten

3. **National Competent Authorities (NCAs)**:
   - Länder-spezifische Websites
   - Könnten laufende Zulassungsprozesse dokumentieren

4. **FDA MAUDE**: Adverse Events
   - Könnte laufende Untersuchungen zeigen

5. **FDA Warning Letters**: Enforcement
   - Könnte laufende Compliance-Prozesse zeigen

---

## 📝 Empfehlung: Was sollte geändert werden?

### 1. Datenquelle ändern
- `getOngoingApprovals()` sollte aus `regulatory_updates` lesen (nicht `projects`)
- Filter: `type = 'approval'` UND `status = 'pending'` oder `status = 'in_review'`

### 2. Neue Datenquellen identifizieren
- Quellen finden, die **laufende** (nicht abgeschlossene) Zulassungen zeigen
- Möglicherweise: FDA Dockets, EUDAMED, NCA Websites

### 3. Status-Mapping
- Externe Quellen müssen Status-Informationen liefern
- Mapping: "submitted" → "pending", "under review" → "in_review"

### 4. Automatischer Import
- Scheduler für regelmäßigen Import aus externen Quellen
- Delta-Erkennung: Nur neue/geänderte Zulassungen importieren

---

## 📚 Zusammenfassung der Dokumentation

**Hauptdokumente**:
1. `GLOBAL_REGULATORY_SOURCE_CATALOG.md` - Alle Quellen weltweit
2. `REGULATORY_UPDATE_SOURCES_AND_TEMPLATES.md` - Führende Quellen & Vorlagen
3. `REGULATORY_INTEGRATIONS_STRATEGIE.md` - Integrationsstrategie
4. `GLOBAL_IMPORT_GUIDE.md` - Import-Anleitung

**Kernaussage**: 
- Externe Quellen (FDA, EMA, etc.) werden importiert
- Daten werden in `regulatory_updates` gespeichert
- **ABER**: Aktuell werden hauptsächlich **abgeschlossene** Zulassungen importiert
- **FEHLT**: Quellen für **laufende** (noch nicht abgeschlossene) Zulassungen

---

**Letzte Aktualisierung**: 2025-01-27
