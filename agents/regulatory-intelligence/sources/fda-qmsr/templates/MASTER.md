# Templates — Master (12+ ausfüllbare Muster)

> **Stand:** 2026-07-04 (Pass 2)
> **Zweck:** Ausfüllbare Markdown-Muster mit `[FREITEXT: ...]`-Markern für Kunden-Selbstanwendung
> **Konvention:**
> - `[FREITEXT: ...]` = Platzhalter, der durch echte Kunden-Daten ersetzt werden MUSS
> - `<BEISPIEL: ...>` = Klar markiertes Beispiel; Kunde soll es löschen oder durch echte Daten ersetzen
> - Jedes Template in zwei Versionen: **de-DE** und **en-US**

---

## Template 1: 510(k) Cover Letter (FDA)

**Regulatorische Referenz:** 21 CFR 807.87
**Pflicht-Pathway:** FDA 510(k) Class II
**Version:** 1.0

### Deutsch (de-DE)

```markdown
# Cover Letter: 510(k) Premarket Notification

[FREITEXT: Datum]

Food and Drug Administration
Center for Devices and Radiological Health
Document Control Center (WO66-G609)
10903 New Hampshire Avenue
Silver Spring, MD 20993-0002
USA

**Betreff: 510(k) Premarket Notification für [FREITEXT: Vollständiger Produktname mit Modellnummer]**

Sehr geehrte Damen und Herren,

hiermit reichen wir die 510(k)-Premarket-Notification für das nachfolgend beschriebene Medizinprodukt ein:

* **Einreicher (Submitter):** [FREITEXT: Firmenname des Einreichers, Establishment Registration Number]
* **Kontaktperson:** [FREITEXT: Vor- und Nachname des Regulatory Contact]
* **E-Mail:** [FREITEXT: E-Mail-Adresse]
* **Telefon:** [FREITEXT: Telefonnummer mit Ländervorwahl]
* **Produktname:** [FREITEXT: Vollständiger Produktname]
* **Modellnummer:** [FREITEXT: Modellnummer]
* **Klassifizierung:** [FREITEXT: z. B. Class II]
* **Regulation Number:** [FREITEXT: z. B. 21 CFR 870.1234]
* **Product Code:** [FREITEXT: FDA Product Code]
* **Predicate Device:** [FREITEXT: 510(k)-Nummer des Predicate Device, Herstellername]

Wir bestätigen unsere Absicht, gemäß 21 CFR 807.87 zu verfahren.

<BEISPIEL: Die [Firma XYZ] mit Sitz in [Stadt, Land] beabsichtigt, das Produkt [AcmeFlow Infusionspumpe Modell AF-2000] für die [intravenöse Infusionstherapie in klinischen Umgebungen] zu vermarkten.>

Mit freundlichen Grüßen,

[FREITEXT: Vor- und Nachname der zeichnungsberechtigten Person]
[FREITEXT: Titel]
[FREITEXT: Firmenname]
```

### English (en-US)

```markdown
# Cover Letter: 510(k) Premarket Notification

[FREITEXT: Date]

Food and Drug Administration
Center for Devices and Radiological Health
Document Control Center (WO66-G609)
10903 New Hampshire Avenue
Silver Spring, MD 20993-0002
USA

**Subject: 510(k) Premarket Notification for [FREITEXT: Full Product Name with Model Number]**

Dear Sir/Madam,

Please find enclosed the 510(k) premarket notification for the medical device described below:

* **Submitter:** [FREITEXT: Submitter Company Name, Establishment Registration Number]
* **Contact:** [FREITEXT: First and Last Name of Regulatory Contact]
* **Email:** [FREITEXT: Email Address]
* **Phone:** [FREITEXT: Phone Number with Country Code]
* **Device Name:** [FREITEXT: Full Product Name]
* **Model Number:** [FREITEXT: Model Number]
* **Classification:** [FREITEXT: e.g. Class II]
* **Regulation Number:** [FREITEXT: e.g. 21 CFR 870.1234]
* **Product Code:** [FREITEXT: FDA Product Code]
* **Predicate Device:** [FREITEXT: 510(k) Number of Predicate Device, Manufacturer Name]

We confirm our intent to comply with 21 CFR 807.87.

<EXAMPLE: [Company XYZ], located in [City, Country], intends to market the [AcmeFlow Infusion Pump Model AF-2000] for [intravenous infusion therapy in clinical settings].>

Sincerely,

[FREITEXT: First and Last Name of Authorized Signatory]
[FREITEXT: Title]
[FREITEXT: Company Name]
```

---

## Template 2: 510(k) Indication for Use (FDA Form 3881)

**Regulatorische Referenz:** FDA Form 3881
**Pflicht-Pathway:** FDA 510(k) Class II
**Version:** 1.0

### Deutsch (de-DE)

```markdown
# Indication for Use Statement (FDA Form 3881)

**FDA Submission Number:** [FREITEXT: K-Nummer]
**Produktname:** [FREITEXT: Vollständiger Produktname mit Modellnummer]

## Indikation für die Verwendung

[FREITEXT: Präzise medizinische Indikation, Zielpatientenpopulation (Alter, Geschlecht, Gesundheitszustand), anatomische Anwendungsorte, klinische Umgebung, Anwendungsdauer. Bei AI/ML: zusätzlich die Modell-Intended-Use-Description.]

<BEISPIEL: Das [AcmeFlow Infusionspumpe Modell AF-2000] ist für die intravenöse Verabreichung von Medikamenten und Flüssigkeiten an erwachsene Patienten in klinischen Umgebungen (Intensivstation, Normalstation) durch qualifiziertes medizinisches Fachpersonal indiziert.>

## Kontraindikationen

[FREITEXT: Bekannte Kontraindikationen; z. B. Patientengruppen, für die das Produkt nicht geeignet ist; spezifische Medikamente, die nicht verabreicht werden dürfen.]

<BEISPIEL: Nicht für die intrathekale oder epidurale Verabreichung indiziert. Nicht für die Verwendung in der Neonatologie zugelassen.>

## Patient Population

[FREITEXT: Alter, Geschlecht, Gesundheitszustand]

## Klinische Umgebung

[FREITEXT: Klinisches Setting, z. B. Krankenhaus, Klinik, Heimpflege]

## Anwender

[FREITEXT: Qualifikationsanforderungen an die Anwender, z. B. lizenziertes medizinisches Fachpersonal]

**Unterschrift:** __________________________
**Datum:** [FREITEXT: Datum]
**Name (gedruckt):** [FREITEXT: Vor- und Nachname]
**Titel:** [FREITEXT: Titel]
```

---

## Template 3: 510(k) Substantial Equivalence Comparison Table

**Regulatorische Referenz:** 21 CFR 807.100
**Pflicht-Pathway:** FDA 510(k) Class II
**Version:** 1.0

### Deutsch (de-DE)

```markdown
# Substantial-Equivalence-Comparison-Table

**Vorgeschlagenes Produkt:** [FREITEXT: Produktname, Modellnummer]
**Predicate Device:** [FREITEXT: 510(k)-Nummer, Herstellername, Modellnummer]

| Merkmal | Vorgeschlagenes Produkt | Predicate Device | Diskussion |
|---|---|---|---|
| **Intended Use** | [FREITEXT: Zweckbestimmung] | [FREITEXT: Zweckbestimmung] | [FREITEXT: Vergleich] |
| **Indikation** | [FREITEXT: Indikation] | [FREITEXT: Indikation] | [FREITEXT: Vergleich] |
| **Patientenpopulation** | [FREITEXT: Alter, Geschlecht] | [FREITEXT: Alter, Geschlecht] | [FREITEXT: Vergleich] |
| **Material (Patient-Contact)** | [FREITEXT: Material] | [FREITEXT: Material] | [FREITEXT: Vergleich + ggf. Biokomp-Test-Referenz] |
| **Material (Gehäuse)** | [FREITEXT: Material] | [FREITEXT: Material] | [FREITEXT: Vergleich] |
| **Energiequelle** | [FREITEXT: z. B. AC 100-240V, 50-60Hz] | [FREITEXT: gleiche Spec] | [FREITEXT: Vergleich] |
| **Sterilisation** | [FREITEXT: Methode] | [FREITEXT: Methode] | [FREITEXT: Vergleich] |
| **Software-Funktionen** | [FREITEXT: Liste] | [FREITEXT: Liste] | [FREITEXT: Vergleich + IEC 62304-Level] |
| **Dimensionen** | [FREITEXT: L×B×H in mm] | [FREITEXT: Spec] | [FREITEXT: Vergleich] |
| **Gewicht** | [FREITEXT: g oder kg] | [FREITEXT: Spec] | [FREITEXT: Vergleich] |
| **Leistungs-Spec** | [FREITEXT: Schlüsselparameter] | [FREITEXT: Spec] | [FREITEXT: Vergleich] |
| **Cybersecurity** | [FREITEXT: Maßnahmen] | [FREITEXT: Spec] | [FREITEXT: Vergleich] |

<BEISPIEL: Die Materialunterschiede im Patient-Contact-Bereich (neues Medizinisches Silikon) wurden durch Biokompatibilitätstests nach ISO 10993 adressiert.>
```

### English (en-US)

```markdown
# Substantial-Equivalence Comparison Table

**Subject Device:** [FREITEXT: Device Name, Model Number]
**Predicate Device:** [FREITEXT: 510(k) Number, Manufacturer Name, Model Number]

| Feature | Subject Device | Predicate Device | Discussion |
|---|---|---|---|
| **Intended Use** | [FREITEXT: Intended Use Statement] | [FREITEXT: Intended Use Statement] | [FREITEXT: Comparison] |
| **Indication** | [FREITEXT: Indication] | [FREITEXT: Indication] | [FREITEXT: Comparison] |
| **Patient Population** | [FREITEXT: Age, Sex] | [FREITEXT: Age, Sex] | [FREITEXT: Comparison] |
| **Material (Patient Contact)** | [FREITEXT: Material] | [FREITEXT: Material] | [FREITEXT: Comparison + Biocomp Test Ref] |
| **Material (Housing)** | [FREITEXT: Material] | [FREITEXT: Material] | [FREITEXT: Comparison] |
| **Power Source** | [FREITEXT: e.g. AC 100-240V, 50-60Hz] | [FREITEXT: same spec] | [FREITEXT: Comparison] |
| **Sterilization** | [FREITEXT: Method] | [FREITEXT: Method] | [FREITEXT: Comparison] |
| **Software Functions** | [FREITEXT: List] | [FREITEXT: List] | [FREITEXT: Comparison + IEC 62304 Level] |
| **Dimensions** | [FREITEXT: L×W×H in mm] | [FREITEXT: Spec] | [FREITEXT: Comparison] |
| **Weight** | [FREITEXT: g or kg] | [FREITEXT: Spec] | [FREITEXT: Comparison] |
| **Performance Spec** | [FREITEXT: Key Parameters] | [FREITEXT: Spec] | [FREITEXT: Comparison] |
| **Cybersecurity** | [FREITEXT: Measures] | [FREITEXT: Spec] | [FREITEXT: Comparison] |

<EXAMPLE: Material differences in the patient-contact area (new medical-grade silicone) have been addressed through ISO 10993 biocompatibility testing.>
```

---

## Template 4: Risk Management Plan (ISO 14971-konform)

**Regulatorische Referenz:** ISO 14971:2019 §3.4
**Pflicht-Pathway:** Alle FDA + EU MDR
**Version:** 1.0

### Deutsch (de-DE)

```markdown
# Risk Management Plan

**Produkt:** [FREITEXT: Produktname, Modellnummer]
**Plan-Version:** [FREITEXT: Versionsnummer]
**Datum:** [FREITEXT: Erstellungsdatum]
**Autor:** [FREITEXT: Name + Qualifikation]

## 1. Zweck und Geltungsbereich
[FREITEXT: Kurze Beschreibung des Plans + Geltungsbereich = gesamter Produktlebenszyklus]

## 2. Verantwortlichkeiten
- Risk-Manager: [FREITEXT: Name]
- Risk-Team: [FREITEXT: Mitglieder]
- Risk-Manager-Berichtsweg: [FREITEXT: An Management + Regulatory-Affairs]

## 3. Risikoakzeptanzkriterien
- Akzeptable Risiken: [FREITEXT: Schwellenwerte für Severity × Probability]
- Nicht akzeptable Risiken: [FREITEXT: Definition]
- ALARP (As Low As Reasonably Practicable) anwenden: [FREITEXT: ja / nein]

## 4. Risikomanagement-Aktivitäten pro Phase
| Phase | Aktivität | Verantwortlich | Output |
|---|---|---|---|
| Design Input | Risk Analysis (Preliminary Hazard Analysis) | [FREITEXT] | [FREITEXT] |
| Design Output | Risk Control Measures | [FREITEXT] | [FREITEXT] |
| Verifizierung | Risk Control Verification | [FREITEXT] | [FREITEXT] |
| Validierung | Overall Risk-Benefit-Analysis | [FREITEXT] | [FREITEXT] |
| Post-Market | PMS, CAPA | [FREITEXT] | [FREITEXT] |

## 5. Methoden der Risikobewertung
[FREITEXT: z. B. FMEA, FTA, HAZOP, Preliminary Hazard Analysis, Fault Tree]

## 6. Akzeptanzkriterien für Gesamtrisiko
[FREITEXT: Schwellenwerte]

<BEISPIEL: Alle Risiken mit Severity = Critical (S4) müssen eliminiert werden, auch wenn das die Reduktion auf ein ALARP-Niveau nicht rechtfertigt.>

## 7. Verifikations- und Validierungs-Methoden
[FREITEXT: Spezifische Test-Protokolle, Bench-Tests, klinische Studien]

## 8. Dokumentation und Aufzeichnungen
[FREITEXT: Verweis auf Risk Management File, RMR, CER/PER]

## 9. Lebenszyklus-Aktivitäten
- [FREITEXT: Pre-Production, Production, Post-Production, Decommissioning]
```

### English (en-US)

```markdown
# Risk Management Plan (per ISO 14971)

**Product:** [FREITEXT: Product Name, Model Number]
**Plan Version:** [FREITEXT: Version Number]
**Date:** [FREITEXT: Date]
**Author:** [FREITEXT: Name + Qualification]

## 1. Purpose and Scope
[FREITEXT: Brief description of the plan + scope = entire product lifecycle]

## 2. Responsibilities
- Risk Manager: [FREITEXT: Name]
- Risk Team: [FREITEXT: Members]
- Reporting Line: [FREITEXT: To Management + Regulatory Affairs]

## 3. Risk Acceptability Criteria
- Acceptable risks: [FREITEXT: Thresholds for Severity × Probability]
- Unacceptable risks: [FREITEXT: Definition]
- ALARP applied: [FREITEXT: yes / no]

## 4. Risk Management Activities per Phase
| Phase | Activity | Responsible | Output |
|---|---|---|---|
| Design Input | Risk Analysis (Preliminary Hazard Analysis) | [FREITEXT] | [FREITEXT] |
| Design Output | Risk Control Measures | [FREITEXT] | [FREITEXT] |
| Verification | Risk Control Verification | [FREITEXT] | [FREITEXT] |
| Validation | Overall Risk-Benefit-Analysis | [FREITEXT] | [FREITEXT] |
| Post-Market | PMS, CAPA | [FREITEXT] | [FREITEXT] |

## 5. Methods of Risk Evaluation
[FREITEXT: e.g. FMEA, FTA, HAZOP, Preliminary Hazard Analysis, Fault Tree]

## 6. Criteria for Overall Risk Acceptability
[FREITEXT: Thresholds]

<EXAMPLE: All risks with Severity = Critical (S4) must be eliminated, even if the reduction to ALARP level does not justify it.>

## 7. Verification and Validation Methods
[FREITEXT: Specific test protocols, bench tests, clinical studies]

## 8. Documentation and Records
[FREITEXT: Reference to Risk Management File, RMR, CER/PER]

## 9. Lifecycle Activities
- [FREITEXT: Pre-Production, Production, Post-Production, Decommissioning]
```

---

## Template 5: EU Declaration of Conformity (Annex IV MDR)

**Regulatorische Referenz:** EU MDR 2017/745, Anhang IV
**Pflicht-Pathway:** EU MDR alle Klassen
**Version:** 1.0

### Deutsch (de-DE)

```markdown
# EU-Konformitätserklärung
(Declaration of Conformity – DoC)
gemäß Anhang IV der Verordnung (EU) 2017/745 (MDR)

## Hersteller
**Name:** [FREITEXT: Firmenname des Herstellers]
**Adresse (SRN-Adresse):** [FREITEXT: Vollständige Adresse]
**SRN (Single Registration Number):** [FREITEXT: SRN-Code]

## EU-Bevollmächtigter (falls Hersteller außerhalb EU)
**Name:** [FREITEXT: Name des EU-Bevollmächtigten]
**Adresse:** [FREITEXT: Adresse]
**SRN:** [FREITEXT: SRN]

## Produkt
**Produktname:** [FREITEXT: Produktname]
**Modellnummer:** [FREITEXT: Modellnummer]
**Basis-UDI-DI:** [FREITEXT: UDI-Code]
**EMDN-Code:** [FREITEXT: European Medical Device Nomenclature]
**Risikoklasse:** [FREITEXT: Klasse I, IIa, IIb, III]
**Verwendungszweck:** [FREITEXT: Kurzbeschreibung]

## Konformitätsbewertung
**Verfahren gemäß Anhang:** [FREITEXT: z. B. Anhang II + III für Class IIa]
**Notified Body:** [FREITEXT: Name + 4-stellige Kennnummer, z. B. TÜV-Süd 0123]
**Zertifikate:**
- [FREITEXT: Certificate Number, Datum, Gültigkeit]

## Konformitätserklärung
Wir, [FREITEXT: Firmenname], erklären in alleiniger Verantwortung, dass das oben genannte Produkt den Anforderungen der Verordnung (EU) 2017/745 (MDR) und gegebenenfalls weiterer anwendbarer EU-Rechtsvorschriften entspricht.

## Anwendbare harmonisierte Normen
- EN ISO 13485:2016 +A11:2021
- EN ISO 14971:2019 +A11:2021
- EN 62304:2006 +AC:2008
- EN 60601-1:2006 +A1:2013 +A2:2021 (falls Medizingerät)
- [FREITEXT: Weitere anwendbare Normen]

## Grundlegende Sicherheits- und Leistungsanforderungen
Die Einhaltung der Anhang-I-Anforderungen ist im Technical File dokumentiert (Anhang II + III).

**Ort:** [FREITEXT: Ort der Ausstellung]
**Datum:** [FREITEXT: Datum]
**Name:** [FREITEXT: Name des Unterzeichnenden]
**Titel:** [FREITEXT: Geschäftsführer / PRRC / Regulatory Affairs Director]
**Unterschrift:** __________________________
```

---

## Template 6: SaMD Predetermined Change Control Plan (PCCP)

**Regulatorische Referenz:** FDA Guidance „Predetermined Change Control Plans for Medical Devices" 2024
**Pflicht-Pathway:** FDA 510(k) + De Novo + SaMD
**Version:** 1.0

### Deutsch (de-DE)

```markdown
# Predetermined Change Control Plan (PCCP)

**Produkt:** [FREITEXT: SaMD-Name, Version]
**Plan-Version:** [FREITEXT: v1.0]
**Datum:** [FREITEXT: Datum]
**Bezug zur 510(k)-Submission:** [FREITEXT: K-Nummer]

## 1. Beschreibung der geplanten Änderungen
[FREITEXT: Welche konkreten Änderungen am SaMD sind geplant? z. B. AI/ML-Modell-Retraining, Performance-Threshold-Anpassungen, neue Features, neue Datenquellen]

<BEISPIEL: Halbjährliches Retraining des AI-Algorithmus mit neuen Trainingsdaten aus zugelassenen klinischen Datenbanken; Anpassung der Decision-Threshold von 0.5 auf 0.4-0.6; Hinzufügen neuer Klassen-Subpopulationen.>

## 2. Änderungs-Methodik
[FREITEXT: Methodische Beschreibung des Retrainings, Validierungs-Anforderungen, Output-Constraints]

## 3. Verifikations- und Validierungsplan
- Pre-Deployment-Validation: [FREITEXT: Welche Test-Sets, Performance-Metriken]
- Post-Deployment-Monitoring: [FREITEXT: Welche Metriken, Schwellenwerte]
- Statistische Tests: [FREITEXT: Power-Analyse, Signifikanz-Level]

## 4. Auswirkungs-Assessment
[FREITEXT: Mögliche Auswirkungen auf Sicherheit und Wirksamkeit; Risiko-Bewertung pro geplanter Änderung]

## 5. Locked-Constraints
[FREITEXT: Welche Parameter sind NICHT änderbar — z. B. Indikation, Output-Typ, Safety-Thresholds]

## 6. Stop-Criteria
[FREITEXT: Wann wird die Änderung NICHT deployed; z. B. Performance-Drop > 5%]

## 7. Post-Market-Surveillance
[FREITEXT: Monitoring der Real-World-Performance nach Deployment]

## 8. Update-Cycle
[FREITEXT: Häufigkeit der PCCP-Review und FDA-Notification]
```

---

## Template 7: DHF Outline (Design History File)

**Regulatorische Referenz:** 21 CFR 820.30(j) + EU MDR Anhang II
**Pflicht-Pathway:** FDA 510(k), De Novo, PMA + EU MDR alle Klassen
**Version:** 1.0

### Deutsch (de-DE)

```markdown
# Design History File (DHF) Outline

**Produkt:** [FREITEXT: Produktname, Modellnummer]
**DHF-Version:** [FREITEXT: Versionsnummer]
**Datum:** [FREITEXT: Datum]

## 1. Design Control Plan
[FREITEXT: Verweis auf Design-Control-Plan-Dokument oder Inhalt]

## 2. Design Input Requirements
- User Needs
- Product Requirements
- Regulatory Requirements
- Standards (z. B. ISO 14971, IEC 60601-1)
- Risk Control Measures

## 3. Design Output
- Design Specifications
- Engineering Drawings
- Material Specifications
- Software Documentation
- Labeling

## 4. Design Review Records
[FREITEXT: Datum, Teilnehmer, Ergebnis pro Design-Review]

## 5. Design Verification (per ISO 13485 §7.3.6)
[FREITEXT: Verifikations-Protokolle, -Berichte, -Ergebnisse]

## 6. Design Validation (per ISO 13485 §7.3.7)
[FREITEXT: Validierungs-Protokolle, -Berichte, -Ergebnisse]

## 7. Design Transfer (Design to Production)
[FREITEXT: Verweis auf DMR]

## 8. Design Changes
[FREITEXT: Chronik der Design-Änderungen mit Begründung, Genehmigung]

## 9. Risk Management File
[FREITEXT: Verweis auf RMF, RMP, RMR]

## 10. Design History File Index
[FREITEXT: Master-Index aller DHF-Dokumente mit Versionen]
```

### English (en-US)

```markdown
# Design History File (DHF) Outline

**Product:** [FREITEXT: Product Name, Model Number]
**DHF Version:** [FREITEXT: Version Number]
**Date:** [FREITEXT: Date]

## 1. Design Control Plan
[FREITEXT: Reference to Design Control Plan document or content]

## 2. Design Input Requirements
- User Needs
- Product Requirements
- Regulatory Requirements
- Standards (e.g. ISO 14971, IEC 60601-1)
- Risk Control Measures

## 3. Design Output
- Design Specifications
- Engineering Drawings
- Material Specifications
- Software Documentation
- Labeling

## 4. Design Review Records
[FREITEXT: Date, participants, outcome per design review]

## 5. Design Verification (per ISO 13485 §7.3.6)
[FREITEXT: Verification protocols, reports, results]

## 6. Design Validation (per ISO 13485 §7.3.7)
[FREITEXT: Validation protocols, reports, results]

## 7. Design Transfer (Design to Production)
[FREITEXT: Reference to DMR]

## 8. Design Changes
[FREITEXT: Chronology of design changes with justification, approval]

## 9. Risk Management File
[FREITEXT: Reference to RMF, RMP, RMR]

## 10. Design History File Index
[FREITEXT: Master index of all DHF documents with versions]
```

---

## Template 8: DMR Outline (Device Master Record)

**Regulatorische Referenz:** 21 CFR 820.181 + EU MDR Anhang II
**Pflicht-Pathway:** FDA alle Klassen + EU MDR alle Klassen
**Version:** 1.0

### Deutsch (de-DE)

```markdown
# Device Master Record (DMR) Outline

**Produkt:** [FREITEXT: Produktname, Modellnummer]
**DMR-Version:** [FREITEXT: Versionsnummer]
**Datum:** [FREITEXT: Datum]

## 1. Produktbeschreibung
- Produktname, Modellnummer
- Varianten
- Zubehör
- UDI-DI

## 2. Klassifizierung und Zweckbestimmung
[FREITEXT: FDA-Klasse, EU-Klasse, GMDN/EMDN-Code]

## 3. Material-Spezifikationen
[FREITEXT: BOM, RoHS-Konformität, Material-Zertifikate]

## 4. Fertigungs-Verfahren
[FREITEXT: Produktions-Workflow, kritische Prozess-Parameter]

## 5. Qualitätskontroll-Verfahren
[FREITEXT: In-Prozess-Tests, End-Tests, Akzeptanzkriterien]

## 6. Verpackungs- und Etikettierungs-Spezifikationen
[FREITEXT: Verpackungs-Zeichnungen, Label-Layouts]

## 7. Installations- und Service-Anweisungen
[FREITEXT: Falls zutreffend]

## 8. Sterilisations-Validierung
[FREITEXT: Falls zutreffend: Methode, SAL, Validierungsbericht]

## 9. Software-Build-Spezifikation
[FREITEXT: Falls zutreffend: Build-Nummer, Komponenten-Versionen]

## 10. Mitarbeiter-Schulungs-Anforderungen
[FREITEXT: Anforderungen an Produktionsmitarbeiter]

## 11. Aufzeichnungen über Audit-Trail
[FREITEXT: 21 CFR Part 11-konformer Audit-Trail der DMR-Änderungen]
```

### English (en-US)

```markdown
# Device Master Record (DMR) Outline

**Product:** [FREITEXT: Product Name, Model Number]
**DMR Version:** [FREITEXT: Version Number]
**Date:** [FREITEXT: Date]

## 1. Product Description
- Product Name, Model Number
- Variants
- Accessories
- UDI-DI

## 2. Classification and Intended Use
[FREITEXT: FDA Class, EU Class, GMDN/EMDN Code]

## 3. Material Specifications
[FREITEXT: BOM, RoHS compliance, material certificates]

## 4. Manufacturing Procedures
[FREITEXT: Production workflow, critical process parameters]

## 5. Quality Control Procedures
[FREITEXT: In-process tests, final tests, acceptance criteria]

## 6. Packaging and Labeling Specifications
[FREITEXT: Packaging drawings, label layouts]

## 7. Installation and Service Instructions
[FREITEXT: If applicable]

## 8. Sterilization Validation
[FREITEXT: If applicable: method, SAL, validation report]

## 9. Software Build Specification
[FREITEXT: If applicable: build number, component versions]

## 10. Employee Training Requirements
[FREITEXT: Requirements for production employees]

## 11. Audit Trail Records
[FREITEXT: 21 CFR Part 11-compliant audit trail of DMR changes]
```

---

## Template 9: Risk Management Report (RMR, ISO 14971)

**Regulatorische Referenz:** ISO 14971:2019 §9
**Pflicht-Pathway:** Alle FDA + EU MDR
**Version:** 1.0

### Deutsch (de-DE)

```markdown
# Risk Management Report (RMR)

**Produkt:** [FREITEXT: Produktname, Modellnummer]
**RMR-Version:** [FREITEXT: v1.0]
**Datum:** [FREITEXT: Datum]

## 1. Executive Summary
[FREITEXT: Gesamtrisiko-Evaluation, Akzeptanzkriterien erfüllt?]

## 2. Verweis auf Risk Management Plan
[FREITEXT: RMP-Referenz]

## 3. Risikoanalyse
[FREITEXT: Zusammenfassung der identifizierten Hazards, FMEA-Ergebnisse]

## 4. Risikobewertung
[FREITEXT: Severity × Probability pro Hazard]

## 5. Risikobeherrschung
[FREITEXT: Implementierte Risk-Control-Maßnahmen]

## 6. Verifikation der Risikobeherrschung
[FREITEXT: Verifikations-Methoden + Ergebnisse]

## 7. Gesamt-Restrisiko-Bewertung
[FREITEXT: Akzeptanzkriterien erfüllt?]

## 8. Risk-Benefit-Analysis
[FREITEXT: Nutzen-Risiko-Abwägung pro Indikation]

## 9. Schlussfolgerung
[FREITEXT: Produkt kann in Verkehr gebracht werden?]

**Unterschrift Risk-Manager:** __________________________
**Datum:** [FREITEXT: Datum]
```

### English (en-US)

```markdown
# Risk Management Report (RMR) — per ISO 14971

**Product:** [FREITEXT: Product Name, Model Number]
**RMR Version:** [FREITEXT: v1.0]
**Date:** [FREITEXT: Date]

## 1. Executive Summary
[FREITEXT: Overall risk evaluation; acceptability criteria met?]

## 2. Reference to Risk Management Plan
[FREITEXT: RMP reference]

## 3. Risk Analysis
[FREITEXT: Summary of identified hazards, FMEA results]

## 4. Risk Evaluation
[FREITEXT: Severity × Probability per hazard]

## 5. Risk Control
[FREITEXT: Implemented risk-control measures]

## 6. Risk Control Verification
[FREITEXT: Verification methods + results]

## 7. Overall Residual Risk Evaluation
[FREITEXT: Acceptability criteria met?]

## 8. Risk-Benefit Analysis
[FREITEXT: Benefit-risk assessment per indication]

## 9. Conclusion
[FREITEXT: Product can be placed on the market?]

**Risk Manager Signature:** __________________________
**Date:** [FREITEXT: Date]
```

---

## Template 10: PMS Plan (Post-Market Surveillance, EU MDR Art. 84)

**Regulatorische Referenz:** EU MDR 2017/745 Art. 84
**Pflicht-Pathway:** EU MDR alle Klassen
**Version:** 1.0

### Deutsch (de-DE)

```markdown
# Post-Market Surveillance Plan (PMS Plan)

**Produkt:** [FREITEXT: Produktname, UDI-DI]
**PMS-Plan-Version:** [FREITEXT: v1.0]
**Datum:** [FREITEXT: Datum]
**PRRC:** [FREITEXT: Name der Person Responsible for Regulatory Compliance]

## 1. Zweck und Geltungsbereich
[FREITEXT: Überwachungsstrategie für den gesamten Produktlebenszyklus nach Inverkehrbringung]

## 2. Datenquellen
- [FREITEXT: z. B. Beschwerden, Vorfälle, Kundenfeedback, MAUDE, Vigilanz-Meldungen]
- [FREITEXT: Klinische Studien, Register, Literatur]

## 3. Methoden der Datenerhebung
[FREITEXT: Fragebögen, Surveys, Vigilanz-Systeme]

## 4. Indikatoren und Schwellenwerte
[FREITEXT: Welche Metriken werden überwacht; welche Werte lösen Aktionen aus?]

## 5. Zeitplan
[FREITEXT: Häufigkeit der Datenauswertung (z. B. quartalsweise)]

## 6. Verantwortlichkeiten
[FREITEXT: PRRC, QM-Manager, Customer Service]

## 7. Outputs
- PSUR (Periodic Safety Update Report)
- Vigilanz-Meldungen (Serious Incidents, Field Safety Corrective Actions)
- CAPA
- Update der Risikobewertung

## 8. Schnittstellen
[FREITEXT: Schnittstellen zu Risk Management, CER, PMCF, Vigilanz-System]
```

### English (en-US)

```markdown
# Post-Market Surveillance Plan (PMS Plan)

**Product:** [FREITEXT: Product Name, UDI-DI]
**PMS Plan Version:** [FREITEXT: v1.0]
**Date:** [FREITEXT: Date]
**PRRC:** [FREITEXT: Name of Person Responsible for Regulatory Compliance]

## 1. Purpose and Scope
[FREITEXT: Surveillance strategy for the entire product lifecycle post-market]

## 2. Data Sources
- [FREITEXT: e.g. complaints, incidents, customer feedback, MAUDE, vigilance reports]
- [FREITEXT: Clinical studies, registries, literature]

## 3. Data Collection Methods
[FREITEXT: Questionnaires, surveys, vigilance systems]

## 4. Indicators and Thresholds
[FREITEXT: Which metrics are monitored; which values trigger actions?]

## 5. Time Schedule
[FREITEXT: Frequency of data analysis (e.g. quarterly)]

## 6. Responsibilities
[FREITEXT: PRRC, QA Manager, Customer Service]

## 7. Outputs
- PSUR (Periodic Safety Update Report)
- Vigilance reports (Serious Incidents, Field Safety Corrective Actions)
- CAPA
- Update of risk evaluation

## 8. Interfaces
[FREITEXT: Interfaces to Risk Management, CER, PMCF, vigilance system]
```

---

## Template 11: PSUR Outline (Periodic Safety Update Report)

**Regulatorische Referenz:** EU MDR 2017/745 Art. 86
**Pflicht-Pathway:** EU MDR Class IIa, IIb, III (Class I nur, falls nicht Klasse I mit niedrigem Risiko)
**Version:** 1.0

### Deutsch (de-DE)

```markdown
# Periodic Safety Update Report (PSUR)

**Produkt:** [FREITEXT: Produktname, UDI-DI]
**PSUR-Reporting-Period:** [FREITEXT: von - bis]
**PSUR-Version:** [FREITEXT: v1.0]
**Datum:** [FREITEXT: Erstellungsdatum]

## 1. Executive Summary
[FREITEXT: Kurzübersicht der Sicherheits-/Leistungs-Lage im Berichtszeitraum]

## 2. Produktinformationen
[FREITEXT: UDI-DI, Klassifizierung, Zweckbestimmung, Vertriebsvolumen]

## 3. Quantitative Daten
- Verkaufsvolumen
- Anzahl Anwender
- Geografische Verteilung

## 4. Vigilanz-Daten
- Anzahl Beschwerden (Total, kategorisiert)
- Anzahl Serious Incidents
- Anzahl Field Safety Corrective Actions (FSCA)
- Anzahl Rückrufe

## 5. Nicht-klinische Studien
[FREITEXT: Updates aus Bench-Tests, Verifikations-Studien]

## 6. Klinische Daten
- PMCF-Studien (laufend, abgeschlossen)
- CER-Update
- Neue klinische Daten aus der Literatur

## 7. Risikomanagement-Update
[FREITEXT: Änderungen der Risikobewertung, neue Hazards, Akzeptanzkriterien-Status]

## 8. Schlussfolgerungen
[FREITEXT: Benefit-Risk-Profil unverändert? Aktionen erforderlich?]

## 9. Aktionsplan
[FREITEXT: Anstehende CAPAs, Vigilanz, PMCF, CER-Updates]

**PRRC-Sign-off:** __________________________
**Datum:** [FREITEXT: Datum]
```

### English (en-US)

```markdown
# Periodic Safety Update Report (PSUR)

**Product:** [FREITEXT: Product Name, UDI-DI]
**PSUR Reporting Period:** [FREITEXT: from - to]
**PSUR Version:** [FREITEXT: v1.0]
**Date:** [FREITEXT: Date of Creation]

## 1. Executive Summary
[FREITEXT: Brief overview of safety/performance status in the reporting period]

## 2. Product Information
[FREITEXT: UDI-DI, classification, intended use, sales volume]

## 3. Quantitative Data
- Sales volume
- Number of users
- Geographic distribution

## 4. Vigilance Data
- Number of complaints (total, categorized)
- Number of Serious Incidents
- Number of Field Safety Corrective Actions (FSCA)
- Number of recalls

## 5. Non-Clinical Studies
[FREITEXT: Updates from bench tests, verification studies]

## 6. Clinical Data
- PMCF studies (ongoing, completed)
- CER update
- New clinical data from the literature

## 7. Risk Management Update
[FREITEXT: Changes in risk evaluation, new hazards, acceptability criteria status]

## 8. Conclusions
[FREITEXT: Benefit-risk profile unchanged? Actions required?]

## 9. Action Plan
[FREITEXT: Upcoming CAPAs, vigilance, PMCF, CER updates]

**PRRC Sign-off:** __________________________
**Date:** [FREITEXT: Date]
```

---

## Template 12: SSCP (Summary of Safety and Clinical Performance)

**Regulatorische Referenz:** EU MDR 2017/745 Art. 32
**Pflicht-Pathway:** EU MDR Class III + Implantate
**Version:** 1.0

### Deutsch (de-DE)

```markdown
# Summary of Safety and Clinical Performance (SSCP)

**Produkt:** [FREITEXT: Produktname, UDI-DI]
**SSCP-Version:** [FREITEXT: v1.0]
**Datum:** [FREITEXT: Datum]
**Erstellt von:** [FREITEXT: Hersteller / PRRC]
**Notified Body:** [FREITEXT: NB-Name + Kennnummer]

## Für Anwender und Patienten (öffentlich zugänglich in EUDAMED)

### 1. Produktidentifikation
[FREITEXT: Produktname, UDI-DI, Basis-UDI-DI, Modellnummer]

### 2. Zweckbestimmung
[FREITEXT: Genaue Indikation, Patientenpopulation, klinische Umgebung]

### 3. Kontraindikationen
[FREITEXT: Auflistung]

### 4. Warnungen und Vorsichtsmaßnahmen
[FREITEXT: Auflistung]

### 5. Beschreibung des Produkts
[FREITEXT: Wirkprinzip, Material, Funktionsweise]

### 6. Vorgesehene Anwendung
[FREITEXT: Anwenderprofil, Anwendungsumgebung]

### 7. Verbleibende Risiken und unerwünschte Wirkungen
[FREITEXT: Liste aus RMR]

### 8. Zusammenfassung der klinischen Bewertung
[FREITEXT: CER-Summary, klinische Daten]

### 9. Zusammenfassung der PMCF-Aktivitäten
[FREITEXT: PMCF-Plan und laufende Studien]

### 10. Diagnostische oder therapeutische Alternativen
[FREITEXT: Alternative Produkte, klinische Alternativen]

### 11. Empfohlene Schulungsmaßnahmen
[FREITEXT: Anwender-Schulungen]

## Für Healthcare Professionals (vertraulich)

### 12. Daten aus Vigilanz-System
[FREITEXT: Trendanalysen, Serious Incidents, ggf. FSCA]

### 13. Aktuelle Risiko-Nutzen-Bewertung
[FREITEXT: Quantitative Nutzen-Risiko-Analyse]

### 14. Laufende klinische Studien
[FREITEXT: PMCF-Studien, Investigator-Initiated Studies]
```

### English (en-US)

```markdown
# Summary of Safety and Clinical Performance (SSCP)

**Product:** [FREITEXT: Product Name, UDI-DI]
**SSCP Version:** [FREITEXT: v1.0]
**Date:** [FREITEXT: Date]
**Created by:** [FREITEXT: Manufacturer / PRRC]
**Notified Body:** [FREITEXT: NB Name + 4-digit ID]

## For Users and Patients (publicly accessible in EUDAMED)

### 1. Product Identification
[FREITEXT: Product name, UDI-DI, Basic UDI-DI, model number]

### 2. Intended Use
[FREITEXT: Precise indication, patient population, clinical setting]

### 3. Contraindications
[FREITEXT: List]

### 4. Warnings and Precautions
[FREITEXT: List]

### 5. Product Description
[FREITEXT: Operating principle, material, function]

### 6. Intended Use Environment
[FREITEXT: User profile, application environment]

### 7. Residual Risks and Undesirable Side Effects
[FREITEXT: List from RMR]

### 8. Summary of Clinical Evaluation
[FREITEXT: CER summary, clinical data]

### 9. Summary of PMCF Activities
[FREITEXT: PMCF plan and ongoing studies]

### 10. Diagnostic or Therapeutic Alternatives
[FREITEXT: Alternative products, clinical alternatives]

### 11. Recommended Training Measures
[FREITEXT: User training]

## For Healthcare Professionals (confidential)

### 12. Data from Vigilance System
[FREITEXT: Trend analyses, serious incidents, FSCA if any]

### 13. Current Risk-Benefit Assessment
[FREITEXT: Quantitative benefit-risk analysis]

### 14. Ongoing Clinical Studies
[FREITEXT: PMCF studies, investigator-initiated studies]
```

---

## Template 13: UDI-Vergabe-Vorlage

**Regulatorische Referenz:** EU MDR 2017/745 Art. 27-29 + FDA 21 CFR 801 Subpart B
**Pflicht-Pathway:** FDA alle Klassen + EU MDR alle Klassen
**Version:** 1.0

### Deutsch (de-DE)

```markdown
# UDI-Vergabe-Vorlage

**Produkt:** [FREITEXT: Produktname, Modellnummer]

## 1. UDI-DI (Device Identifier) — Statischer Teil
- **Code:** [FREITEXT: z. B. (01)04046964700023(11)240102]
- **Issuing Agency:** [FREITEXT: GS1 / HIBCC / ICCBBA]
- **Kodiersystem:** [FREITEXT: GTIN / HIBCC-LIC / ISBT-128]

## 2. UDI-PI (Production Identifier) — Dynamischer Teil
- **Lot/Batch:** [FREITEXT: (10)ABC123]
- **Serial:** [FREITEXT: (21)9876543210]
- **Expiration Date:** [FREITEXT: (17)240102 in YYMMDD]
- **Manufacturing Date:** [FREITEXT: (11)240102]

## 3. Labeling-Hierarchie
| Hierarchie-Stufe | UDI-DI | UDI-PI |
|---|---|---|
| **Master-Bundle** (z. B. Karton) | [FREITEXT: UDI-DI-Master] | [FREITEXT: Lot-Number-Master] |
| **Multi-Pack** | [FREITEXT: UDI-DI-Multipack] | [FREITEXT: Lot-Number-Multipack] |
| **Unit (einzelnes Produkt)** | [FREITEXT: UDI-DI-Unit] | [FREITEXT: Serial-Number-Unit] |

## 4. EUDAMED-Registrierung
- **UDI-Database:** https://ec.europa.eu/tools/eudamed/
- **Registration-Date:** [FREITEXT: Datum]
- **Status:** [FREITEXT: Pending / Active]

## 5. FDA GUDID-Registrierung
- **GUDID:** https://accessgsi.fda.gov/
- **Submission-DI:** [FREITEXT: Submission-DI-Code]
```

### English (en-US)

```markdown
# UDI Assignment Template

**Product:** [FREITEXT: Product Name, Model Number]

## 1. UDI-DI (Device Identifier) — Static Part
- **Code:** [FREITEXT: e.g. (01)04046964700023(11)240102]
- **Issuing Agency:** [FREITEXT: GS1 / HIBCC / ICCBBA]
- **Coding System:** [FREITEXT: GTIN / HIBCC-LIC / ISBT-128]

## 2. UDI-PI (Production Identifier) — Dynamic Part
- **Lot/Batch:** [FREITEXT: (10)ABC123]
- **Serial:** [FREITEXT: (21)9876543210]
- **Expiration Date:** [FREITEXT: (17)240102 in YYMMDD]
- **Manufacturing Date:** [FREITEXT: (11)240102]

## 3. Labeling Hierarchy
| Hierarchy Level | UDI-DI | UDI-PI |
|---|---|---|
| **Master Bundle** (e.g. carton) | [FREITEXT: UDI-DI-Master] | [FREITEXT: Lot-Number-Master] |
| **Multi-Pack** | [FREITEXT: UDI-DI-Multipack] | [FREITEXT: Lot-Number-Multipack] |
| **Unit (single product)** | [FREITEXT: UDI-DI-Unit] | [FREITEXT: Serial-Number-Unit] |

## 4. EUDAMED Registration
- **UDI Database:** https://ec.europa.eu/tools/eudamed/
- **Registration Date:** [FREITEXT: Date]
- **Status:** [FREITEXT: Pending / Active]

## 5. FDA GUDID Registration
- **GUDID:** https://accessgsi.fda.gov/
- **Submission DI:** [FREITEXT: Submission-DI-Code]
```

---

## Template 14: MDSAP-Audit-Checkliste

**Regulatorische Referenz:** MDSAP Audit Approach (IMDRF/MDSAP AU P0002)
**Pflicht-Pathway:** MDSAP-Audit (5 Länder: US, CA, BR, JP, AU)
**Version:** 1.0

### Deutsch (de-DE)

```markdown
# MDSAP-Audit-Checkliste (Vorbereitung)

**Audit-Typ:** [FREITEXT: Initial / Surveillance / Recertification]
**Audit-Datum:** [FREITEXT: von - bis]
**Auditing-Organization (AO):** [FREITEXT: z. B. TÜV-Süd, BSI, DEKRA]
**Hersteller:** [FREITEXT: Firmenname]

## 1. MDSAP-Audit-Tasks pro Land

### USA (FDA)
- [ ] Management Controls (Task 1)
- [ ] Design and Development (Task 2)
- [ ] Production and Process Controls (Task 3)
- [ ] CAPA (Task 4)
- [ ] Material Controls (Task 5)
- [ ] Facility and Equipment Controls (Task 6)
- [ ] Records (Task 7)
- [ ] Labeling and Packaging (Task 8)

### Canada (Health Canada)
- [ ] CMDR-SOR-98-282-Konformität
- [ ] Quality System Requirements
- [ ] Medical Device License (MDL)
- [ ] ISO 13485:2016-Konformität

### Brazil (ANVISA)
- [ ] RDC 16/2013 + RDC 665/2022
- [ ] ANVISA-Registration
- [ ] In-Country-Repräsentant

### Japan (PMDA)
- [ ] MHLW MO 169-Konformität
- [ ] MAH (Marketing Authorization Holder)
- [ ] Japan-spezifische QMS-Requirements

### Australien (TGA)
- [ ] TGA-Konformität
- [ ] ARTG-Entry
- [ ] TGO-Konformität

## 2. Zentrale Dokumente für Audit-Vorbereitung
- [ ] Quality Manual
- [ ] Quality Policy
- [ ] Process-Flow-Diagramme
- [ ] Verantwortlichkeits-Matrix (RACI)
- [ ] Management-Review-Records
- [ ] CAPA-Records
- [ ] Design History File
- [ ] Device Master Record
- [ ] Risk Management File
- [ ] PMS-Daten
- [ ] Complaint-Handling-Records
- [ ] Training-Records
- [ ] Calibration-Records
- [ ] Internal-Audit-Reports

## 3. Häufige Audit-Findings und Vorbereitung
- [FREITEXT: z. B. unzureichende Design-Verification, lückenhafte CAPA-Schließung, fehlende Risiko-Kontrollen]
```

### English (en-US)

```markdown
# MDSAP Audit Checklist (Preparation)

**Audit Type:** [FREITEXT: Initial / Surveillance / Recertification]
**Audit Date:** [FREITEXT: from - to]
**Auditing Organization (AO):** [FREITEXT: e.g. TÜV-Süd, BSI, DEKRA]
**Manufacturer:** [FREITEXT: Company Name]

## 1. MDSAP Audit Tasks per Country

### USA (FDA)
- [ ] Management Controls (Task 1)
- [ ] Design and Development (Task 2)
- [ ] Production and Process Controls (Task 3)
- [ ] CAPA (Task 4)
- [ ] Material Controls (Task 5)
- [ ] Facility and Equipment Controls (Task 6)
- [ ] Records (Task 7)
- [ ] Labeling and Packaging (Task 8)

### Canada (Health Canada)
- [ ] CMDR-SOR-98-282 Conformity
- [ ] Quality System Requirements
- [ ] Medical Device License (MDL)
- [ ] ISO 13485:2016 Conformity

### Brazil (ANVISA)
- [ ] RDC 16/2013 + RDC 665/2022
- [ ] ANVISA Registration
- [ ] In-Country Representative

### Japan (PMDA)
- [ ] MHLW MO 169 Conformity
- [ ] MAH (Marketing Authorization Holder)
- [ ] Japan-specific QMS Requirements

### Australia (TGA)
- [ ] TGA Conformity
- [ ] ARTG Entry
- [ ] TGO Conformity

## 2. Central Documents for Audit Preparation
- [ ] Quality Manual
- [ ] Quality Policy
- [ ] Process Flow Diagrams
- [ ] Responsibility Matrix (RACI)
- [ ] Management Review Records
- [ ] CAPA Records
- [ ] Design History File
- [ ] Device Master Record
- [ ] Risk Management File
- [ ] PMS Data
- [ ] Complaint Handling Records
- [ ] Training Records
- [ ] Calibration Records
- [ ] Internal Audit Reports

## 3. Common Audit Findings and Preparation
- [FREITEXT: e.g. insufficient design verification, incomplete CAPA closure, missing risk controls]
```

---

## Cross-Reference

Diese Templates sind Teil des Verzeichnisses `templates/` und werden vom `regulatory-sequence/MASTER.md` referenziert.

Verwandte Dateien:
- `CUSTOMER-GUIDE.md` (lineare Anleitung)
- `required-documents.md` (komplette Akten-Liste)
- `regulatory-sequence/MASTER.md` (8 Pathways)
- `regions/*.md` (länderspezifische Anforderungen)
