/**
 * HELIX Case-View Normalizer
 *
 * Adapter-Layer für 4 verschiedene Case-Datentypen (Legal Cases, Ongoing Approvals,
 * Regulatory Updates, Patents) → einheitliche Case-Sicht für die `<CaseCard>`-Komponente.
 *
 * Bloomberg Law / LexisNexis / Reuters Regulatory Intelligence Pattern:
 *   - Sticky Header     → Aktenzeichen prominent + Authority + Date + Badges + Action-Buttons
 *   - 5 Tabs ÜBER Inhalt → Übersicht · Verlauf · Dokumente · Quellen · Aktionen
 *   - Source-of-truth   → alle Daten aus Row, ohne Mock-Platzhalter zu erfinden
 *   - Inline Citations  → erkennt Regex-Pattern (FDA Art. X, MDR Art. Y) und macht sie klickbar
 *
 * Defensiv gegen:
 *   - fehlende Felder (Server kann was auslassen)
 *   - Note: `{}` (Date-Objekte kaputt)
 *   - leere Arrays
 *   - alternative Naming-Variants (case_number / caseNumber)
 */

import { safeDateLike } from "@/lib/date";

// ────────────────────────────────────────────────────────────────────────
// Public Types
// ────────────────────────────────────────────────────────────────────────

/** Identifies which kind of record the CaseCard is rendering. */
export type CaseType = "legal" | "approval" | "update" | "patent";

/** Normalized header fields used by `<CaseCardHeader>`. */
export interface CaseHeader {
  /** Primary "Aktenzeichen" / "Case-Number" / "FDA K-Number" badge. */
  number: string;
  /** Main title (Case title, Product, Update title). */
  title: string;
  /** Authority/Court/Issuer. */
  authority: string;
  /** Date displayed in header. */
  dateLabel: string;
  /** Raw Date or null. */
  date: Date | null;
  /** Optional sub-line (subtitle). */
  subtitle?: string;
  /** Emoji or 2-letter code for the authority (US/EU/DE etc.). */
  authorityIcon?: string;
  /** Status badge (open/closed/approved/pending/etc.). */
  status?: { label: string; tone: "blue" | "violet" | "emerald" | "amber" | "rose" | "slate" };
  /** Impact-Level badge (high/medium/low/critical). */
  impact?: { label: string; tone: "blue" | "violet" | "emerald" | "amber" | "rose" | "slate" };
}

/** A timeline event after normalization. */
export interface CaseTimelineEvent {
  /** ISO date string or "—". */
  date: string;
  /** Date object or null. */
  dateObj: Date | null;
  /** Short label e.g. "Filed", "Decision", "Hearing". */
  title: string;
  /** Optional longer text. */
  description?: string;
  /** "past" | "current" | "future". */
  status: "past" | "current" | "future";
  /** Optional icon-key. */
  icon?: "filing" | "review" | "decision" | "appeal" | "publication" | "amendment" | "hearing" | "deadline";
}

/** A source/citation reference (links to laws, regs, related cases). */
export interface CaseCitation {
  /** Display label e.g. "MDR Art. 10(2)". */
  label: string;
  /** Deep-link (URL to gov source). */
  url: string;
  /** Citation type (regulation | standard | guidance | related). */
  type: "regulation" | "standard" | "guidance" | "related";
  /** Optional authority/citation reference. */
  authority?: string;
}

/** A document attached to the case. */
export interface CaseDocument {
  /** Display title. */
  title: string;
  /** Optional URL. */
  url?: string;
  /** Document kind (judgment | evidence | form | etc.). */
  kind: "judgment" | "evidence" | "form" | "report" | "specification" | "guidance" | "other";
  /** File size label e.g. "PDF · 2.4 MB". */
  meta?: string;
}

/** Actions the user can take on this case (AI Insight, PDF, Subscribe, …). */
export interface CaseAction {
  /** Display label. */
  label: string;
  /** Action type — controls icon + target. */
  kind: "ai-insight" | "pdf-export" | "source" | "mark" | "compare" | "edit";
  /** Optional href (used for source/export). */
  href?: string;
  /** Optional prefill payload for cross-page navigation (e.g. Cmd+K → /chat?agent=fda). */
  prefill?: Record<string, string>;
}

/** The final shape consumed by `<CaseCard>` components. */
export interface NormalizedCase {
  type: CaseType;
  id: string;
  header: CaseHeader;
  /** Key facts displayed in the Overview tab. */
  keyFacts: Array<{ label: string; value: string }>;
  /** Long-form summary text. */
  summary?: string;
  /** Timeline events for the Verlauf tab. */
  timeline: CaseTimelineEvent[];
  /** Documents for the Dokumente tab. */
  documents: CaseDocument[];
  /** Citations/sources for the Quellen tab + inline highlights. */
  citations: CaseCitation[];
  /** User actions for the Aktionen tab + sticky header buttons. */
  actions: CaseAction[];
  /** Inline-citation regex (matched against summary to render `<CitationChip>`). */
  citationPattern?: RegExp;
}

// ────────────────────────────────────────────────────────────────────────
// Tone Helpers — single source of truth re-used with `colorTokens.ts`.
// ────────────────────────────────────────────────────────────────────────

export type Tone = "blue" | "violet" | "emerald" | "amber" | "rose" | "slate";

export interface ToneStyle {
  /** Background pill (e.g. `bg-blue-50`). */
  bg: string;
  /** Border. */
  border: string;
  /** Text. */
  text: string;
  /** Solid color for icons/dots. */
  solid: string;
  /** Hover pill (e.g. `hover:bg-blue-100`). */
  hover: string;
}

const TONE_MAP: Record<Tone, ToneStyle> = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", solid: "text-blue-600", hover: "hover:bg-blue-100" },
  violet: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", solid: "text-violet-600", hover: "hover:bg-violet-100" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", solid: "text-emerald-600", hover: "hover:bg-emerald-100" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", solid: "text-amber-600", hover: "hover:bg-amber-100" },
  rose: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", solid: "text-rose-600", hover: "hover:bg-rose-100" },
  slate: { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700", solid: "text-slate-600", hover: "hover:bg-slate-100" },
};

export function toneStyle(tone: Tone): ToneStyle {
  return TONE_MAP[tone];
}

export function impactTone(level?: string | null): Tone {
  const v = (level ?? "").toLowerCase();
  if (v === "critical" || v === "high") return "rose";
  if (v === "medium" || v === "med") return "amber";
  if (v === "low" || v === "minor") return "emerald";
  return "slate";
}

export function statusTone(status?: string | null): Tone {
  const v = (status ?? "").toLowerCase();
  if (v === "approved" || v === "genehmigt") return "emerald";
  if (v === "rejected" || v === "abgelehnt") return "rose";
  if (v === "submitted" || v === "eingereicht" || v === "under-review" || v === "pending") return "amber";
  if (v === "nearly-approved" || v === "fast genehmigt") return "violet";
  return "slate";
}

// ────────────────────────────────────────────────────────────────────────
// Authority Icon (emoji coerces from jurisdiction / region strings).
// ────────────────────────────────────────────────────────────────────────

const AUTH_EMOJI_BY_KEY: Array<[RegExp, string]> = [
  [/^US|^United States|^FDA|^Federal/i, "🇺🇸"],
  [/^EU|^EMA|^CE|^MDR|^MDD/i, "🇪🇺"],
  [/^DE|^Germany|^BfArM|^BMJ/i, "🇩🇪"],
  [/^UK|^MHRA|^Britain/i, "🇬🇧"],
  [/^JP|^Japan|^PMDA/i, "🇯🇵"],
  [/^CN|^China|^NMPA/i, "🇨🇳"],
  [/^CA|^Canada|^Health Canada/i, "🇨🇦"],
  [/^AU|^Australia|^TGA/i, "🇦🇺"],
  [/^BR|^Brazil|^ANVISA/i, "🇧🇷"],
];

export function authorityIcon(jurisdiction: string | null | undefined): string {
  if (!jurisdiction) return "🌍";
  for (const [pattern, emoji] of AUTH_EMOJI_BY_KEY) {
    if (pattern.test(jurisdiction)) return emoji;
  }
  return "🌍";
}

// ────────────────────────────────────────────────────────────────────────
// Citation detection — surfaces regulatory references inline.
// ────────────────────────────────────────────────────────────────────────

/**
 * Catches common regulatory citations. Examples:
 *   "FDA 21 CFR 820"     → [FDA 21 CFR 820]
 *   "MDR Art. 10(2)"     → [MDR Art. 10(2)]
 *   "ISO 13485:2016"     → [ISO 13485:2016]
 *   "Article 10"         → [Article 10]
 *   "510(k)"             → [510(k)]
 */
const CITATION_REGEX =
  /\b(?:FDA\s+21\s+CFR\s+\d+(?:\.\d+)?|MDR\s+Art(?:\.|icle)?\s+\d+(?:\([^)]+\))?|ISO\s+\d{4,5}(?::\d{4})?|IEC\s+\d{4,5}|ASTM\s+[A-Z]?\d+|510\(k\)|PMA\s+\d+|Article\s+\d+(?:\([^)]+\))?|§\s?\d+(?:\sAbs\.\s?\d+)?(?:[A-Z])?)/gi;

export const CITATION_PATTERN = CITATION_REGEX;

/** Splits summary text into segments for `<CitationChip>` rendering. */
export function splitSummaryWithCitations(summary: string): Array<{ text: string; isCitation: boolean }> {
  if (!summary) return [];
  const out: Array<{ text: string; isCitation: boolean }> = [];
  const regex = new RegExp(CITATION_REGEX.source, "gi");
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(summary)) !== null) {
    if (match.index > lastIdx) {
      out.push({ text: summary.slice(lastIdx, match.index), isCitation: false });
    }
    out.push({ text: match[0], isCitation: true });
    lastIdx = regex.lastIndex;
  }
  if (lastIdx < summary.length) {
    out.push({ text: summary.slice(lastIdx), isCitation: false });
  }
  return out;
}

// ────────────────────────────────────────────────────────────────────────
// Normalizers per type
// ────────────────────────────────────────────────────────────────────────

export type AnyRecord = Record<string, any>;

function pick<T>(...candidates: Array<T | null | undefined | "">): T | undefined {
  for (const c of candidates) {
    if (c !== null && c !== undefined && c !== "") return c;
  }
  return undefined;
}

function fmtIsoDate(d: Date | null): string {
  if (!d) return "—";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function fmtDeShort(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("de-DE");
}

export function normalizeLegalCase(input: AnyRecord): NormalizedCase {
  const decisionDateRaw = pick(input.decision_date, input.decisionDate);
  const decisionD = safeDateLike(decisionDateRaw);
  const number = pick(input.case_number, input.caseNumber, "—") ?? "—";
  const title = pick(input.title, "(Ohne Titel)") ?? "(Ohne Titel)";
  const court = pick(input.court, "Unbekanntes Gericht") ?? "Unbekanntes Gericht";
  const jurisdiction = pick(input.jurisdiction, "—") ?? "—";
  const impact = pick(input.impact_level, input.impactLevel);
  const impactLevel = impact ? impact.toUpperCase() : "—";

  // Timeline: derive phases from decisionDate only (single-shot).
  const timeline: CaseTimelineEvent[] = [
    decisionD
      ? { date: fmtIsoDate(decisionD), dateObj: decisionD, title: "Entscheidung verkündet", status: "current", icon: "decision" }
      : { date: "—", dateObj: null, title: "Entscheidung", status: "future", icon: "decision" },
  ];

  // Documents: court document + optional source URL.
  const documents: CaseDocument[] = [];
  const docUrl = pick(input.document_url, input.documentUrl, input.source_url, input.sourceUrl);
  documents.push({
    title: pick(input.title, "Urteilstext") ?? "Urteilstext",
    url: docUrl,
    kind: "judgment",
    meta: docUrl ? "PDF · Originaldokument" : "Direktlink nicht verfügbar",
  });
  if (input.content && typeof input.content === "string") {
    documents.push({
      title: "Vollständiger Inhalt",
      kind: "report",
      meta: `${input.content.length.toLocaleString("de-DE")} Zeichen`,
    });
  }
  if (input.verdict && typeof (input as any).verdict === "string") {
    documents.push({ title: "Urteilsspruch (Tenor)", kind: "report" });
  }
  if (input.damages && typeof (input as any).damages === "string") {
    documents.push({ title: "Schadensersatz", kind: "report" });
  }

  // Citations: extract from summary, plus jurisdiction/court.
  const citations: CaseCitation[] = [];
  if (input.keywords && Array.isArray(input.keywords)) {
    for (const kw of input.keywords.slice(0, 12)) {
      citations.push({ label: String(kw), url: "#", type: "related", authority: jurisdiction });
    }
  }
  citations.push({ label: `${court} · ${jurisdiction}`, url: docUrl ?? "#", type: "related", authority: jurisdiction });

  // Actions.
  const actions: CaseAction[] = [
    {
      label: "AI-Insight",
      kind: "ai-insight",
      prefill: { agent: "compliance", q: `Analysiere Fall ${number}: ${title}` },
    },
    { label: "PDF-Export", kind: "pdf-export" },
  ];
  if (docUrl) {
    actions.push({ label: "Originaldokument", kind: "source", href: docUrl });
  }
  actions.push({ label: "Markieren", kind: "mark" });

  return {
    type: "legal",
    id: pick(input.id, number) ?? "—",
    header: {
      number,
      title,
      authority: court,
      dateLabel: fmtDeShort(decisionD),
      date: decisionD,
      subtitle: jurisdiction,
      authorityIcon: authorityIcon(jurisdiction),
      impact: { label: `${impactLevel} IMPACT`, tone: impactTone(impact) },
    },
    keyFacts: [
      { label: "Aktenzeichen", value: number },
      { label: "Gericht", value: court },
      { label: "Jurisdiktion", value: jurisdiction },
      { label: "Entscheidung", value: fmtDeShort(decisionD) },
      { label: "Quelle", value: pick(input.source, "—") ?? "—" },
      ...(pick(input.keywords)?.[0] ? [{ label: "Top-Tag", value: String(input.keywords[0]) }] : []),
    ],
    summary: pick(input.summary, input.content),
    timeline,
    documents,
    citations,
    actions,
    citationPattern: CITATION_PATTERN,
  };
}

export function normalizeOngoingApproval(input: AnyRecord): NormalizedCase {
  const submissionD = safeDateLike(input.submissionDate);
  const decisionD = safeDateLike(input.expectedApproval);
  const now = new Date();
  const reviewStartD = safeDateLike(input.reviewStartDate);

  // Timeline: Submission → Review-Start → Expected-Decision.
  const reviewStartStatus: "past" | "current" | "future" = reviewStartD
    ? reviewStartD.getTime() <= now.getTime()
      ? "past"
      : "future"
    : "future";

  const decisionStatus: "past" | "current" | "future" = decisionD
    ? decisionD.getTime() <= now.getTime()
      ? "past"
      : "future"
    : "future";

  const timeline: CaseTimelineEvent[] = [
    submissionD
      ? { date: fmtIsoDate(submissionD), dateObj: submissionD, title: "Einreichung", status: "past", icon: "filing" }
      : { date: "—", dateObj: null, title: "Einreichung", status: "future", icon: "filing" },
    {
      date: fmtIsoDate(reviewStartD),
      dateObj: reviewStartD,
      title: "Prüfung begonnen",
      status: reviewStartStatus,
      icon: "review",
    },
    {
      date: fmtIsoDate(decisionD),
      dateObj: decisionD,
      title: "Erwartete Genehmigung",
      status: decisionStatus,
      icon: "decision",
    },
  ];

  // Documents: estimated costs docs.
  const documents: CaseDocument[] = [
    { title: "Zulassungsantrag", kind: "form", meta: input.regulatoryBody ?? "—", url: input.url },
    { title: "Statusbericht", kind: "report", meta: input.progressPercentage != null ? `Fortschritt ${input.progressPercentage}%` : "—" },
  ];
  if (input.estimatedCosts) {
    documents.push({ title: "Kostenübersicht", kind: "report", meta: input.estimatedCosts });
  }
  if (input.contactPerson) {
    documents.push({ title: "Ansprechpartner", kind: "other", meta: input.contactPerson });
  }
  // Surface milestones / challenges / next-steps from older API shape as documents
  // so ein CaseCard more information als die alte 4-Tab Variante behält.
  if (Array.isArray(input.keyMilestones)) {
    for (const m of input.keyMilestones.slice(0, 8)) {
      const clean = String(m).replace(/^[✅🔄⏳]\s*/, "");
      documents.push({ title: `Meilenstein: ${clean}`, kind: "report" });
    }
  }
  if (Array.isArray(input.challenges)) {
    for (const c of input.challenges.slice(0, 8)) {
      documents.push({ title: `Herausforderung: ${c}`, kind: "report" });
    }
  }
  if (Array.isArray(input.nextSteps)) {
    for (const s of input.nextSteps.slice(0, 8)) {
      documents.push({ title: `Nächster Schritt: ${s}`, kind: "report" });
    }
  }

  // Citations: source body.
  const citations: CaseCitation[] = [
    { label: input.regulatoryBody ?? "Behörde", url: "#", type: "regulation", authority: input.region ?? "—" },
    ...(input.deviceClass ? [{ label: `Produktklasse: ${input.deviceClass}`, url: "#", type: "standard" as const }] : []),
  ];

  // Actions.
  const headerDate = decisionD ?? submissionD;
  const actions: CaseAction[] = [
    {
      label: "AI-Insight",
      kind: "ai-insight",
      prefill: {
        agent: input.region?.match(/US|USA/i) ? "fda" : "ema",
        q: `Analysiere laufende Zulassung ${input.productName} bei ${input.regulatoryBody}`,
      },
    },
    { label: "Statusbericht", kind: "pdf-export" },
    { label: "Bearbeiten", kind: "edit" },
  ];

  return {
    type: "approval",
    id: input.id ?? input.productName ?? "—",
    header: {
      number: input.id ? String(input.id).slice(0, 12) : "—",
      title: input.productName ?? "—",
      authority: input.regulatoryBody ?? "Unbekannte Behörde",
      dateLabel: fmtDeShort(headerDate),
      date: headerDate,
      subtitle: `${input.region ?? "—"} · ${input.deviceClass ?? "—"}`,
      authorityIcon: authorityIcon(input.region),
      status: { label: String(input.status ?? "—").toUpperCase(), tone: statusTone(input.status) },
    },
    keyFacts: [
      { label: "Produkt", value: input.productName ?? "—" },
      { label: "Unternehmen", value: input.company ?? "—" },
      { label: "Region", value: input.region ?? "—" },
      { label: "Behörde", value: input.regulatoryBody ?? "—" },
      { label: "Eingereicht", value: fmtDeShort(submissionD) },
      { label: "Erwartet", value: fmtDeShort(decisionD) },
      { label: "Fortschritt", value: input.progressPercentage != null ? `${input.progressPercentage}%` : "—" },
      { label: "Aktuelle Phase", value: input.currentPhase ?? "—" },
    ],
    summary: input.currentPhase ?? `Zulassung wird von ${input.regulatoryBody ?? "der zuständigen Behörde"} geprüft.`,
    timeline,
    documents,
    citations,
    actions,
  };
}

export function normalizeRegulatoryUpdate(input: AnyRecord): NormalizedCase {
  // 1. Date fallback: publishedAt (echte API) → created_at → published_date (Schema).
  const publishedD = safeDateLike(pick(input.publishedAt, input.created_at, input.published_date));
  const effectiveD = safeDateLike(pick(input.effectiveDate, input.effective_date));
  const deadlineD = safeDateLike(pick(input.actionDeadline, input.action_deadline));
  const createdD = safeDateLike(input.created_at);

  const now = Date.now();
  const effectiveStatus: "past" | "current" | "future" = effectiveD
    ? effectiveD.getTime() <= now ? "past" : "future"
    : "future";
  const deadlineStatus: "past" | "current" | "future" = deadlineD
    ? deadlineD.getTime() <= now ? "current" : "future"
    : "future";

  // 2. content-Erkennung: API liefert hier entweder URL oder Markdown-Text.
  const isContentUrl = typeof input.content === "string" && /^https?:\/\//i.test(input.content.trim());
  const mainDocUrl = isContentUrl ? input.content?.trim() : null;

  // source_url / url können identisch sein (Set-basiert dedupliziert).
  const urlCandidates = [
    ...new Set(
      [input.url, input.source_url, input.documentUrl].filter(
        (u): u is string => typeof u === "string" && u.trim() !== ""
      )
    ),
  ];
  const fallbackUrl = urlCandidates[0];

  // Single source of truth for title fallback (header + AI-Insight prefill).
  const fallbackTitle = "Unbenanntes Update";
  const resolvedTitle = pick(input.title, input.id) ?? fallbackTitle;

  // 3. Timeline: Veröffentlicht + Erfasst + Optional Wirksam ab / Frist.
  const timeline: CaseTimelineEvent[] = [];
  timeline.push({
    date: fmtIsoDate(publishedD),
    dateObj: publishedD,
    title: "Veröffentlicht",
    status: "past",
    icon: "publication",
  });
  if (createdD && (!publishedD || createdD.getTime() !== publishedD.getTime())) {
    timeline.push({
      date: fmtIsoDate(createdD),
      dateObj: createdD,
      title: "Erfasst",
      status: "past",
      icon: "filing",
    });
  }
  if (effectiveD) {
    timeline.push({ date: fmtIsoDate(effectiveD), dateObj: effectiveD, title: "Wirksam ab", status: effectiveStatus, icon: "amendment" });
  }
  if (deadlineD) {
    timeline.push({ date: fmtIsoDate(deadlineD), dateObj: deadlineD, title: "Umsetzungsfrist", status: deadlineStatus, icon: "deadline" });
  }

  // 4. Dokumente: Original-URL + Guidance-Dokumente + Schema-Fallback.
  const documents: CaseDocument[] = [];
  const seenUrls = new Set<string>();
  const addDoc = (title: string, url: string | undefined, kind: CaseDocument["kind"], meta?: string) => {
    if (url && seenUrls.has(url)) return;
    if (url) seenUrls.add(url);
    documents.push({ title, url, kind, ...(meta ? { meta } : {}) });
  };
  addDoc("Original-Dokument", mainDocUrl ?? undefined, "guidance", "Federal Register / Primärquelle");
  for (const u of urlCandidates) {
    if (u !== mainDocUrl) addDoc("Original-Quelle", u, "guidance", input.source_name ?? undefined);
  }
  if (Array.isArray(input.guidanceDocuments)) {
    for (const g of input.guidanceDocuments.slice(0, 6)) {
      addDoc(g.name ?? "Guidance", g.url, "guidance", g.description ?? undefined);
    }
  }
  if (documents.length === 0) {
    documents.push({ title: "Zusammenfassung", kind: "report", meta: input.source_description ?? "Regulierung" });
  }

  // 5. Summary-Text: echte Beschreibung wenn vorhanden, sonst title-Fallback.
  const inlineText = typeof input.content === "string" && !isContentUrl ? input.content : null;
  const summaryText =
    pick(input.description, input.summary, inlineText, input.title) ??
    "Keine textuelle Zusammenfassung verfügbar.";

  // 6. Citations: source_name (z. B. Federal Register), tags, jurisdiction.
  const citations: CaseCitation[] = [];
  const jurisdiction = pick(input.source_country, input.jurisdiction);
  if (input.source_name) {
    citations.push({
      label: input.source_name,
      url: fallbackUrl ?? "#",
      type: "regulation",
      authority: jurisdiction,
    });
  }
  if (jurisdiction) {
    citations.push({ label: `${jurisdiction} Behördenquelle`, url: "#", type: "related", authority: jurisdiction });
  }
  if (Array.isArray(input.tags) && input.tags.length > 0) {
    for (const tag of input.tags.slice(0, 6)) {
      citations.push({ label: tag, url: "#", type: "related", authority: jurisdiction });
    }
  }
  if (Array.isArray(input.affectedProducts)) {
    for (const p of input.affectedProducts.slice(0, 6)) {
      citations.push({ label: `Produkt: ${p}`, url: "#", type: "related", authority: jurisdiction });
    }
  }

  // 7. Actions: ai-insight garantiert + externe Original-Quelle wenn vorhanden.
  const actions: CaseAction[] = [
    {
      label: "AI-Insight",
      kind: "ai-insight",
      prefill: {
        agent:
          String(jurisdiction ?? "").match(/US|USA|FDA/i) ? "fda" :
          String(jurisdiction ?? "").match(/EU|EMA/i) ? "ema" : "compliance",
        q: `Fasse dieses Update zusammen: ${resolvedTitle}`,
      },
    },
  ];
  if (fallbackUrl) {
    actions.push({ label: "Zur Primärquelle", kind: "source", href: fallbackUrl });
  }
  actions.push({ label: "PDF-Export", kind: "pdf-export" });
  actions.push({ label: "Markieren", kind: "mark" });

  // 8. Header-Tone: aktiv grün, sonst blau/slate.
  const isActive = input.isActive === true || input.isActive === "true";
  return {
    type: "update",
    id: input.id ?? "—",
    header: {
      number: pick(input.fda_k_number, input.source_name, input.id) ?? "Update",
      title: resolvedTitle,
      authority: String(jurisdiction ?? "International"),
      dateLabel: fmtDeShort(publishedD),
      date: publishedD,
      subtitle: pick(input.source_description, input.type, "Regulierung") ?? "Regulierung",
      authorityIcon: authorityIcon(typeof jurisdiction === "string" ? jurisdiction : null),
      impact: { label: isActive ? "ACTIVE" : "INFO", tone: isActive ? "emerald" : "blue" },
      ...(input.priority != null && Number(input.priority) >= 2
        ? { status: { label: "PRIORITÄT", tone: "rose" as Tone } }
        : {}),
    },
    keyFacts: [
      { label: "Behörde/Land", value: String(jurisdiction ?? "—") },
      { label: "Quelle", value: String(input.source_name ?? "—") },
      { label: "Typ", value: String(input.source_description ?? input.type ?? "—") },
      { label: "Veröffentlicht", value: fmtDeShort(publishedD) },
      { label: "Erfasst", value: fmtDeShort(createdD) },
      { label: "Status", value: isActive ? "Aktiv" : "Inaktiv" },
      ...(input.source_url || mainDocUrl ? [{ label: "URL", value: mainDocUrl ?? fallbackUrl ?? "—" }] : []),
    ],
    summary: summaryText,
    timeline,
    documents,
    citations,
    actions,
    citationPattern: CITATION_PATTERN,
  };
}

export function normalizePatent(input: AnyRecord): NormalizedCase {
  const pubD = safeDateLike(input.publicationDate);
  const filingD = safeDateLike(input.filingDate);

  const timeline: CaseTimelineEvent[] = [
    filingD
      ? { date: fmtIsoDate(filingD), dateObj: filingD, title: "Anmeldung", status: "past", icon: "filing" }
      : { date: "—", dateObj: null, title: "Anmeldung", status: "future", icon: "filing" },
    pubD
      ? { date: fmtIsoDate(pubD), dateObj: pubD, title: "Veröffentlichung", status: "current", icon: "publication" }
      : { date: "—", dateObj: null, title: "Veröffentlichung", status: "future", icon: "publication" },
  ];

  const documents: CaseDocument[] = [];
  if (input.documentUrl) documents.push({ title: "Patent-Dokument", url: input.documentUrl, kind: "report" });
  if (input.abstract) documents.push({ title: "Abstract", kind: "report" });

  const citations: CaseCitation[] = [];
  if (Array.isArray(input.ipcCodes)) {
    for (const code of input.ipcCodes.slice(0, 8)) {
      citations.push({ label: `IPC ${code}`, url: "#", type: "standard" });
    }
  }
  if (Array.isArray(input.cpcCodes)) {
    for (const code of input.cpcCodes.slice(0, 8)) {
      citations.push({ label: `CPC ${code}`, url: "#", type: "standard" });
    }
  }

  const actions: CaseAction[] = [
    {
      label: "AI-Insight",
      kind: "ai-insight",
      prefill: { agent: "general", q: `Recherchiere Patent ${input.publicationNumber}` },
    },
    ...(input.documentUrl ? [{ label: "Original-Patent", kind: "source" as const, href: input.documentUrl }] : []),
    { label: "PDF-Export", kind: "pdf-export" },
  ];

  return {
    type: "patent",
    id: input.id ?? input.publicationNumber ?? "—",
    header: {
      number: input.publicationNumber ?? "—",
      title: input.title ?? "—",
      authority: input.jurisdiction ?? "—",
      dateLabel: fmtDeShort(pubD ?? filingD),
      date: pubD ?? filingD,
      subtitle: input.applicant ?? "—",
      authorityIcon: authorityIcon(input.jurisdiction),
      impact: {
        label: String(input.status ?? "—").toUpperCase(),
        tone: input.status === "granted" ? "emerald" : input.status === "pending" ? "amber" : "slate",
      },
    },
    keyFacts: [
      { label: "Veröffentlichungs-Nr.", value: input.publicationNumber ?? "—" },
      { label: "Anmelder", value: input.applicant ?? "—" },
      { label: "Erfinder", value: Array.isArray(input.inventors) ? input.inventors.join("; ") : "—" },
      { label: "Status", value: input.status ?? "—" },
      { label: "Veröffentlicht", value: fmtDeShort(pubD) },
      { label: "Angemeldet", value: fmtDeShort(filingD) },
    ],
    summary: input.abstract,
    timeline,
    documents,
    citations,
    actions,
  };
}

/**
 * Type-discriminated dispatcher — used by pages that receive heterogeneous lists.
 */
export function normalizeCase(type: CaseType, input: AnyRecord): NormalizedCase {
  switch (type) {
    case "legal":
      return normalizeLegalCase(input);
    case "approval":
      return normalizeOngoingApproval(input);
    case "update":
      return normalizeRegulatoryUpdate(input);
    case "patent":
      return normalizePatent(input);
  }
}
