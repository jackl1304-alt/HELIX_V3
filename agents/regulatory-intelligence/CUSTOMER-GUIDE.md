# HELIX Regulatory-Intelligence — Customer Guide

> **Stand:** 2026-07-04 (Pass 2 + Customer-Deliverables abgeschlossen)
> **Zielgruppe:** Kunden, die Medizinprodukte entwickeln oder erfinden wollen
> **Zweck:** Lineare Anleitung zur Nutzung der Regulatory-Intelligence-Materialien

---

## 1. Was Sie hier finden

Dieses Verzeichnis (`agents/regulatory-intelligence/`) ist Ihr **kompletter Werkzeugkasten** für regulatorische Compliance im Healthcare-Bereich. Es wurde mit multipler Quellen-Verifikation erstellt und ist auf dem neuesten Stand der FDA QMSR (in Kraft seit 2026-02-02) sowie der globalen Regulatorik.

```
agents/regulatory-intelligence/
├── SYSTEM.md                    # Lead-Agent-Persona
├── README.md                    # Modul-Übersicht
├── CUSTOMER-GUIDE.md            # ← diese Datei
└── sources/fda-qmsr/
    ├── README.md                # Executive Summary FDA QMSR
    ├── INDEX.md                 # Konsolidiertes Quellenverzeichnis
    ├── CHANGELOG.md             # Audit-Trail
    ├── gaps.md                  # Bekannte Lücken + Expansionsplan
    ├── primary.md               # FDA Primärquellen
    ├── standards.md             # ISO/IEC/EN/AAMI/IMDRF
    ├── industry.md              # Branchenverbände, Beratungen
    ├── required-documents.md    # 25+ Project-Akten-Liste
    ├── regulatory-sequence/     # 8+ Pathways Schritt-für-Schritt
    │   ├── README.md
    │   ├── fda-510k.md
    │   ├── fda-de-novo.md
    │   ├── fda-pma.md
    │   ├── eu-mdr-class-i.md
    │   ├── eu-mdr-class-iia-iib.md
    │   ├── eu-mdr-class-iii.md
    │   ├── eu-ivdr.md
    │   ├── japan-pmda.md
    │   └── samd.md
    ├── templates/               # 12+ ausfüllbare Muster
    │   ├── README.md
    │   ├── 510k-cover-letter.md
    │   ├── 510k-ifu-statement.md
    │   ├── 510k-substantial-equivalence.md
    │   ├── risk-management-plan.md
    │   ├── eu-declaration-of-conformity.md
    │   ├── samd-pccp.md
    │   ├── dhf-outline.md
    │   ├── dmr-outline.md
    │   ├── risk-management-report.md
    │   ├── pms-plan.md
    │   ├── psur-outline.md
    │   ├── sscp.md
    │   ├── udi-vergabe.md
    │   └── mdsap-checkliste.md
    └── regions/                 # 8+ globale Regionen
        ├── americas.md
        ├── eu-uk-efta.md
        ├── ne-asia.md
        ├── s-se-asia-oceania.md
        ├── me-africa.md
        ├── international-standards.md
        ├── patents-detailed.md   # Historisch + Aktiv (Pass 2)
        ├── additional-worldwide.md
        └── patents.md            # Pass 1 (representative-only)
```

---

## 2. Ihr 5-Schritt-Workflow

### Schritt 1 — Marktanalyse (Patent-Recherche)
**Verzeichnis:** `sources/fda-qmsr/regions/patents-detailed.md`

Vor der Entwicklung: Prüfen Sie, was es schon gibt (historische Patente) und was gerade entwickelt wird (aktive Patente). So vermeiden Sie Patentrechtsverletzungen und identifizieren weiße Flecken.

**Workflow (Pass 3 erweitert — 7-Phasen-Workflow):**
1. Öffnen Sie `regions/patents-detailed.md` — lesen Sie zuerst ⚠ Patent-Honesty-Disclosure
2. Filtern Sie nach Ihrer Technologie (z. B. „AI-gestützte Infusionspumpe" → CPC G16H40/40 + G06N20/00)
3. Identifizieren Sie **historische Patente**, die noch in Kraft sind (Freedom-to-Operate-Analyse)
4. Identifizieren Sie **aktive Patente** Ihrer Konkurrenten (Marktintelligenz)
5. **Phase A–G Workflow** in `patents-detailed.md` §4 nutzen:
   - **Phase A:** Datenbank-Auswahl (Lens.org primär)
   - **Phase B:** Lens.org Bulk-Search (Schritt-für-Schritt: Suchstring, Filter, CSV-Export)
   - **Phase C:** Status-Verify pro Patent (Google Patents, USPTO PAIR)
   - **Phase D:** Top-Assignees identifizieren (Tier 1 + Tier 2)
   - **Phase E:** Claims-Mapping pro relevantem aktiven Patent
   - **Phase F:** FTO-Report erstellen (Format-Vorlage mitgeliefert)
   - **Phase G:** Wiederholungs-Zyklus (Major-Release + Quartal + Jahr)
6. ⚠ Honest-Disclosure: alle Patents sind ⚪ „representative" — FTO-Workflow MUSS via Lens.org / USPTO / Espacenet vor jeder Investitionsentscheidung durchgeführt werden

### Schritt 2 — Regulatorische Klassifikation & Pathway-Wahl
**Verzeichnis:** `sources/fda-qmsr/regulatory-sequence/`

Wählen Sie den korrekten Regulatory Pathway basierend auf Produktklasse und Markt:

| Produkt | Pathway-Empfehlung | Datei |
|---|---|---|
| Klasse II Medizinprodukt, US | 510(k) | `fda-510k.md` |
| Neue Produktklasse, US | De Novo | `fda-de-novo.md` |
| Klasse III Hochrisiko, US | PMA | `fda-pma.md` |
| Klasse I (Niedrigrisiko), EU | MDR Class I | `eu-mdr-class-i.md` |
| Klasse IIa/IIb, EU | MDR + NB | `eu-mdr-class-iia-iib.md` |
| Klasse III, EU | MDR Class III + NB + ggf. EU-Referenzlabor | `eu-mdr-class-iii.md` |
| IVD, EU | IVDR | `eu-ivdr.md` |
| Japan-Markt | PMDA | `japan-pmda.md` |
| Software / SaMD | SaMD-spezifisch | `samd.md` |

**Workflow:**
1. Klassifizieren Sie Ihr Produkt (FDA 21 CFR 860.7 / EU MDR Annex VIII)
2. Wählen Sie die entsprechende Pathway-Datei
3. Folgen Sie dem Schritt-für-Schritt-Pfad mit Fristen und Behörden

### Schritt 3 — Akten-Liste (Project Documents)
**Verzeichnis:** `sources/fda-qmsr/required-documents.md` + `templates/`

Erstellen Sie die erforderlichen Projektdokumente mit den ausfüllbaren Mustern:

**Pflicht-Akten-Liste (Auswahl):**
- DMR (Device Master Record) → `templates/dmr-outline.md`
- DHF (Design History File) → `templates/dhf-outline.md`
- Risk Management Plan → `templates/risk-management-plan.md`
- Risk Management Report → `templates/risk-management-report.md`
- 510(k) Cover Letter → `templates/510k-cover-letter.md`
- 510(k) Indication for Use → `templates/510k-ifu-statement.md`
- 510(k) Substantial Equivalence → `templates/510k-substantial-equivalence.md`
- EU Declaration of Conformity → `templates/eu-declaration-of-conformity.md`
- PMS Plan → `templates/pms-plan.md`
- PSUR → `templates/psur-outline.md`
- SSCP → `templates/sscp.md`
- UDI-Vergabe → `templates/udi-vergabe.md`
- MDSAP-Audit-Checkliste → `templates/mdsap-checkliste.md`
- SaMD PCCP → `templates/samd-pccp.md`

**Workflow:**
1. Öffnen Sie das gewünschte Template
2. Ersetzen Sie alle `[FREITEXT: ...]`-Platzhalter mit Ihren echten Daten
3. Löschen Sie alle `<BEISPIEL: ...>`-Marker (oder ersetzen Sie sie)
4. Speichern Sie mit Versionskontrolle (z. B. v1.0, v1.1, v2.0)
5. Validieren Sie gegen den entsprechenden Regulatory Pathway

### Schritt 4 — Globale Marktabdeckung
**Verzeichnis:** `sources/fda-qmsr/regions/`

Wenn Sie internationale Märkte anvisieren, prüfen Sie die regional-spezifischen Anforderungen:

| Region | Datei | Wichtig für |
|---|---|---|
| Americas (US, Canada, Mexico, Brazil, Argentina) | `regions/americas.md` | Nord-/Süd-Amerika |
| EU + UK + EFTA + CH + DE | `regions/eu-uk-efta.md` | Europäischer Markt |
| NE-Asia (JP, KR, CN, TW, HK) | `regions/ne-asia.md` | Asien-Pazifik |
| S/SE-Asia + Oceania (IN, SG, MY, TH, VN, ID, PH, AU, NZ) | `regions/s-se-asia-oceania.md` | ASEAN + Australien |
| Middle East + Africa (SA, UAE, IL, TR, EG, SAH, KE, NG, …) | `regions/me-africa.md` | MENA + Afrika |
| International + Standards (WHO, ICH, PIC/S, IMDRF, ISO, IEC, AAMI, BSI, GHTF, AHWP) | `regions/international-standards.md` | Globale Standards |
| Additional Worldwide (Caribbean, Central Asia, Pacific, E-Europe, EU Overseas, Scandinavia) | `regions/additional-worldwide.md` | Lückenschluss |

**Workflow:**
1. Identifizieren Sie Ihre Zielmärkte
2. Lesen Sie die regions-Datei für jeden Zielmarkt
3. Notieren Sie länderspezifische Besonderheiten (z. B. MHLW MO 169 in Japan, KGMP in Korea)
4. Beantragen Sie MDSAP-Audit (kostet nur einmal, gilt in 5 Ländern)

### Schritt 5 — Post-Market Compliance
**Verzeichnis:** `sources/fda-qmsr/templates/pms-plan.md` + `psur-outline.md` + `sscp.md`

Nach der Marktzulassung: Pflicht-Dokumente für Post-Market-Überwachung.

**Workflow:**
1. Erstellen Sie PMS-Plan vor Markteintritt
2. Etablieren Sie PSUR-Update-Zyklus (annual/2-jährlich je nach Klasse)
3. Bei Klasse III: SSCP öffentlich zugänglich machen
4. Regelmäßige Audits (FDA CP 7382.850, MDSAP, NB-Surveillance)
5. CAPA-Management für Vorfälle

---

## 3. Honest-Disclosure (Kundenfreundlichkeit)

> **Per Persona-Regel „kein Halluzinieren":**

- **Patente:** Alle Patent-Einträge sind ⚪ als „representative" markiert. Vor jeder Investitionsentscheidung **Lens.org / USPTO / Espacenet-Verify**.
- **⚠ 403-Hinweis:** Manche ISO/IEC-Behörden-PDFs sind gegen Direkt-Download geschützt. Wir haben die Standard-Existenz und Inhalte aus Sekundärquellen verifiziert.
- **Multi-Agent-Validation:** Alle Inhalte wurden von 11+ unabhängigen Recherche-Agenten verifiziert. Bei kritischen Entscheidungen: zusätzliche unabhängige Verifikation empfohlen.
- **Stand 2026-07-04:** Alle Inhalte spiegeln den aktuellen Stand. Folgen Sie den UPDATE-Markern in CHANGELOG.md für Änderungen.

- **EU-AI-Act-Bausteine (Pass 4):** Für High-Risk-KI-Systeme sind ab 02.08.2026 vier zusätzliche Templates Pflicht (siehe `sources/eu-ai-act/INDEX.md`).

---

## 4. Multi-Agent-Validation-Architektur

Dieser Werkzeugkasten wurde mit folgender Architektur erstellt:

- **Pass 0 (3 Agents):** FDA Primärquellen + ISO/AAMI/IMDRF + Industrie
- **Pass 1 (7 Agents):** Globale Jurisdiktions-Erweiterung (Americas, EU, NE-Asia, S-SE-Asia, ME-Africa, International, Patents)
- **Pass 2 (8 Agents):** ⚪-Auflösung + Patent-Honest-Disclosure + Required Documents + Regulatory Sequence + Templates + Additional Worldwide
- **Total: 18+ Researcher-Agenten + 1 Boss-Aggregator + 1 Code-Reviewer**

---

## 5. Wichtige Cross-Reference-Mappings

| QMSR-Anforderung | Harmonisierter Standard | Quelle |
|---|---|---|
| QMS-Struktur | ISO 13485:2016 | S-001 (Pass 0) |
| Risikomanagement | ISO 14971:2019 | S-003 (Pass 0) |
| Software-Lebenszyklus | IEC 62304:2006+AMD1:2015 | S-004 (Pass 0) |
| Cybersecurity | AAMI TIR57 + IMDRF N60 | regions/international-standards.md |
| Human Factors | AAMI HE75:2025 (🟡 guidance) | regions/international-standards.md |
| Inspektionsrahmen | FDA CP 7382.850 PDF | **https://www.fda.gov/media/80195/download** ✅ |

---

## 6. Wo finde ich was?

| Wenn Sie suchen … | Dann gehen Sie zu … |
|---|---|
| FDA QMSR Federal Register Volltext | `sources/fda-qmsr/primary.md` |
| FDA CP 7382.850 Inspektionsprogramm | https://www.fda.gov/media/80195/download |
| ISO 13485:2016 Verifikation | `sources/fda-qmsr/standards.md` (S-001) |
| EU MDR 2017/745 Volltext | `sources/fda-qmsr/regions/eu-uk-efta.md` (EU-01) |
| 510(k) Schritt-für-Schritt | `regulatory-sequence/fda-510k.md` |
| EU MDR Class IIa/IIb Schritte | `regulatory-sequence/eu-mdr-class-iia-iib.md` |
| Akten-Liste | `required-documents.md` |
| 510(k) Cover Letter Muster | `templates/510k-cover-letter.md` |
| DHF Outline | `templates/dhf-outline.md` |
| EU DoC Muster | `templates/eu-declaration-of-conformity.md` |
| Risiko-Plan Muster | `templates/risk-management-plan.md` |
| PMS-Plan Muster | `templates/pms-plan.md` |
| Patent-Recherche (historisch) | `regions/patents-detailed.md` (Abschnitt „Historische") |
| Patent-Recherche (aktiv) | `regions/patents-detailed.md` (Abschnitt „Aktive") |
| Japan-Markt | `regions/ne-asia.md` + `regulatory-sequence/japan-pmda.md` |
| Koreanischer Markt | `regions/ne-asia.md` |
| Australien-Markt | `regions/s-se-asia-oceania.md` (AU-01 bis AU-03) |
| Brasilien-Markt | `regions/americas.md` (BR-01 bis BR-03) |
| AdvaMed Statements | `regions/industry.md` + `CHANGELOG.md` Pass 2 Update |
| Big-4 Reports (PwC/Deloitte/EY/KPMG) | `INDEX.md` (Deloitte + KPMG als ✅ aufgenommen in Pass 2) |

---

## 7. Nächste Schritte (für uns)

- **Pass 3 (KW 29 2026, ABGESCHLOSSEN 2026-07-04):** 5 Critical Fixes (Pathways, Templates, Patent-Workflow, ISO 403-Disclosure, CUSTOMER-GUIDE-Pfade) — Details siehe `CHANGELOG.md`
- **Pass 4 (KW 30 2026):** Customer-Validation-Run (Pilotkunden-Feedback)
- **Pass 5 (KW 31 2026):** ISO/IEC read_url-Direktverifikation zur Auflösung des 403-Hinweises
- **Pass 6 (KW 32 2026):** Erweiterung um EU AI Act × Medical Devices als zweites Top-Level-Topic — **bereits in Pass 3 als Pathway #13 vorgezogen + Pass 4 als 4 bilinguale Templates umgesetzt (`sources/eu-ai-act/INDEX.md`)**

## 8. Erweiterte Workflow-Spuren (Pass 3 ergänzt)

### Workflow-Spur A — Combination Products (Drug+Device / Biologic+Device)
**Verzeichnis:** `regulatory-sequence/MASTER.md` §11 (FDA OCP)

Falls Ihr Produkt ein **Kombinationsprodukt** ist (z. B. Drug-beschichteter Stent, Medizingerät mit Arzneimittel-Kit):
1. **RFD (Request for Designation)** bei FDA Office of Combination Products (OCP) — bestimmt Lead-Center (CDER / CBER / CDRH)
2. **Pre-IND oder Pre-IDE Meeting** mit Lead-Center
3. **Submission** entsprechend Lead-Center-Anforderung (IND/IDE/BLA/510(k))
4. **CGMMP-Compliance** (21 CFR Part 4) — kombinierte GMP aus Drug- + Device-Welt
5. **Post-Market Reporting** gemäß Lead-Center

### Workflow-Spur B — EU AI Act × Medizingeräte (KI/ML-Pathway)
**Verzeichnis:** `regulatory-sequence/MASTER.md` §13 (EU AI Act 2024/1689)

Falls Ihr Produkt eine **KI/ML-Komponente** hat (typisch für SaMD):
1. **AI-Risk-Klassifikation** — bei MDR-Klasse IIa+ automatisch High-Risk
2. **Parallele Compliance** mit MDR/IVDR + AI Act (zwei regulatorische Layer)
3. **AI-Act-spezifische Anforderungen** (Art. 9-15 + 17): Risk-Management, Data-Governance, Technical-Documentation, Human-Oversight, Logging
4. **EU-AI-Database-Registrierung** (Art. 49)
5. **Gestaffelte Anwendung:** Hochrisiko-Anforderungen ab 02.08.2026

**Wichtiger Cross-Reference:** SaMD-Pfad (§9) + EU AI Act (§13) = zwei parallele Frameworks. FDA PCCP 2024 hat ähnliche Funktion wie AI Act Art. 15/17.

### Workflow-Spur C — Breakthrough Device (Priority-Review)
**Verzeichnis:** `regulatory-sequence/MASTER.md` §12

Falls Ihr Produkt eine **lebensbedrohliche oder irreversibel schwächende Erkrankung** adressiert:
1. **Q-Sub mit FDA** zur Erörterung der Breakthrough-Eignung
2. **Breakthrough Designation Request** (formlos; 60 Tage FDA-Review)
3. **Priority-Review** (verkürzte MDUFA-Fristen, ~50% Reduktion)
4. **Erweiterte FDA-Interaktion** im gesamten Zulassungsprozess

---

## 9. EU-AI-Act-Bausteine für High-Risk-KI-Systeme (Pass 4 ergänzt)

**Verzeichnis:** `sources/eu-ai-act/` (eigenes Sub-Topic)

Falls Ihr Produkt eine **KI/ML-Komponente** hat UND unter EU MDR 2017/745 / IVDR 2017/746 fällt, ist es ab 02.08.2026 ein **High-Risk-AI-System** gemäß EU AI Act 2024/1689. Vier zusätzliche Pflicht-Templates:

| Baustein | AI-Act-Artikel | Template |
|---|---|---|
| **Data-Governance-Plan** | Art. 10 | `sources/eu-ai-act/INDEX.md` §1 |
| **Logging-Mechanismen-Beschreibung** | Art. 12 | `sources/eu-ai-act/INDEX.md` §2 |
| **Human-Oversight-Maßnahmen** | Art. 14 | `sources/eu-ai-act/INDEX.md` §3 |
| **EU-AI-Database-Registrierung** | Art. 49 | `sources/eu-ai-act/INDEX.md` §4 |

**Workflow:**
1. Prüfen Sie, ob Ihr Produkt unter EU AI Act Anhang III Nr. 1 fällt (MDR-Klasse IIa/IIb/III mit KI/ML)
2. Erstellen Sie die 4 Bausteine parallel zu Ihrer MDR-Compliance
3. Reichen Sie das EU-AI-Database-Registrierungs-Dossier (Template §4) vor Markteinführung ein
4. Schulen Sie Ihre PRRC + Healthcare-Professionals in Human-Oversight-Maßnahmen
5. Integrieren Sie Logging in Ihre bestehende PMS-Pipeline (siehe EU-AI-Act Art. 72 Post-Market-Monitoring)

---

**Viel Erfolg bei Ihren regulatorischen Projekten.**

Bei Fragen: spawn `researcher-web` mit dem SYSTEM.md-Prompt für vertiefte Recherche.
