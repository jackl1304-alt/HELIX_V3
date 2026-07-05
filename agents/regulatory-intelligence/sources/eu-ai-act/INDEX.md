# EU AI Act 2024/1689 — Index & 4 Pflicht-Templates (Pass 4)

> **Stand:** 2026-07-04 (Pass 4 abgeschlossen) + Pass 6 JSON-Schemas (2026-07-05)
> **Themen-ID:** eu-ai-act
> **Anwendbar ab:** 02.08.2026 (High-Risk-AI-Pflichten)
> **Konvention:**
> - `[FREITEXT: ...]` = Platzhalter, der durch echte Kunden-Daten ersetzt werden MUSS
> - `<BEISPIEL: ...>` = Klar markiertes Beispiel; Kunde soll es löschen oder durch echte Daten ersetzen
> - Jedes Template in zwei Versionen: **de-DE** und **en-US**
> - Alle Templates bilingual
> - **JSON-Schemas** mit bilingualen Field-Labels (`title_de`, `title_en`) für Formular-Generierung — siehe `.schema.json`-Dateien

---

## Template 1: Data-Governance-Plan (EU AI Act Art. 10)

**Regulatorische Referenz:** Regulation (EU) 2024/1689 Art. 10 (Data and Data Governance)
**Pflicht-Pfad:** Alle High-Risk-AI-Systeme (Anhang III) — Medizingeräte der Klasse IIa/IIb/III mit KI/ML
**Pflicht ab:** 02.08.2026
**Version:** 1.0

### Deutsch (de-DE)

```markdown
# Data-Governance-Plan
(gemäß EU AI Act Art. 10)

**KI-System / Produkt:** [FREITEXT: Produktname, Modellnummer, Version]
**Plan-Version:** [FREITEXT: Versionsnummer]
**Datum:** [FREITEXT: Erstellungsdatum]
**Autor:** [FREITEXT: Name + Qualifikation]
**Verantwortlich für Daten-Governance:** [FREITEXT: Name der verantwortlichen Person, z. B. Data Steward]

## 1. Anwendungsbereich und Zweck
[FREITEXT: Welche Trainings-, Validierungs- und Test-Daten werden für das KI-System verwendet? Welche Datenquellen?]

## 2. Datenquellen
- **Trainings-Daten:** [FREITEXT: z. B. annotierte klinische Studien-Daten, retrospektive Patientendaten, öffentlich verfügbare Datensätze]
- **Validierungs-Daten:** [FREITEXT: separate Hold-out-Set]
- **Test-Daten:** [FREITEXT: unabhängige Test-Sets]
- **Produktions-Daten (Live):** [FREITEXT: z. B. anonymisierte Patientendaten aus Routineeinsatz]

<BEISPIEL: Trainingsdaten aus 3 klinischen Studien DE/CH/AT (n=12.500 Patientendaten, anonymisiert). Validierungsdaten: 2.500 Hold-out. Testdaten: 1.000 externe Validierung.>

## 3. Datenqualität (Art. 10(2)-(3))
- **Repräsentativität:** [FREITEXT: Welche Subpopulationen sind enthalten? Sind alle relevanten Patientengruppen vertreten?]
- **Bias-Analyse:** [FREITEXT: Welche Methoden wurden zur Bias-Erkennung eingesetzt? z. B. Fairness-Metriken, Subgruppen-Performance-Vergleiche]
- **Annotation-Qualität:** [FREITEXT: Welche Annotation-Standards? Inter-Annotator-Agreement?]
- **Daten-Redaktion:** [FREITEXT: PII-Entfernung, Anonymisierung, Pseudonymisierung]
- **Outlier-Behandlung:** [FREITEXT: Wie werden Daten-Ausreißer behandelt?]

## 4. Datenverarbeitungs-Workflow
[FREITEXT: Schritt-für-Schritt: Daten-Akquise → Annotation → Validierung → Versionierung → Archivierung]

## 5. Bias-Management
| Bias-Typ | Erkennungs-Methode | Mitigation |
|---|---|---|
| Selection Bias | [FREITEXT] | [FREITEXT] |
| Measurement Bias | [FREITEXT] | [FREITEXT] |
| Confounding | [FREITEXT] | [FREITEXT] |
| Label Bias | [FREITEXT] | [FREITEXT] |
| Deployment Bias | [FREITEXT] | [FREITEXT] |

## 6. Versionskontrolle und Audit-Trail
[FREITEXT: Wie werden Datensätze versioniert? Hash-Speicherung? Audit-Log?]

## 7. Daten-Retention und -Löschung
- **Aufbewahrungsdauer:** [FREITEXT: z. B. 10 Jahre nach Produkt-Lifecycle-Ende]
- **Lösch-Prozess:** [FREITEXT: DSGVO-konformes Löschverfahren]

## 8. Datenschutz-Compliance
- **DSGVO-Konformität:** [FREITEXT: ja / nein / Begründung]
- **Einwilligungen:** [FREITEXT: Wie wurden Einwilligungen eingeholt? Broad-Consent / Specific-Consent?]
- **Pseudonymisierung:** [FREITEXT: Methode der Pseudonymisierung]
- **Cross-Border-Transfer:** [FREITEXT: Welche Drittländer? Angemessenheitsbeschluss? SCCs?]

## 9. Lebenszyklus-Management
- **Daten-Updates:** [FREITEXT: Wann und wie werden Daten aktualisiert?]
- **Modell-Retraining:** [FREITEXT: Trigger für Retraining]
- **Daten-Drift-Detection:** [FREITEXT: Methoden zur Erkennung von Distribution-Shift]

## 10. Verantwortlichkeiten
- **Data Steward:** [FREITEXT: Name]
- **ML Engineer:** [FREITEXT: Name]
- **Clinical Expert:** [FREITEXT: Name]
- **Datenschutzbeauftragter:** [FREITEXT: Name]
- **PRRC:** [FREITEXT: Name]

**Unterschrift Data Steward:** __________________________
**Datum:** [FREITEXT: Datum]
```

### English (en-US)

```markdown
# Data Governance Plan
(per EU AI Act Art. 10)

**AI System / Product:** [FREITEXT: Product Name, Model Number, Version]
**Plan Version:** [FREITEXT: Version Number]
**Date:** [FREITEXT: Date]
**Author:** [FREITEXT: Name + Qualification]
**Data Governance Lead:** [FREITEXT: Name of Responsible Person, e.g. Data Steward]

## 1. Scope and Purpose
[FREITEXT: Which training, validation, and test data are used for the AI system? Which data sources?]

## 2. Data Sources
- **Training Data:** [FREITEXT: e.g. annotated clinical study data, retrospective patient data, publicly available datasets]
- **Validation Data:** [FREITEXT: separate hold-out set]
- **Test Data:** [FREITEXT: independent test sets]
- **Production Data (Live):** [FREITEXT: e.g. anonymized patient data from routine use]

<EXAMPLE: Training data from 3 clinical studies DE/CH/AT (n=12,500 patient data, anonymized). Validation data: 2,500 hold-out. Test data: 1,000 external validation.>

## 3. Data Quality (Art. 10(2)-(3))
- **Representativeness:** [FREITEXT: Which subpopulations are included? Are all relevant patient groups represented?]
- **Bias Analysis:** [FREITEXT: Which methods were used for bias detection? e.g. fairness metrics, subgroup performance comparisons]
- **Annotation Quality:** [FREITEXT: Which annotation standards? Inter-annotator agreement?]
- **Data Redaction:** [FREITEXT: PII removal, anonymization, pseudonymization]
- **Outlier Handling:** [FREITEXT: How are data outliers handled?]

## 4. Data Processing Workflow
[FREITEXT: Step-by-step: data acquisition → annotation → validation → versioning → archiving]

## 5. Bias Management
| Bias Type | Detection Method | Mitigation |
|---|---|---|
| Selection Bias | [FREITEXT] | [FREITEXT] |
| Measurement Bias | [FREITEXT] | [FREITEXT] |
| Confounding | [FREITEXT] | [FREITEXT] |
| Label Bias | [FREITEXT] | [FREITEXT] |
| Deployment Bias | [FREITEXT] | [FREITEXT] |

## 6. Version Control and Audit Trail
[FREITEXT: How are datasets versioned? Hash storage? Audit log?]

## 7. Data Retention and Deletion
- **Retention Period:** [FREITEXT: e.g. 10 years after product lifecycle end]
- **Deletion Process:** [FREITEXT: GDPR-compliant deletion procedure]

## 8. Data Protection Compliance
- **GDPR Compliance:** [FREITEXT: yes / no / justification]
- **Consent:** [FREITEXT: How were consents obtained? Broad consent / specific consent?]
- **Pseudonymization:** [FREITEXT: Pseudonymization method]
- **Cross-Border Transfer:** [FREITEXT: Which third countries? Adequacy decision? SCCs?]

## 9. Lifecycle Management
- **Data Updates:** [FREITEXT: When and how are data updated?]
- **Model Retraining:** [FREITEXT: Triggers for retraining]
- **Data Drift Detection:** [FREITEXT: Methods for detecting distribution shift]

## 10. Responsibilities
- **Data Steward:** [FREITEXT: Name]
- **ML Engineer:** [FREITEXT: Name]
- **Clinical Expert:** [FREITEXT: Name]
- **Data Protection Officer:** [FREITEXT: Name]
- **PRRC:** [FREITEXT: Name]

**Data Steward Signature:** __________________________
**Date:** [FREITEXT: Date]
```

---

## Template 2: Logging-Mechanismen-Beschreibung (EU AI Act Art. 12)

**Regulatorische Referenz:** Regulation (EU) 2024/1689 Art. 12 (Record-Keeping / Logging)
**Pflicht-Pfad:** Alle High-Risk-AI-Systeme (Anhang III)
**Pflicht ab:** 02.08.2026
**Version:** 1.0

### Deutsch (de-DE)

```markdown
# Logging-Mechanismen-Beschreibung
(gemäß EU AI Act Art. 12)

**KI-System / Produkt:** [FREITEXT: Produktname, Version]
**Beschreibung-Version:** [FREITEXT: v1.0]
**Datum:** [FREITEXT: Datum]
**Autor:** [FREITEXT: Name]

## 1. Zweck der Logging-Mechanismen
[FREITEXT: Zweck der automatischen Aufzeichnung — z. B. Nachvollziehbarkeit, Audit-Trail, Post-Market-Monitoring, Incident-Rekonstruktion]

## 2. Logging-Architektur
- **Speicherort:** [FREITEXT: z. B. lokale Datei, zentrale DB, Cloud-Storage]
- **Speicherformat:** [FREITEXT: z. B. JSON, append-only Log, structured Logs]
- **Aufbewahrungsdauer:** [FREITEXT: Mindestens 6 Monate nach letztem Einsatz (Art. 12(2)), empfohlen: 10 Jahre]
- **Verschlüsselung:** [FREITEXT: at-rest + in-transit Verschlüsselung]

## 3. Erfasste Events (Art. 12(1))
- **Input-Data:** [FREITEXT: Welche Eingabedaten werden geloggt? z. B. Patientendaten, Bilddaten, klinische Parameter]
- **Output-Data:** [FREITEXT: Welche Ausgaben werden geloggt? Diagnoseempfehlung, Risiko-Score, Therapie-Empfehlung]
- **Decision-Trace:** [FREITEXT: Welcher Modell-Version, welche Modell-Konfiguration wurde genutzt?]
- **User-Actions:** [FREITEXT: Bestätigung, Ablehnung, Override durch Healthcare-Professional]
- **System-Events:** [FREITEXT: Modell-Update, Config-Change, Performance-Degradation]

## 4. Log-Eintrag-Schema
```
{
  "timestamp": "[FREITEXT: ISO 8601]",
  "session_id": "[FREITEXT: UUID]",
  "user_id": "[FREITEXT: Healthcare-Professional-ID]",
  "model_version": "[FREITEXT: Modell-Version]",
  "input_hash": "[FREITEXT: SHA-256-Hash der Eingabe]",
  "output": "[FREITEXT: Modellausgabe]",
  "confidence_score": "[FREITEXT: Wahrscheinlichkeit 0-1]",
  "user_action": "[FREITEXT: accept/reject/override]"
}
```

## 5. Audit-Trail-Anforderungen
- **Unveränderlichkeit:** [FREITEXT: append-only, kryptografische Signatur]
- **Vollständigkeit:** [FREITEXT: Alle relevanten Events erfasst]
- **Konsistenz:** [FREITEXT: Zeitstempel-Synchronisation, Atomarität]

## 6. Zugriffskontrolle
- **Lesen:** [FREITEXT: Wer darf Logs lesen? z. B. QM, Regulatory, Clinical]
- **Schreiben:** [FREITEXT: nur System, keine manuellen Einträge]
- **Löschen:** [FREITEXT: nur nach Retention-Periode, mit Audit-Eintrag]

## 7. Integration mit Post-Market-Monitoring
- **Trigger für PMCF:** [FREITEXT: Welche Log-Patterns lösen PMCF-Aktivitäten aus?]
- **Vigilanz-Reporting:** [FREITEXT: Wie werden Logs in Vigilanz-Meldungen integriert?]

## 8. 21 CFR Part 11 / Annex 11 Compliance
- **Electronic Records:** [FREITEXT: ja, mit Audit-Trail]
- **Electronic Signatures:** [FREITEXT: wo zutreffend, mit Biometric oder Password + Meaning]

**Unterschrift QM-Manager:** __________________________
**Datum:** [FREITEXT: Datum]
```

### English (en-US)

```markdown
# Logging Mechanisms Description
(per EU AI Act Art. 12)

**AI System / Product:** [FREITEXT: Product Name, Version]
**Description Version:** [FREITEXT: v1.0]
**Date:** [FREITEXT: Date]
**Author:** [FREITEXT: Name]

## 1. Purpose of Logging Mechanisms
[FREITEXT: Purpose of automatic recording — e.g. traceability, audit trail, post-market monitoring, incident reconstruction]

## 2. Logging Architecture
- **Storage Location:** [FREITEXT: e.g. local file, central DB, cloud storage]
- **Storage Format:** [FREITEXT: e.g. JSON, append-only log, structured logs]
- **Retention Period:** [FREITEXT: At least 6 months after last use (Art. 12(2)), recommended: 10 years]
- **Encryption:** [FREITEXT: at-rest + in-transit encryption]

## 3. Captured Events (Art. 12(1))
- **Input Data:** [FREITEXT: Which input data are logged? e.g. patient data, image data, clinical parameters]
- **Output Data:** [FREITEXT: Which outputs are logged? Diagnosis recommendation, risk score, therapy recommendation]
- **Decision Trace:** [FREITEXT: Which model version, which model configuration was used?]
- **User Actions:** [FREITEXT: Confirmation, rejection, override by healthcare professional]
- **System Events:** [FREITEXT: Model update, config change, performance degradation]

## 4. Log Entry Schema
```
{
  "timestamp": "[FREITEXT: ISO 8601]",
  "session_id": "[FREITEXT: UUID]",
  "user_id": "[FREITEXT: Healthcare professional ID]",
  "model_version": "[FREITEXT: Model version]",
  "input_hash": "[FREITEXT: SHA-256 hash of input]",
  "output": "[FREITEXT: Model output]",
  "confidence_score": "[FREITEXT: Probability 0-1]",
  "user_action": "[FREITEXT: accept/reject/override]"
}
```

## 5. Audit Trail Requirements
- **Immutability:** [FREITEXT: append-only, cryptographic signature]
- **Completeness:** [FREITEXT: All relevant events captured]
- **Consistency:** [FREITEXT: Timestamp synchronization, atomicity]

## 6. Access Control
- **Read:** [FREITEXT: Who can read logs? e.g. QA, Regulatory, Clinical]
- **Write:** [FREITEXT: only system, no manual entries]
- **Delete:** [FREITEXT: only after retention period, with audit entry]

## 7. Integration with Post-Market Monitoring
- **PMCF Triggers:** [FREITEXT: Which log patterns trigger PMCF activities?]
- **Vigilance Reporting:** [FREITEXT: How are logs integrated into vigilance reports?]

## 8. 21 CFR Part 11 / Annex 11 Compliance
- **Electronic Records:** [FREITEXT: yes, with audit trail]
- **Electronic Signatures:** [FREITEXT: where applicable, with biometric or password + meaning]

**QA Manager Signature:** __________________________
**Date:** [FREITEXT: Date]
```

---

## Template 3: Human-Oversight-Maßnahmen (EU AI Act Art. 14)

**Regulatorische Referenz:** Regulation (EU) 2024/1689 Art. 14 (Human Oversight)
**Pflicht-Pfad:** Alle High-Risk-AI-Systeme (Anhang III)
**Pflicht ab:** 02.08.2026
**Version:** 1.0

### Deutsch (de-DE)

```markdown
# Human-Oversight-Maßnahmen
(gemäß EU AI Act Art. 14)

**KI-System / Produkt:** [FREITEXT: Produktname, Version]
**Maßnahmen-Version:** [FREITEXT: v1.0]
**Datum:** [FREITEXT: Datum]
**Autor:** [FREITEXT: Name + Qualifikation]

## 1. Zweck und Geltungsbereich
[FREITEXT: Welche Human-Oversight-Maßnahmen sind implementiert, um Risiken für Gesundheit, Sicherheit und Grundrechte zu minimieren?]

## 2. Übersicht der Maßnahmen
| Maßnahme | Zweck | Implementierungs-Status |
|---|---|---|
| A1: Explainability / Interpretierbarkeit | Nutzer versteht Ausgabe | [FREITEXT: implementiert / geplant] |
| A2: Override-Möglichkeit | Nutzer kann Ausgabe ignorieren | [FREITEXT: ja/nein] |
| A3: Emergency-Stop | Sofortige Deaktivierung | [FREITEXT: ja/nein] |
| A4: Bias-Detection | Real-Time-Überwachung | [FREITEXT: ja/nein] |
| A5: Confidence-Threshold | Auto-Disable bei Unsicherheit | [FREITEXT: Schwellenwert] |

## 3. Detail-Beschreibungen

### A1: Explainability
[FREITEXT: Welche Methoden werden genutzt? z. B. SHAP, LIME, Attention-Maps, Saliency-Maps. Wie werden diese dem Nutzer präsentiert?]

### A2: Override-Möglichkeit
[FREITEXT: Wie kann der Healthcare-Professional die KI-Ausgabe überstimmen? UI-Pattern? Protokollierung?]

### A3: Emergency-Stop
[FREITEXT: Wie wird das System im Notfall deaktiviert? Hardware-Taste? Software-Switch? Reaktionszeit?]

### A4: Bias-Detection
[FREITEXT: Welche Real-Time-Indikatoren überwachen Bias? Frequenz? Alerting?]

### A5: Confidence-Threshold
[FREITEXT: Bei welchem Confidence-Level gibt das System die Ausgabe frei? Bei welchem verweigert es?]

## 4. Schulung der Nutzer
[FREITEXT: Welche Schulung erhalten Healthcare-Professionals zur Nutzung des KI-Systems? Frequency? Format?]

## 5. Post-Market-Überwachung
[FREITEXT: Wie werden Human-Oversight-Vorfälle erfasst? In Logs? In PMS-Report?]

## 6. Dokumentation im Technical File
[FREITEXT: Wo im Technical File sind diese Maßnahmen dokumentiert? Verweis auf Anhang IV EU AI Act]

**Unterschrift Regulatory Affairs:** __________________________
**Datum:** [FREITEXT: Datum]
```

### English (en-US)

```markdown
# Human Oversight Measures
(per EU AI Act Art. 14)

**AI System / Product:** [FREITEXT: Product Name, Version]
**Measures Version:** [FREITEXT: v1.0]
**Date:** [FREITEXT: Date]
**Author:** [FREITEXT: Name + Qualification]

## 1. Purpose and Scope
[FREITEXT: Which human oversight measures are implemented to minimize risks to health, safety, and fundamental rights?]

## 2. Measures Overview
| Measure | Purpose | Implementation Status |
|---|---|---|
| A1: Explainability / Interpretability | User understands output | [FREITEXT: implemented / planned] |
| A2: Override Capability | User can ignore output | [FREITEXT: yes/no] |
| A3: Emergency Stop | Immediate deactivation | [FREITEXT: yes/no] |
| A4: Bias Detection | Real-time monitoring | [FREITEXT: yes/no] |
| A5: Confidence Threshold | Auto-disable on uncertainty | [FREITEXT: threshold] |

## 3. Detailed Descriptions

### A1: Explainability
[FREITEXT: Which methods are used? e.g. SHAP, LIME, attention maps, saliency maps. How are these presented to the user?]

### A2: Override Capability
[FREITEXT: How can the healthcare professional override the AI output? UI pattern? Logging?]

### A3: Emergency Stop
[FREITEXT: How is the system deactivated in emergency? Hardware button? Software switch? Response time?]

### A4: Bias Detection
[FREITEXT: Which real-time indicators monitor bias? Frequency? Alerting?]

### A5: Confidence Threshold
[FREITEXT: At which confidence level does the system release the output? At which does it refuse?]

## 4. User Training
[FREITEXT: Which training do healthcare professionals receive for using the AI system? Frequency? Format?]

## 5. Post-Market Surveillance
[FREITEXT: How are human oversight incidents captured? In logs? In PMS report?]

## 6. Technical File Documentation
[FREITEXT: Where in the technical file are these measures documented? Reference to Annex IV EU AI Act]

**Regulatory Affairs Signature:** __________________________
**Date:** [FREITEXT: Date]
```

---

## Template 4: EU-AI-Database-Registrierung (EU AI Act Art. 49)

**Regulatorische Referenz:** Regulation (EU) 2024/1689 Art. 49 (Registration with EU Database)
**Pflicht-Pfad:** Alle High-Risk-AI-Systeme (Anhang III) — Registrierung in der EU-AI-Database
**Pflicht ab:** 02.08.2026
**Version:** 1.0

### Deutsch (de-DE)

```markdown
# EU-AI-Database-Registrierungs-Dossier
(gemäß EU AI Act Art. 49)

**KI-System / Produkt:** [FREITEXT: Produktname, Modellnummer, Version]
**Dossier-Version:** [FREITEXT: v1.0]
**Datum:** [FREITEXT: Datum]
**Verantwortlich:** [FREITEXT: Name + Rolle des Registrierungs-Verantwortlichen]

## 1. Anbieter-Informationen
- **Name:** [FREITEXT: Anbieter-Name (Provider gemäß Art. 3 Nr. 3)]
- **Adresse:** [FREITEXT: Vollständige Adresse]
- **EU-Bevollmächtigter (falls Anbieter außerhalb EU):** [FREITEXT: Name, Adresse]
- **Handelsregister-Nummer:** [FREITEXT: HRB-Nummer]
- **USt-ID:** [FREITEXT: USt-ID]

## 2. KI-System-Identifikation
- **Bezeichnung:** [FREITEXT: Produktname]
- **Handelsname:** [FREITEXT: Handelsname]
- **Version:** [FREITEXT: Modell-Version]
- **Modell-Architektur:** [FREITEXT: z. B. Convolutional Neural Network, Transformer, Random Forest]
- **Trainings-Methode:** [FREITEXT: z. B. Supervised Learning, Self-Supervised]

## 3. Klassifikation
- **Risikoklasse (EU AI Act):** [FREITEXT: High-Risk gemäß Anhang III Nr. 1]
- **Harmonisierungs-Rechtsvorschrift:** [FREITEXT: z. B. EU MDR 2017/745]
- **Produkt-Klasse (MDR/IVDR):** [FREITEXT: Klasse I, IIa, IIb, III, oder IVD-Klasse A, B, C, D]
- **Anhang-III-Kategorie:** [FREITEXT: Sicherheitskomponente eines Medizinprodukts]

## 4. Verwendungszweck
[FREITEXT: Genaue Beschreibung der Zweckbestimmung, Patientenpopulation, klinische Umgebung]

## 5. Konformitätsbewertung
- **Verfahren gemäß Anhang VI / VII:** [FREITEXT: Internes Kontrollverfahren oder Drittstellen-Bewertung]
- **Notified Body (falls anwendbar):** [FREITEXT: Name + 4-stellige Kennnummer]
- **Zertifikate:** [FREITEXT: Certificate-Nummer, Datum, Gültigkeit]
- **Harmonisierte Normen angewendet:** [FREITEXT: Liste der angewendeten Normen]

## 6. EU-DoC-AI-Act
[FREITEXT: Verweis auf EU-Konformitätserklärung gemäß Art. 47]

## 7. Logging und Aufzeichnungen
[FREITEXT: Verweis auf Logging-Mechanismen-Beschreibung gemäß Art. 12]

## 8. Human Oversight
[FREITEXT: Verweis auf Human-Oversight-Maßnahmen gemäß Art. 14]

## 9. Risikomanagement
[FREITEXT: Verweis auf Risk-Management-System gemäß Art. 9]

## 10. Datenschutz
[FREITEXT: Verweis auf Data-Governance-Plan gemäß Art. 10 + DSGVO-Compliance]

## 11. Post-Market-Monitoring
[FREITEXT: Verweis auf PMS-Plan + PMCF-Plan]

## 12. Verantwortliche Person
- **Name:** [FREITEXT: Verantwortliche Person gemäß Art. 25 oder Art. 26]
- **Rolle:** [FREITEXT: PRRC oder Designated Person]
- **Kontakt:** [FREITEXT: E-Mail + Telefon]

## 13. Eingetragene Marktbereitstellung
- **Geplante Markteinführung in EU:** [FREITEXT: Datum]
- **Betroffene EU-Mitgliedstaaten:** [FREITEXT: Liste oder "alle"]
- **Geplantes Vermarktungsende:** [FREITEXT: Datum, falls bekannt]

## 14. Beigefügte Dokumente
- [ ] Anbieter-Information
- [ ] KI-System-Identifikation
- [ ] Klassifikations-Begründung
- [ ] Konformitätsbewertungs-Dokument
- [ ] EU-DoC-AI-Act
- [ ] Logging-Beschreibung
- [ ] Human-Oversight-Maßnahmen
- [ ] Risk-Management-Summary
- [ ] Data-Governance-Plan
- [ ] PMS-Plan

**Registrierungs-Submission-URL:** https://digital-strategy.ec.europa.eu/en/policies/ai-act-implementation (geplant)
**Submission-Datum:** [FREITEXT: Datum]
**Submission-Confirmation-ID:** [FREITEXT: EU-Registration-Code]
```

### English (en-US)

```markdown
# EU AI Database Registration Dossier
(per EU AI Act Art. 49)

**AI System / Product:** [FREITEXT: Product Name, Model Number, Version]
**Dossier Version:** [FREITEXT: v1.0]
**Date:** [FREITEXT: Date]
**Responsible:** [FREITEXT: Name + Role of Registration Responsible]

## 1. Provider Information
- **Name:** [FREITEXT: Provider Name (per Art. 3 No. 3)]
- **Address:** [FREITEXT: Full Address]
- **EU Authorised Representative (if provider outside EU):** [FREITEXT: Name, Address]
- **Commercial Register Number:** [FREITEXT: HRB Number]
- **VAT ID:** [FREITEXT: VAT ID]

## 2. AI System Identification
- **Designation:** [FREITEXT: Product Name]
- **Trade Name:** [FREITEXT: Trade Name]
- **Version:** [FREITEXT: Model Version]
- **Model Architecture:** [FREITEXT: e.g. Convolutional Neural Network, Transformer, Random Forest]
- **Training Method:** [FREITEXT: e.g. Supervised Learning, Self-Supervised]

## 3. Classification
- **Risk Class (EU AI Act):** [FREITEXT: High-Risk per Annex III No. 1]
- **Harmonization Legislation:** [FREITEXT: e.g. EU MDR 2017/745]
- **Product Class (MDR/IVDR):** [FREITEXT: Class I, IIa, IIb, III, or IVD Class A, B, C, D]
- **Annex III Category:** [FREITEXT: Safety component of a medical device]

## 4. Intended Purpose
[FREITEXT: Precise description of intended purpose, patient population, clinical setting]

## 5. Conformity Assessment
- **Procedure per Annex VI / VII:** [FREITEXT: Internal control procedure or third-party assessment]
- **Notified Body (if applicable):** [FREITEXT: Name + 4-digit ID]
- **Certificates:** [FREITEXT: Certificate Number, Date, Validity]
- **Harmonized Standards Applied:** [FREITEXT: List of standards applied]

## 6. EU DoC AI Act
[FREITEXT: Reference to EU Declaration of Conformity per Art. 47]

## 7. Logging and Records
[FREITEXT: Reference to Logging Mechanisms Description per Art. 12]

## 8. Human Oversight
[FREITEXT: Reference to Human Oversight Measures per Art. 14]

## 9. Risk Management
[FREITEXT: Reference to Risk Management System per Art. 9]

## 10. Data Protection
[FREITEXT: Reference to Data Governance Plan per Art. 10 + GDPR Compliance]

## 11. Post-Market Monitoring
[FREITEXT: Reference to PMS Plan + PMCF Plan]

## 12. Responsible Person
- **Name:** [FREITEXT: Responsible Person per Art. 25 or Art. 26]
- **Role:** [FREITEXT: PRRC or Designated Person]
- **Contact:** [FREITEXT: Email + Phone]

## 13. Registered Market Placement
- **Planned EU Market Introduction:** [FREITEXT: Date]
- **Affected EU Member States:** [FREITEXT: List or "all"]
- **Planned End of Marketing:** [FREITEXT: Date, if known]

## 14. Attached Documents
- [ ] Provider Information
- [ ] AI System Identification
- [ ] Classification Justification
- [ ] Conformity Assessment Document
- [ ] EU DoC AI Act
- [ ] Logging Description
- [ ] Human Oversight Measures
- [ ] Risk Management Summary
- [ ] Data Governance Plan
- [ ] PMS Plan

**Registration Submission URL:** https://digital-strategy.ec.europa.eu/en/policies/ai-act-implementation (planned)
**Submission Date:** [FREITEXT: Date]
**Submission Confirmation ID:** [FREITEXT: EU Registration Code]
```

---

---

## JSON-Schemas für Formular-Generierung (Pass 6)

Zur automatisierten Formular-Generierung und Validierung sind zwei JSON-Schemas (Draft 2020-12) mit bilingualen Field-Labels (`title_de` + `title_en`) verfügbar:

| Schema | Template | Datei |
|---|---|---|
| **Data-Governance-Plan** | Template 1 (Art. 10) | `template-1-art10-data-governance.schema.json` |
| **EU-AI-Database-Registrierung** | Template 4 (Art. 49) | `template-4-art49-registration.schema.json` |

**Hinweis:** Templates 2 (Logging, Art. 12) und 3 (Human-Oversight, Art. 14) folgen in Pass 7.

---

## Cross-Reference

Diese Templates sind Teil des EU-AI-Act-Topics `sources/eu-ai-act/`.

Verwandte Dateien:
- `README.md` (Executive Summary)
- `template-1-art10-data-governance.schema.json` (JSON-Schema für Template 1)
- `template-4-art49-registration.schema.json` (JSON-Schema für Template 4)
- `sources/fda-qmsr/regulatory-sequence/MASTER.md` §13 (EU AI Act × Medizingeräte Pathway)
- `sources/fda-qmsr/templates/MASTER.md` (14 allgemeine MDR/FDA-Templates)
- `agents/regulatory-intelligence/CUSTOMER-GUIDE.md` (lineare Anleitung)
