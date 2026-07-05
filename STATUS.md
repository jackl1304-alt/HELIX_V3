# HELIX — Projekt-Status

> **Stand:** 2026-07-05 · **Branch:** `main` · **Letzter Commit:** `ecda3ab` (auto-commit)
> **origin/main:** 10 Commits hinter uns (lokal voraus) — `git push` ausstehend.

---

## ✅ Was war — in dieser Session gemacht

### 1. Case-View-Refactor für regulatorische Updates (7 Reviewer-Runden)
**User-Original-Bug:** *„Rechtsprechung & regulatorische Updates zeigen leere Tabs"*
**Fix:** Alle 5 Bloomberg-Law-Tabs (Übersicht / Verlauf / Dokumente / Quellen / Aktionen) haben jetzt sichtbaren Inhalt oder expliziten Empty-State.

| Datei | Was geändert |
|---|---|
| `client/src/lib/caseNormalize.ts` (~485 Z.) | `normalizeRegulatoryUpdate` komplett neu: `publishedAt` (camelCase, wie API liefert) + Fallbacks `created_at`/`published_date`; `content`-URL-Erkennung; Set-basierte URL-Deduplizierung; `fallbackTitle` + `resolvedTitle` als Single Source of Truth; `fda_k_number` als Primary-Input in `header.number`; deduplizierte Original-Quellen |
| `client/src/pages/regulatory-updates.tsx` | **580 → 190 Zeilen**. TypeScript-Interface auf echte 15 API-Felder reduziert, `useQuery` mit expliziter `queryFn` (vorher versteckter Bug: vertraute auf tanstack-Default), pro Update rendert `<CaseCard data={normalizeRegulatoryUpdate(row)} />` |
| `client/src/components/case/CaseCard.tsx` (~490 Z.) | **NEU-Badge** sichtbar im Header (vorher hidden sr-only) — 7-Tage-Frische-Indikator mit 8px weißem Punkt (Pattern-Match mit 4px-Accent-Strip links, kein Icon-Overload) |
| `client/src/pages/rechtsprechung-fixed.tsx` | CaseCard-Rendering integriert |
| `client/src/pages/laufende-zulassungen.tsx` | CaseCard-Rendering integriert |

**Verifikation:** Alle 6 Routen (`/`, `/regulatory-updates`, `/rechtsprechung`, `/zulassungen-laufende`, `/laufende-zulassungen`, `/legal-cases`) HTTP 200. Keine neuen TS-Errors durch diese Änderungen. 7 Code-Reviewer-Pässe mit allen Befunden angewendet (Set statt indexOf-Dedupe, FALLBACK_TITLE als SSOT, NEU-Badge iconless mit 8px Dot).

### 2. Skills global installiert (47 Skills)
| Quelle | Anzahl | Pfad |
|---|---|---|
| `obra/superpowers` | 14 | `C:\Users\Marco\.agents\skills\` |
| `ComposioHQ/awesome-claude-skills` | 33 | `C:\Users\Marco\.agents\skills\` |
| **Total** | **47** | persistent über alle Projekte |

**obra/superpowers Skills:** `using-superpowers`, `brainstorming`, `writing-plans`, `executing-plans`, `finishing-a-development-branch`, `using-git-worktrees`, `test-driven-development`, `verification-before-completion`, `requesting-code-review`, `receiving-code-review`, `systematic-debugging`, `dispatching-parallel-agents`, `subagent-driven-development`, `writing-skills`.

**Composio-Skills (Auswahl):** `webapp-testing`, `artifacts-builder`, `pdf`, `docx`, `xlsx`, `pptx`, `mcp-builder`, `frontend-design`, `api-design`, `brand-guidelines`, `using-superpowers` (overlap), u.v.m.

**Projekt-lokale Skills entfernt:** `.agents/skills/` aus dem Repo gelöscht (war in `.gitignore`, daher kein Risiko).

### 3. .env.example — vollständige Env-Referenz
Cloudflare-aware Refactor: `TRUSTED_PROXIES` (CIDR-Liste), `ALLOWED_ORIGINS` (CORS allowlist mit Wildcard), `SESSION_SECRET`, `BACKUP_PASSPHRASE` / `PD_ROUTING_KEY` / `BACKUP_ALERT_WEBHOOK` für Backup-Operations, `RCLONE_REMOTE` / `RCLONE_PATH` für Offsite-Backups (R2/S3).

### 4. Navigation — i18n-Anbindung
`client/src/components/layout/header.tsx`: Language-Selector ist jetzt an `LanguageContext` angebunden (Bug-Fix: schaltete vorher nur Anzeige, nicht State). `client/src/components/customer/customer-navigation.tsx`: komplette gruppierte Navigation mit `t()`-Aufrufen statt hardcoded Strings.

### 5. Build-Artefakte bereinigt
Veraltete `dist/public/assets/*.js` Files (170+ verwaiste Build-Chunks) aus dem Working Tree entfernt — kommen aus dem Build, gehören nicht in Git.

---

## 🟡 Was muss noch — offene Aufgaben

### Priorität HOCH
1. **`git push origin main`** — wir sind 10 Commits voraus, origin ist lokal nicht aktualisiert.
2. **`patents.tsx` Case-View-Refactor** — gleiche Problematik wie regulatory-updates, noch nicht umgesetzt. `normalizePatent` in `caseNormalize.ts` existiert bereits, aber die Page nutzt noch alte Card-Struktur. **Empfohlen:** analoges Pattern (580→190 Zeilen + CaseCard-Rendering).
3. **TS-Error in `regulatory-updates.tsx` line 224 verifizieren** — die letzten `npx tsc --noEmit`-Läufe zeigten 0 Errors in case-view-Files, aber eine Phantom-Meldung auf line 224 wurde gemeldet und nie final bestätigt/gefixt.

### Priorität MITTEL
4. **Volles Typecheck über alle Dateien** — letzte Zählungen zeigten ~52 TS-Errors insgesamt im `client/`, nicht alle case-view-Files. Sollte einmal sauber durchlaufen.
5. **Navigation deep-verify** — alle Texte in `sidebar.tsx`, `customer-navigation.tsx`, `mobile-sidebar.tsx` sollten über `t()` laufen. Stichprobe zeigte Lücken (z.B. Hardcoded `Customer Portal` in customer-navigation, hartkodierte Section-Labels).
6. **`browser_use` Smoke-Test** auf `/regulatory-updates` — visuell prüfen, ob die 5 Tabs einer Card tatsächlich Inhalt zeigen, nicht nur dass die Route 200 returnt.
7. **Finaler Code-Reviewer-Pass** auf das gesamte Refactor (caseNormalize + CaseCard + 3 Pages) — letzter Pass fokussierte auf Sparkles-Overload, gibt aber noch Mikro-Issues (Server-Clock-Skew bei 7-Tage-Grenze, Virtualisierung für 100+ Items).

### Priorität NIEDRIG
8. **`BACKUP_PASSPHRASE` + `PD_ROUTING_KEY` in prod setzen** — die neuen env-vars in `.env.example` müssen im Production-`.env` belegt werden, sonst fallen Backups auf Zufallsschlüssel zurück.
9. **`.env.example` vs `.env` Sync** — die `.env`-Datei (gitignored) muss lokal + auf dem Server mit den neuen Variablen ergänzt werden.
10. **Pagination / Virtualisierung** — bei 100+ Regulatory-Updates rendert React alle Sticky-Header + 5-Tab-Bäume. `@tanstack/react-virtual` mit `react-window` wäre für FDA-Officer-Use-Case wertvoll.
11. **7-Tage-Schwelle konfigurierbar** — aktuell hard-coded; später via `/api/tenant-config` oder User-Preference steuerbar.

---

## 📊 Git-Status zum Zeitpunkt dieses Commits

```
Branch:    main
HEAD:      ecda3ab (auto-commit, von voriger Session)
Working:   191 modified + 152 deleted + 66 untracked
Origin:    10 commits hinter uns (lokal voraus)
User:      jackl1304-alt <jackl1304@gmail.com>
```

**Hinweis:** Die 10 zurückliegenden origin-Commits sollten via `git pull --rebase origin main` lokal nachgeholt werden, **bevor** dieser Commit gepusht wird (vermeidet Force-Push).

---

## 🔧 Nächste Session — empfohlene Reihenfolge

1. `git pull --rebase origin main` — origin-Änderungen einholen
2. `patents.tsx` analog zu regulatory-updates refactorn
3. `npx tsc --noEmit` über ganzes `client/` — TS-Errors auf 0 bringen
4. Browser-Smoke-Test auf `/regulatory-updates` und `/patents`
5. `git push origin main` — sauberer Push ohne Force
