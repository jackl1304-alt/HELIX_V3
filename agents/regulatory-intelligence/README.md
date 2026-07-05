# Regulatory Intelligence — Agent Module

> **Lead-Agent-System-Prompt:** [`SYSTEM.md`](./SYSTEM.md) (verpflichtend laden vor jeder Recherche)
> **Owner:** helm in HELIX regulatory SaaS

## Struktur

```
agents/regulatory-intelligence/
├── SYSTEM.md                    # Lead-Agent-Persona (diese Persona, dauerhaft)
├── README.md                    # diese Datei
├── VALIDATION-METHODOLOGY.md    # Multi-Agent-Validation-Strategie
└── sources/
    ├── INDEX.md                 # Quellen-Gesamtverzeichnis, kategorisiert
    └── <thema>/                 # je Themenbereich ein Unterordner
        ├── README.md            # Themenintro, Forschungsfragen, Validierungsstand
        ├── primary.md           # Primärquellen (Behörde, Federal Register, etc.)
        ├── standards.md         # ISO / IEC / EN / DIN / harmonisierte Standards
        ├── industry.md          # Branchenverbände / Beratungen / Rechtsanalysen
        ├── clinical.md          # PubMed / ClinicalTrials / Cochrane
        └── gaps.md              # explizit benannte Lücken + Paywall-Hinweise
```

## Multi-Agent-Validationsarchitektur

Per Persona-Anforderung (`SYSTEM.md` §Qualitätssicherung): mindestens Lead-Agent + 2 Validierungs-Agenten + Boss-Agent.

In dieser HELIX-Implementierung:

| Rolle | Subagent | Aufgabe |
|---|---|---|
| Lead-Agent | (dieser Conversation-Flow) | Primärrecherche, Strukturierung, Erstausgabe |
| Validator A | `researcher-web` (FDA-Spez) | Cross-Check primärer FDA-Quellen via `read_url` |
| Validator B | `researcher-web` (ISO/AAMI) | Cross-Check Standard-Quellen |
| Validator C | `basher` (Audit-Skript) | Strukturprüfung: jede Quelle hat URL + Dokumentnummer + Datum |
| Boss-Agent | (Conversation-Loop) | Konsolidierung, Gap-Audit, finale Freigabe |

## Quellen-Status-Flags

Jede Quelle trägt explizit einen von drei Status:

- **✅ validiert** — primäre Quelle direkt überprüft (Federal Register FDA, ISO-Originalseite, EUR-Lex-Originaldokument)
- **🟡 sekundär bestätigt** — mehrere unabhängige seriöse Quellen (z. B. RAPS + AdvaMed + Deloitte)
- **⚪ nicht validierbar** — Paywall, nicht öffentlich, oder außerhalb Reichweite; Lücke wird benannt

## Quellen-Archivierungs- und Update-Regeln

- Neue Quellen werden unter `sources/<thema>/<kategorie>.md` mit `UPDATE YYYY-MM-DD` ergänzt
- Quellen, die sich seit letzter Recherche geändert haben (z. B. Standard-Revision, Effective-Date-Verschiebung), behalten ihre alte Zeile + bekommen einen `UPDATE YYYY-MM-DD`-Block mit Änderungsbeschreibung
- Quellen mit Validierungs-Status `⚪` werden in `gaps.md` verschoben, sobald klar wird, dass sie dauerhaft nicht zugänglich sind

## Selbst-Audit vor jeder Antwort

1. Mindestens 1 Validator-Run in den letzten 30 Tagen zum Thema? Wenn nein → first.
2. Jede zitierte Quelle in dieser Antwort hat Status-Flag?
3. Jeder Patent-Status / Standard-Status / Effective-Date hat Datum + URL?
4. Keine erfundenen Daten (Stichprobe-gegen-Original)?
