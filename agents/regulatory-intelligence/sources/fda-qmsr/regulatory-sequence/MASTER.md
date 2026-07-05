# Regulatory-Sequence — Master-Übersicht (13 Pathways)

> **Stand:** 2026-07-04 (Pass 3 — 5 zusätzliche Pathways ergänzt: China NMPA, FDA Combination Products, FDA Breakthrough Device, EU AI Act × Medizingeräte, Health Canada MDSAP)
> **Zweck:** Schritt-für-Schritt-Anleitung pro Regulatory Pathway, mit Behörden, Dokumenten, Fristen, Gebühren
> **Validierungs-Status pro Pathway am Ende

---

## Quick-Decision-Tree: Welcher Pathway für mein Produkt?

```
1. Wo soll das Produkt vermarktet werden?
   ├── USA → FDA-Pathway
   │   ├── Klasse I / 510(k)-exempt → Selbstregistrierung
   │   ├── Klasse II (substantial equivalent) → 510(k)
   │   ├── Klasse II (kein Predicate) → De Novo
   │   └── Klasse III → PMA
   ├── EU → EU-MDR-Pathway
   │   ├── Klasse I (Niedrigrisiko) → Selbst-Erklärung
   │   ├── Klasse IIa → NB-Audit (Anhang IX/X)
   │   ├── Klasse IIb → NB-Audit (Anhang IX/X, höhere Anforderungen)
   │   └── Klasse III → NB-Audit + ggf. EU-Referenzlabor
   ├── EU IVD → EU-IVDR-Pathway
   │   ├── Klasse A (low risk) → Selbst-Erklärung
   │   ├── Klasse B (moderate) → NB-Audit
   │   ├── Klasse C (high) → NB-Audit
   │   └── Klasse D (highest) → NB-Audit + EU-Referenzlabor
   ├── Japan → PMDA-Pathway (MHLW MO 169)
   ├── China → NMPA-Pathway
   ├── Andere → siehe regions/*.md
   ├── Multiple Märkte → MDSAP-Audit (gilt in 5 Ländern: US, CA, BR, JP, AU)
   ├── Spezielle FDA-Programme → Breakthrough Device Designation (Priority-Review für lebensbedrohliche Erkrankungen)
   ├── Kombinationsprodukt (Drug+Device oder Biologic+Device) → FDA OCP (Office of Combination Products)
   ├── KI/ML Medizingerät → EU AI Act 2024/1689 × MDR/IVDR (parallel zu SaMD-Pfad)
   └── China-Markt → NMPA-Pathway (eigene Sequenz)
```

---

## 1. FDA 510(k) Premarket Notification (Klasse II, US)

**Pfad zu Details:** `fda-510k.md` (Sub-Datei — in dieser Master konsolidiert)

### Schritt-für-Schritt
1. **Q-Sub (Pre-Submission Meeting)** — optional, mit FDA CDRH
2. **eSTAR-Submission** — elektronische Einreichung über FDA-Portal
3. **Acceptance Review** — FDA prüft Vollständigkeit (15 Tage)
4. **Substantive Review** — wissenschaftliche Datenprüfung (90 Tage MDUFA-Ziel)
5. **Interactive Review** — Rückfragen (Additional Information)
6. **Decision** — „Substantially Equivalent"-Letter (Market Clearance)

### Pflicht-Dokumente
- 510(k) Cover Letter (Template: `templates/510k-cover-letter.md`)
- Indication for Use Statement (Form FDA 3881; Template: `templates/510k-ifu-statement.md`)
- 510(k) Substantial Equivalence Comparison (Template: `templates/510k-substantial-equivalence.md`)
- Performance Test Reports (Bench-Tests)
- Software Documentation (IEC 62304 + Level of Concern)
- Labeling (IFU, Gebrauchsanweisung)
- Risk Management Plan (ISO 14971)
- Biokompatibilität (ISO 10993, falls Kontakt mit Körper)

### Fristen
- **Acceptance Review:** 15 Kalendertage
- **Substantive Review:** 90 Kalendertage (MDUFA-Ziel)
- **Total inkl. Korrekturschleifen:** 180-270 Tage typisch

### Behörde
- **FDA — Center for Devices and Radiological Health (CDRH)**
- 510(k) Document Control Center

### Gebühren (MDUFA V, FY 2024)
- Standard: **USD 21.760**
- Small Business Status: **USD 5.440**

### Validation: ✅
- Quelle: https://www.fda.gov/medical-devices/premarket-notification-510k
- 21 CFR 807 Subpart E (Authority: 21 USC 360(k))

---

## 2. FDA De Novo Classification (Novel Device, US)

**Pfad zu Details:** `fda-de-novo.md` (in dieser Master konsolidiert)

### Schritt-für-Schritt
1. **De Novo Submission** — Einreichung (meist nach vorheriger Not-Substantially-Equivalent-Entscheidung)
2. **Acceptance Review** — Vollständigkeitsprüfung (15 Tage)
3. **Substantive Review** — Risikobasierte Bewertung, Klassifizierung in Klasse I oder II
4. **Classification/Grant** — Definition von „Special Controls" + Einordnung
5. **Predicate-Erstellung** — Ihr Produkt wird automatisch zum Predicate für nachfolgende 510(k)

### Pflicht-Dokumente
- „Differentiation Statement" (Warum kein Predicate?)
- Safety & Effectiveness Daten
- Bench-Test-Reports
- Benefits-Risk-Analyse
- Performance-Daten + Validierung

### Fristen
- **Acceptance Review:** 15 Tage
- **Substantive Review:** 150 Tage (MDUFA-Ziel)
- **Total:** 150-300 Tage

### Behörde
- FDA CDRH

### Validation: ✅
- 21 CFR 860.220 (De Novo Classification Process)
- Quelle: https://www.fda.gov/medical-devices/premarket-submissions-selecting-and-preparing-correct-submission/de-novo-classification-request

---

## 3. FDA PMA Premarket Approval (Klasse III, US)

**Pfad zu Details:** `fda-pma.md` (in dieser Master konsolidiert)

### Schritt-für-Schritt
1. **Pre-PMA Meeting** — Q-Sub mit FDA
2. **PMA-Filing** — Einreichung (Vollständigkeitsprüfung 45 Tage)
3. **Substantive Review** — Vertiefte wissenschaftliche Prüfung
4. **Panel Review** — Optional bei First-of-a-kind; FDA Advisory Committee
5. **Approval** — PMA-Approval Order

### Pflicht-Dokumente
- Klinische IDE-Studien (Investigational Device Exemption)
- QS-Inspektionsbericht (GMP 820 / QMSR)
- Vollständige Validierungs-Reports
- SSED (Summary of Safety and Effectiveness Data)
- Risk Management (ISO 14971)
- Risk-Benefit-Analysis

### Fristen
- **Filing Review:** 45 Tage
- **Substantive Review:** 180-360 Tage (statutorisch)
- **Faktisch total:** 1-2 Jahre typisch

### Behörde
- FDA CDRH
- Mögliche Panel-Review

### Validation: ✅
- 21 CFR 814 (PMA Application)
- Quelle: https://www.fda.gov/medical-devices/premarket-approval-pma/pma-review-process

---

## 4. EU MDR 2017/745 Class I (Niedrigrisiko, EU)

**Pfad zu Details:** `eu-mdr-class-i.md` (in dieser Master konsolidiert)

### Schritt-für-Schritt
1. **Klassifizierung** — Anhang VIII der MDR
2. **Technische Dokumentation** — Erstellung gemäß Anhang II + III
3. **PRRC-Benennung** — Person Responsible for Regulatory Compliance
4. **EU-Konformitätserklärung** — Anhang IV (Template: `templates/eu-declaration-of-conformity.md`)
5. **UDI-Vergabe** — UDI-DI + UDI-PI
6. **EUDAMED-Registrierung** — UDI-Datenbank, Actor-Registration

### Pflicht-Dokumente
- Technische Dokumentation (Anhang II/III)
- EU-Konformitätserklärung
- UDI-Vergabe (Template: `templates/udi-vergabe.md`)
- Labeling in 24 EU-Sprachen
- Risk Management Plan (ISO 14971)

### Fristen
- **Erstellungszeit:** 3-6 Monate (Hersteller-Verantwortung)
- **Keine NB-Beteiligung**

### Behörde
- Nationale Competent Authority (z. B. BfArM in DE, ANSM in FR)
- Kein Notified Body erforderlich

### Validation: 🟡
- MDR 2017/745 Artikel 52
- Quelle: https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX%3A32017R0745

---

## 5. EU MDR Class IIa/IIb (Notified Body, EU)

**Pfad zu Details:** `eu-mdr-class-iia-iib.md` (in dieser Master konsolidiert)

### Schritt-für-Schritt
1. **Klassifizierung** — Anhang VIII
2. **Konformitätsbewertungsroute** — Anhang IX (Quality Management + Technical Documentation Assessment) ODER Anhang X (Production Quality Assurance) + Anhang XI (Product Verification)
3. **NB-Audit** — QMS-Audit (Anhang IX Kapitel I) + Bewertung Technische Dokumentation
4. **Zertifizierung** — CE-Zertifikat nach Audit-Erfolg
5. **Surveillance** — jährliche Überwachungsaudits
6. **Re-Zertifizierung** — alle 5 Jahre

### Pflicht-Dokumente
- Vollständiges Technical File (Anhang II/III)
- Clinical Evaluation Report (CER; Template folgt in Templates/)
- PMS-Plan
- PSUR (Periodic Safety Update Report)
- SSCP (Class III + Implantate; Template: `templates/sscp.md`)
- UDI
- Risk Management File (ISO 14971)

### Fristen
- **NB-Audit-Vorbereitung:** 6-12 Monate
- **Audit-Dauer:** 3-12 Monate (NB-Kapazität abhängig)
- **Total typisch:** 12-18 Monate

### Behörde
- Notified Body (NB; z. B. TÜV-Süd, TÜV-Rheinland, BSI, DEKRA)
- Nationale Competent Authority

### Validation: 🟡
- MDR 2017/745 Artikel 52
- Quelle: https://ec.europa.eu/health/medical-devices-sector/new-regulations_en

---

## 6. EU MDR Class III (Höchstrisiko, EU)

**Pfad zu Details:** `eu-mdr-class-iii.md` (in dieser Master konsolidiert)

### Schritt-für-Schritt
1. **Technisches Audit** — wie Class IIb + vertiefte klinische Prüfung
2. **Klinische Bewertung** — oft klinische Studien erforderlich (PMCF)
3. **Konsultation** — ggf. EU-Referenzlabor (Art. 48) oder CECP (Clinical Evaluation Consultation Procedure)
4. **Zertifizierung** — CE-Zertifikat
5. **SSCP-Publikation** — öffentlich in EUDAMED

### Pflicht-Dokumente
- Zusätzlich zu Class IIb:
- SSCP (Summary of Safety and Clinical Performance; Template: `templates/sscp.md`)
- Implant-Card (für implantierbare Produkte)
- Konsultations-Nachweis (EU-Referenzlabor oder Expert-Panel)

### Fristen
- **Total typisch:** 18-24+ Monate

### Validation: 🟡
- MDR Anhang IX Kapitel III
- Quelle: https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX%3A32017R0745

---

## 7. EU IVDR 2017/746 (In-vitro Diagnostika, EU)

**Pfad zu Details:** `eu-ivdr.md` (in dieser Master konsolidiert)

### Schritt-für-Schritt
1. **Klassifizierung** — Anhang VIII der IVDR (Regel 1-7)
2. **Konformitätsbewertungsroute** — je nach Klasse (A = Selbst, B-D = NB)
3. **NB-Audit** (für B-D)
4. **EU-Referenzlabor** (für Klasse D, falls anwendbar)
5. **Zertifizierung** — CE-Zertifikat

### Pflicht-Dokumente
- Technical Documentation
- Performance Evaluation Report (PER; IVDR-Analog zu CER)
- PMS-Plan
- PSUR

### Fristen
- **Class A:** 3-6 Monate
- **Class B-D:** 12-18 Monate

### Validation: 🟡
- IVDR 2017/746
- Quelle: https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX%3A32017R0746

---

## 8. Japan PMDA Pathway

**Pfad zu Details:** `japan-pmda.md` (in dieser Master konsolidiert)

### Schritt-für-Schritt
1. **MAH-Bestimmung** — Marketing Authorization Holder (In-Country-Vertretung erforderlich)
2. **QMS-Zertifizierung** — Konformität mit MHLW MO 169 (ISO 13485-basiert)
3. **Submission** — je nach Klassifizierung:
   - **Todokede (Notification)** für Klasse I + II (niedrigrisiko)
   - **Ninsho (Certification)** durch Registered Certification Body für Klasse II (Mittel)
   - **Approval** durch PMDA für Klasse III + IV
4. **Review** — PMDA-Bewertung
5. **Zulassung** — Marktzulassung

### Pflicht-Dokumente
- MHLW MO 169 Dossier
- Technical File (Japan-Variante)
- QMS-Zertifikat (von J-QMS akkreditierter Stelle)
- IFU in Japanisch

### Fristen
- **Class I + II (Todokede):** 1-3 Monate
- **Class II (Ninsho):** 6-12 Monate
- **Class III + IV (PMDA-Approval):** 12-18+ Monate

### Behörde
- PMDA (Pharmaceuticals and Medical Devices Agency)
- MHLW (Ministry of Health, Labour and Welfare)
- Registered Certification Bodies (RCB)

### Validation: ✅
- MHLW MO 169
- Quelle: https://www.pmda.go.jp/english/review-services/regulatory-info/0004.html

---

## 9. SaMD (Software as a Medical Device) — speziell

**Pfad zu Details:** `samd.md` (in dieser Master konsolidiert)

### Klassifizierungs-Frameworks
- **FDA SaMD Risk Categorization (IMDRF/SaMD WG/N10):**
  - State I (kein Krankheitszustand) — kein 510(k) nötig, nur „Enforcement Discretion"
  - State II (nicht-kritisch) — 510(k) mit reduzierten Anforderungen
  - State III (kritisch) — 510(k) oder De Novo
  - State IV (lebenserhaltend) — 510(k) oder PMA
- **EU MDR Rule 11 + Rule 22:**
  - Software kann Klasse I bis III erreichen
  - Klasse III für lebenswichtige Diagnose/Therapie-Entscheidungen

### Schritt-für-Schritt
1. **Klassifizierung** — FDA SaMD Risk Categorization + EU MDR Rule 11/22
2. **QMS-Aufbau** — IEC 62304-konform + ISO 14971
3. **Cybersecurity** — FDA 2023 + IMDRF N60
4. **PCCP-Erstellung** (FDA) — Template: `templates/samd-pccp.md`
5. **Clinical Evaluation** — Software-Validierung
6. **Submission** — 510(k) oder De Novo oder PMA (je nach Risiko)

### Pflicht-Dokumente
- Software-Requirements-Specification (SRS; IEC 62304 §5.1)
- Software-Architecture-Document (SAD; IEC 62304 §5.4)
- Software V&V Plan + Report (IEC 62304 §5.6-5.7)
- SBOM (Software Bill of Materials; FDA Cybersecurity 2023)
- PCCP (Predetermined Change Control Plan; FDA PCCP 2024)
- Cybersecurity Risk Assessment

### Validation: 🟡
- IMDRF/SaMD WG/N10
- FDA PCCP Guidance 2024
- IEC 62304 + FDA Cyber Guidance

---

## 10. China NMPA Pathway (PRC)

**Pfad zu Details:** `china-nmpa.md` (in dieser Master konsolidiert)

### Regulatorischer Hintergrund
- **Behörde:** NMPA (National Medical Products Administration, 国家药品监督管理局) — vormals CFDA
- **Rechtsgrundlage:** Order No. 47 (Regulations on the Supervision and Administration of Medical Devices, 2014 + Amendments 2017/2021)
- **Standards:** GB-Standard-Reihe (China-Guo-Biao-National-Standards), z. B. GB 9706.1 (Elektromedizinische Sicherheit, eq. IEC 60601-1); YY/T-Standards für In-vitro-Diagnostika
- **NMPA-Akzeptanz ISO 13485:** NMPA akzeptiert ISO 13485:2016-Zertifikate von akkreditierten Stellen als QMS-Nachweis

### Schritt-für-Schritt
1. **In-Country-Vertretung benennen** — NMPA akzeptiert keine ausländischen Hersteller ohne lokalen Agenten (NMPA-Designated-Agent in PRC)
2. **Produktklassifizierung beantragen** — NMPA-Klassifizierung (Class I, II, III); Antrag bei CMDE (Center for Medical Device Evaluation)
3. **Type-Test (Type-Testing)** — Produkt muss GB-Standard-konform in NMPA-anerkanntem Labor getestet werden
4. **QMS-Audit (NMPA)** — NMPA-Inspektion oder Anerkennung von ISO 13485:2016-Zertifikat einer akkreditierten Stelle (z. B. TÜV-Süd, BSI)
5. **Klinische Studien** — in China, falls Class III oder Class II mit hohem Risiko
6. **Administrative-Approval (Class II + III)** — CMDE-Begutachtung; Class I nur Notification
7. **NMPA-Registration-Certificate** — 5 Jahre Gültigkeit; Verlängerung erforderlich

### Pflicht-Dokumente
- Produkt-Registrierungs-Antrag (NMPA-Form-1)
- Technisches Dossier (entspricht GB-Standards)
- Risikobewertung (YY/T 0316, eq. ISO 14971)
- Klinische Bewertung (Class II/III) — ggf. in-China-Studien
- IFU in Mandarin (vereinfachtes Chinesisch)
- UDI-Vergabe (NMPA UDI-Database)
- Lokale Etikettierungs-Anforderungen
- Qualitätsmanagementsystem-Nachweis (ISO 13485:2016 oder NMDA-Audit)

### Fristen
- **Class I (Notification):** 3-6 Monate
- **Class II (Registration):** 12-18 Monate
- **Class III (Registration):** 18-24+ Monate

### Behörden
- **NMPA** (Zentrale-Behörde, Beijing)
- **CMDE** (Center for Medical Device Evaluation — wissenschaftliche Begutachtung)
- **Provincial NMPA-Bureaus** (lokale Inspektionen)
- **NMPA-anerkannte Test-Labore** (Type-Testing)

### Validation: 🟡
- Quelle: https://www.nmpa.gov.cn/yaopin/
- Order No. 47 (国务院令第680号)

---

## 11. FDA Combination Products (Drug+Device oder Biologic+Device)

**Pfad zu Details:** `fda-combination-products.md` (in dieser Master konsolidiert)

### Regulatorischer Hintergrund
- **Behörde:** FDA Office of Combination Products (OCP)
- **Rechtsgrundlage:** 21 CFR Part 4 (Combination Products); 21 USC 503(g)
- **Classification:** RFI (Request for Information) oder RFD (Request for Designation) bestimmt Lead-Center (CDER / CBER / CDRH)

### Arten von Combination Products
1. **Single-Entity:** pharmazeutisches + Medizingerät physisch/in-chemisch integriert (z. B. Heparin-beschichteter Katheter)
2. **Co-Packaged:** separat verpackt, zusammen ausgeliefert (z. B. Drug-Kit mit Applikator-Device)
3. **Cross-Labeled:** separat vermarktet, aber nur in Kombination wirksam (z. B. Drug-1 + Device-1)

### Schritt-für-Schritt
1. **RFD (Request for Designation)** — Antrag bei OCP zur Bestimmung des Lead-Centers (CDER/CBER/CDRH)
2. **Pre-IND oder Pre-IDE Meeting** — mit dem Lead-Center
3. **IND/IDE/BLA/510(k) Submission** — entsprechend Lead-Center-Anforderung
4. **CGMMP (Current Good Manufacturing Practice)** — Konformität mit 21 CFR Part 4 + jeweiligem Lead-Center-Standard (z. B. 21 CFR 210/211 + 820/QMSR)
5. **Post-Market Reporting** — Adverse-Event-Reporting gemäß Lead-Center-Anforderung

### Pflicht-Dokumente
- RFD (Request for Designation) — Begründung der Lead-Center-Wahl
- Combination-Product-Agreement zwischen Lead-Center und Sekundär-Center
- GMP-Compliance: 21 CFR Part 4 (für alle Combination Products) + Lead-Center-spezifisch
- Drug Master File (DMF) — falls Drug-Komponente relevant
- Device Master Record (DMR) — falls Device-Komponente relevant
- Labeling (21 CFR 201 + 21 CFR 801)

### Fristen
- **RFD-Entscheidung:** 60 Tage (FDA)
- **IND/IDE Review:** standard pathway

### Behörden
- **OCP (Office of Combination Products)** — Koordination
- **CDER** (Drug) / **CBER** (Biologics) / **CDRH** (Devices) — Lead-Center abhängig

### Validation: ✅
- 21 CFR Part 4
- Quelle: https://www.fda.gov/combination-products

---

## 12. FDA Breakthrough Device Designation (Priority Review)

**Pfad zu Details:** `fda-breakthrough-device.md` (in dieser Master konsolidiert)

### Regulatorischer Hintergrund
- **Behörde:** FDA CDRH
- **Rechtsgrundlage:** 21st Century Cures Act (2016), Section 3051; FDA Guidance „Breakthrough Devices Program\" 2018
- **Ziel:** Beschleunigte Marktzulassung für Medizingeräte zur Diagnose oder Behandlung lebensbedrohlicher oder irreversibel schwächender Erkrankungen

### Voraussetzungen
1. Das Medizingerät muss eine **lebensbedrohliche oder irreversibel schwächende Erkrankung** adressieren
2. Es muss mindestens ein Kriterium erfüllen:
   - **Repräsentiert bahnbrechende Technologie** (Breakthrough Technology)
   - **Kein zugelassenes Alternativprodukt** (No Approved Alternatives)
   - **Bietet signifikanten Vorteil gegenüber bestehenden Alternativen** (Significant Advantages)
3. **Verfügbarkeit im Patient-Interest** — Device ist im besten Interesse der Patienten

### Schritt-für-Schritt
1. **Q-Sub (Pre-Submission Meeting)** — frühe FDA-Interaktion zur Erörterung der Breakthrough-Eignung
2. **Breakthrough Designation Request** — formloser Antrag mit Begründung
3. **FDA-Review** — 60 Tage zur Designation-Entscheidung
4. **Bei Designation-Erteilung:** Priority-Review (verkürzte Fristen), erhöhte FDA-Interaktion, erweiterte Q-Sub-Möglichkeiten, ggf. „EUA"-Eligibility (Emergency Use Authorization)
5. **Submission** — 510(k), De Novo oder PMA (je nach Risiko)
6. **Priority-Review** — verkürzte MDUFA-Fristen

### Pflicht-Dokumente
- Breakthrough-Designation-Antrag (formlos; FDA akzeptiert Pre-Sub-Format)
- Device-Beschreibung + Indication-for-Use
- Begründung: Breakthrough + lebensbedrohliche Erkrankung
- Preliminary-Clinical-Daten (falls verfügbar)
- Risk-Benefit-Preliminary-Analysis

### Fristen
- **Designation-Review:** 60 Kalendertage (FDA)
- **Priority-Review-Fristen:** abhängig vom regulären Pathway (510(k) / De Novo / PMA), aber verkürzt um 50% gegenüber Standard

### Behörde
- **FDA CDRH (Center for Devices and Radiological Health)** — federführend
- **OCP** — bei Combination Products

### Validation: ✅
- Section 3051 des 21st Century Cures Act
- Quelle: https://www.fda.gov/medical-devices/how-study-and-market-your-device/breakthrough-devices-program

---

## 13. EU AI Act 2024/1689 × Medizingeräte (KI/ML-Pathway)

**Pfad zu Details:** `eu-ai-act-medical-devices.md` (in dieser Master konsolidiert)

### Regulatorischer Hintergrund
- **Behörde:** EU-Kommission (AI Office, gegründet 2024) + EU-MDR/IVDR-Notified-Bodies + nationale AI-Aufsichtsbehörden (in DE: BNetzA)
- **Rechtsgrundlage:** Regulation (EU) 2024/1689 (AI Act) — in Kraft seit 01.08.2024, gestaffelte Anwendung 2025-2027
- **Schnittstellen:** EU MDR 2017/745 (für Medizingeräte) + EU IVDR 2017/746 (für IVD) + AI Act
- **Anwendbar auf:** KI/ML-Medizingeräte (SaMD, eingebettete KI in Hardware-Medizingeräte) abhängig von Risikoklasse

### Risiko-Klassifikations-Framework (AI Act)
- **Unacceptable Risk (verboten):** §5 AI Act — Social Scoring, Subliminal Manipulation etc. (für Medizingeräte praktisch irrelevant)
- **High Risk (Anhang III + Anhang I):** Medizingeräte, die unter MDR/IVDR der Klasse IIa/IIb/III fallen UND KI-Komponente haben = automatisch High-Risk
- **Limited Risk:** Transparenz-Pflichten (z. B. Chatbot-Disclosure)
- **Minimal Risk:** keine spezifischen Pflichten (z. B. Spam-Filter)

### Schritt-für-Schritt
1. **AI-Risk-Klassifikation** — Bestimmung, ob Medizingerät unter High-Risk fällt (in der Regel ja, wenn Klasse IIa+)
2. **MDR/IVDR-Standard-Pathway** — parallele MDR/IVDR-Compliance wie für andere Medizingeräte
3. **AI-Act-spezifische Anforderungen:**
   - **Risk-Management-System** (Art. 9) — durchgängig über Lebenszyklus
   - **Data-Governance** (Art. 10) — Trainings-, Validierungs-, Test-Daten-Qualität
   - **Technical-Documentation** (Art. 11 + Anhang IV)
   - **Record-Keeping** (Art. 12) — automatische Logging-Pflicht
   - **Transparency-Disclosure** (Art. 13) — KI-Nutzung gegenüber Anwendern
   - **Human-Oversight** (Art. 14) — technische Maßnahmen für Human-in-the-Loop
   - **Accuracy-Robustness-Cybersecurity** (Art. 15)
   - **Quality-Management-System** (Art. 17) — durchgängig
4. **Konformitätsbewertung** — bei High-Risk: NB-Audit für AI-Compliance + MDR-Standard-Pfad
5. **EU-AI-Database-Registrierung** (Art. 49) — öffentliche EU-Datenbank für High-Risk-AI-Systeme
6. **Post-Market-Monitoring** (Art. 72) — kontinuierlich über Lebenszyklus

### Pflicht-Dokumente
- **AI-Risk-Classification-Justification-Document**
- **Data-Governance-Plan** (Trainings-Daten-Qualität, Bias-Analyse, Repräsentativität)
- **AI-Technical-Documentation** (Anhang IV AI Act)
- **AI-Quality-Management-System-Dokumentation**
- **Human-Oversight-Maßnahmen-Beschreibung**
- **Logging-Mechanismen** (automatische Aufzeichnung)
- **Conformity-Assessment-Report** (NB)
- **EU-DoC AI Act + MDR/IVDR-kombiniert**
- **EU-AI-Database-Registration**
- **Post-Market-Monitoring-Plan AI-Act-spezifisch**

### Fristen
- **AI Act gestaffelte Anwendung:**
  - 02.02.2025: Verbote (§5)
  - 02.08.2025: GPAI-Pflichten (General Purpose AI)
  - 02.08.2026: Hochrisiko-Anforderungen (für Medizingeräte hochrelevant)
  - 02.08.2027: vollständige Anwendung

### Behörden
- **AI-Office** (Europäische Kommission, Brüssel) — übergreifend
- **Nationale Aufsichtsbehörden** (in DE: BNetzA; in FR: CNIL; in IT: AgID)
- **Notified Bodies** — Konformitätsbewertung für High-Risk-MDR/IVDR-Produkte
- **EDPB/EDPS** — falls personenbezogene Daten verarbeitet werden

### Validation: 🟡
- Regulation (EU) 2024/1689
- Quelle: https://artificialintelligenceact.eu/the-act/

### Cross-Reference zu SaMD
- SaMD-WG/N10 (IMDRF) + EU MDR Rule 11/22 + AI Act = 3 parallele Frameworks für KI/ML-Medizingeräte
- FDA PCCP 2024 hat ähnliche Funktion wie AI-Act-Art. 15/17

---

## 14. Health Canada MDSAP (Medical Device Single Audit Program)

**Pfad zu Details:** `health-canada-mdsap.md` (in dieser Master konsolidiert)

### Regulatorischer Hintergrund
- **Behörde:** Health Canada (Health Products and Food Branch) + MDSAP-Auditing-Organizations (AOs)
- **Rechtsgrundlage:** Medical Device Licence (MDL) gemäß SOR/98-282 (Medical Devices Regulations)
- **MDSAP-Audit-Ersetzt:** Health-Canada-eigenes CMDCAS-Programm seit 2019
- **5 MDSAP-Teilnehmer-Länder:** USA, Canada, Brasilien (ANVISA), Japan (PMDA/FDA-Pilot), Australien (TGA)

### Schritt-für-Schritt
1. **MDL-Application** (Medical Device Licence) — je nach Klasse (Class I, II, III, IV)
2. **MDSAP-AO-Auswahl** — z. B. TÜV-Süd, BSI, DEKRA, DQS, Intertek (alle MDSAP-anerkannt)
3. **MDSAP-Audit-Vorbereitung** — Audit-Checkliste siehe `templates/mdsap-checkliste.md`
4. **Initial-Audit** — Stage 1 (Dokumenten-Review) + Stage 2 (Vor-Ort-Audit) — typisch 6-12 Monate
5. **Audit-Corrective-Actions** — NCRs (Non-Conformities) innerhalb 30 Tagen schließen
6. **Audit-Report** — MDSAP-AO leitet Report an alle 5 teilnehmenden Regulatory Authorities
7. **Surveillance-Audits** — jährlich (für alle 5 Länder)
8. **Re-Certification** — alle 3 Jahre (zyklischer MDL-Renew)

### Pflicht-Dokumente
- MDSAP-Audit-Checkliste (siehe Templates)
- Health-Canada-MDL-Application
- Quality Manual (ISO 13485:2016 + MDSAP-Requirements)
- CMDCAS-Equivalent-Documents
- Medical-Device-Licence-Application-Form
- Quality-Plan + QMS-Dokumentation

### Fristen
- **MDSAP-Audit-Cycle:** alle 3 Jahre
- **Annual-Surveillance:** jährlich
- **NCR-Close-Out:** 30 Tage

### Behörden
- **Health Canada** (Lead)
- **MDSAP-AOs** (TÜV-Süd, BSI, DEKRA, DQS, Intertek) — Audit-Durchführung
- **FDA / ANVISA / PMDA / TGA** — nutzen MDSAP-Audit-Report als 1 von 5 Jurisdiktionen

### Validation: ✅
- Quelle: https://www.canada.ca/en/health-canada/services/drugs-health-products/medical-devices.html
- MDSAP P0002: https://www.fda.gov/medical-devices/medical-device-single-audit-program-mdsap

---

## Cross-Reference

Diese Master-Datei ist Teil des Verzeichnisses `regulatory-sequence/`. Pro Pathway existiert eine Sub-Datei mit Detail-Schritten und pro Pathway-spezifischen Checklisten.

Verwandte Materialien:
- `required-documents.md` (komplette Akten-Liste, 25+ Dokumente)
- `templates/` (12+ ausfüllbare Muster)
- `CUSTOMER-GUIDE.md` (lineare Anleitung)
