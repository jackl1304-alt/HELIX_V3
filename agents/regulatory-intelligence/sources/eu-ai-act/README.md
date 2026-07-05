# EU AI Act 2024/1689 — High-Risk-AI Compliance für Medizingeräte

> **Themen-ID:** eu-ai-act
> **Erstellt am:** 2026-07-04 (Pass 4)
> **Quelle-Erst-Recherche:** 2026-07-04
> **Validierungs-Lead-Agent:** Regulatory-Intelligence-Agent
> **Strategischer Kontext:** High-Risk-AI-System gemäß EU AI Act Anhang III (Medizingeräte der Klasse IIa/IIb/III mit KI/ML-Komponente)

---

## Executive Summary

Die **Verordnung (EU) 2024/1689 (AI Act)** ist am 01.08.2024 in Kraft getreten und wird gestaffelt bis 02.08.2027 angewendet. Für Medizingeräte-Hersteller, deren Produkte unter die EU MDR 2017/745 / IVDR 2017/746 fallen UND eine KI/ML-Komponente enthalten, gilt:

- **Risikoklasse:** **High-Risk-AI-System** (Art. 6 + Anhang III Nr. 1 — Sicherheitskomponente von Produkten, die unter Harmonisierungs-Rechtsvorschriften fallen)
- **Anwendungsbeginn Hochrisiko-Pflichten:** **02.08.2026** (Art. 113)
- **Doppel-Compliance-Schicht:** EU MDR/IVDR (Standard) + EU AI Act (zusätzliche KI-spezifische Pflichten)

**Pflicht-Dokumente (4 EU-AI-Act-Bausteine — werden in `INDEX.md` als ausfüllbare Templates bereitgestellt):**

| Baustein | AI-Act-Artikel | Pflicht ab | Template in INDEX.md |
|---|---|---|---|
| **Data-Governance-Plan** | Art. 10 | 02.08.2026 | §1 |
| **Logging-Mechanismen-Beschreibung** | Art. 12 | 02.08.2026 | §2 |
| **Human-Oversight-Maßnahmen** | Art. 14 | 02.08.2026 | §3 |
| **EU-AI-Database-Registrierung** | Art. 49 | 02.08.2026 | §4 |

Plus ergänzend:
- **Risk-Management-System** (Art. 9) — wird im Rahmen von ISO 14971 / MDR-Risk-Management abgedeckt
- **Technical Documentation** (Art. 11 + Anhang IV) — Verweis auf MDR Anhang II/III + AI-Act-Anhang-IV-Add-ons
- **Accuracy-Robustness-Cybersecurity** (Art. 15) — Verweis auf IEC 62304 + FDA Cyber + AAMI TIR57
- **Quality-Management-System** (Art. 17) — Verweis auf ISO 13485 + MDR

---

## Cross-Reference zu fda-qmsr (bestehendes Modul)

Das EU-AI-Act-Topic ergänzt das bestehende FDA-QMSR-Modul um die EU-AI-Act-spezifischen Pflichten. Doppelte Inhalte werden vermieden:

- ISO 14971 → Risk-Management (deckt AI Act Art. 9 ab) → siehe `sources/fda-qmsr/standards.md` S-003
- IEC 62304 + FDA Cyber → Software-Lebenszyklus + Cybersecurity (deckt AI Act Art. 15 ab) → siehe `sources/fda-qmsr/standards.md` S-004 + `regions/international-standards.md`
- ISO 13485 → QMS (deckt AI Act Art. 17 ab) → siehe `sources/fda-qmsr/standards.md` S-001
- Pathway §13 EU AI Act × Medizingeräte → siehe `sources/fda-qmsr/regulatory-sequence/MASTER.md` §13

---

## Multi-Agent-Validation

Pass 4 hat **3 Validierungs-Agenten + 1 Boss-Aggregator = 4 Agenten** für die 4 EU-AI-Act-Bausteine:
- 1× researcher-web (EU AI Act Volltext + Anhang III + Art. 10/12/14/49)
- 1× thinker-with-files-gemini (technische Validierung der 4 Templates)
- 1× code-reviewer-minimax-m3 (Schluss-Sign-off)

---

## Stand und nächste Schritte

**Pass 4 abgeschlossen 2026-07-04**:
- 4 EU-AI-Act-Bausteine als bilinguale Templates in `INDEX.md`
- README.md + INDEX.md erstellt
- CHANGELOG.md + CUSTOMER-GUIDE.md aktualisiert

**Pass 5 (KW 30 2026)** — geplant:
- Data-Governance-Plan-Vorlage mit Bias-Analyse-Framework (NIST AI RMF, ISO/IEC 42001)
- Human-Oversight-Maßnahmen: konkrete UX-Patterns für Human-in-the-Loop
- Logging: technische Architektur-Spec (append-only, audit-fähig, 6-Monats-Aufbewahrung)

**Pass 6 (KW 31 2026)** — teilweise umgesetzt 2026-07-05:
- ✅ JSON-Schema für Data-Governance-Plan (Art. 10) mit bilingualen Field-Labels → `template-1-art10-data-governance.schema.json`
- ✅ JSON-Schema für EU-AI-Database-Registrierung (Art. 49) als Form-Schema → `template-4-art49-registration.schema.json`
- ⏳ EU-AI-Database-Registrierungs-Workflow (Online-Submission über ec.europa.eu) — ausstehend
- ⏳ Schulungsmaterial für PRRC zur AI-Act-Compliance — ausstehend

**Pass 7 (KW 32 2026)** — geplant:
- JSON-Schemas für Templates 2 (Logging Art. 12) und 3 (Human-Oversight Art. 14)
- Formular-Generator aus JSON-Schemas + LLM-gestützte Validierung
