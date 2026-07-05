import * as React from "react";
import { useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Sparkles,
  Download,
  ExternalLink,
  Bookmark,
  BarChart3,
  Edit,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Circle as CircleIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  toneStyle,
  type NormalizedCase,
  type CaseAction,
  type CaseCitation,
  type CaseDocument,
  type CaseTimelineEvent,
  type Tone,
} from "@/lib/caseNormalize";
import { splitSummaryWithCitations } from "@/lib/caseNormalize";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────────────────
// Helpers (locally scoped).
// ────────────────────────────────────────────────────────────────────────

const TAB_IDS = ["overview", "timeline", "documents", "sources", "actions"] as const;
type TabId = (typeof TAB_IDS)[number];

/** Human-readable tone label for screen-reader text-only fallback. */
function toneLabel(tone: Tone): string {
  switch (tone) {
    case "blue": return "informativ";
    case "violet": return "fortschritt";
    case "emerald": return "positiv";
    case "amber": return "warnung";
    case "rose": return "kritisch";
    case "slate": return "neutral";
  }
}

function TimelineIcon({ kind, tone }: { kind?: CaseTimelineEvent["icon"]; tone: Tone }) {
  const t = toneStyle(tone);
  if (kind === "filing") return <Edit className={cn("h-3.5 w-3.5", t.solid)} />;
  if (kind === "review" || kind === "hearing") return <Clock className={cn("h-3.5 w-3.5", t.solid)} />;
  if (kind === "decision") return <CheckCircle2 className={cn("h-3.5 w-3.5", t.solid)} />;
  if (kind === "appeal") return <AlertTriangle className={cn("h-3.5 w-3.5", t.solid)} />;
  if (kind === "publication" || kind === "amendment") return <Sparkles className={cn("h-3.5 w-3.5", t.solid)} />;
  if (kind === "deadline") return <AlertTriangle className={cn("h-3.5 w-3.5", t.solid)} />;
  return <CircleIcon className={cn("h-3.5 w-3.5", t.solid)} />;
}

// ────────────────────────────────────────────────────────────────────────
// Sticky Header — Bloomberg-Law style. Sits at the top of the card; never
// reflows when scroll happens inside the tab content area.
// ────────────────────────────────────────────────────────────────────────

function CaseCardHeader({
  header,
  actions,
  onAction,
}: {
  header: NormalizedCase["header"];
  actions: CaseAction[];
  onAction: (a: CaseAction) => void;
}) {
  // At-a-glance freshness cue: data ≤ 7 days old → visible NEU-Badge.
  // (Vorher nur als hidden sr-only hint; Reviewer wies darauf hin dass
  // die alte Page das prominent zeigte — wir restaurieren das.)
  const isNew = header.date
    ? Date.now() - header.date.getTime() <= 7 * 24 * 60 * 60 * 1000
    : false;

  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-5 pt-4 pb-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Top row: number + status/impact chips + NEU badge */}
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono text-[11px] font-bold tracking-wide uppercase"
              title={header.number}
            >
              {header.number}
            </span>
            {isNew && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider"
                title="Innerhalb der letzten 7 Tage aktualisiert"
              >
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-white" />
                <span>NEU</span>
              </span>
            )}
            {header.impact && (
              (() => {
                const t = toneStyle(header.impact.tone);
                return (
                  <Badge className={cn("border", t.bg, t.text, t.border)}>
                    <span className="sr-only">Risiko-Ton: {toneLabel(header.impact.tone)} — </span>
                    {header.impact.label}
                  </Badge>
                );
              })()
            )}
            {header.status && (
              (() => {
                const t = toneStyle(header.status.tone);
                return (
                  <Badge className={cn("border", t.bg, t.text, t.border)}>
                    <span className="sr-only">Status-Ton: {toneLabel(header.status.tone)} — </span>
                    {header.status.label}
                  </Badge>
                );
              })()
            )}
            {header.subtitle && (
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                {header.subtitle}
              </span>
            )}
          </div>

          {/* Title + authority row */}
          <div className="flex items-start gap-2">
            {header.authorityIcon && (
              <span className="text-lg leading-tight shrink-0 mt-0.5" aria-hidden="true">
                {header.authorityIcon}
              </span>
            )}
            <h3 className="text-base md:text-lg font-semibold text-slate-900 leading-snug">
              {header.title}
            </h3>
          </div>

          {/* Authority + date */}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
            <span className="font-medium">{header.authority}</span>
            <span className="text-slate-300">·</span>
            <span>{header.dateLabel}</span>
          </div>
        </div>

        {/* Action buttons — invariant: every normalizer puts `ai-insight` first,
            so the filter always finds at least one button. The slice(0, 1) branch
            is defensive only (e.g. if a future normalizer strips ai-insight it
            would still render something instead of an empty slot). */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {(actions.some((a) => a.kind === "ai-insight" || a.kind === "pdf-export" || a.kind === "source")
            ? actions.filter((a) => a.kind === "ai-insight" || a.kind === "pdf-export" || a.kind === "source").slice(0, 3)
            : actions.slice(0, 1)
          ).map((a) => {
              if (a.kind === "ai-insight") {
                return (
                  <Button
                    key={a.label}
                    size="sm"
                    variant="outline"
                    onClick={() => onAction(a)}
                    className="h-8 text-xs bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    {a.label}
                  </Button>
                );
              }
              if (a.kind === "pdf-export") {
                return (
                  <Button
                    key={a.label}
                    size="sm"
                    variant="outline"
                    onClick={() => onAction(a)}
                    className="h-8 text-xs"
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    {a.label}
                  </Button>
                );
              }
              // source / external
              return (
                <Button
                  key={a.label}
                  size="sm"
                  variant="outline"
                  asChild={!!a.href}
                  onClick={() => onAction(a)}
                  className="h-8 text-xs"
                >
                  {a.href ? (
                    <a href={a.href} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      {a.label}
                    </a>
                  ) : (
                    <>
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      {a.label}
                    </>
                  )}
                </Button>
              );
            })}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Tab: Übersicht (Key facts grid + summary with inline citations).
// ────────────────────────────────────────────────────────────────────────

function OverviewTab({ data }: { data: NormalizedCase }) {
  // Memoize regex parse — verdicts/abstracts are 2–3 KB; without this the
  // regex re-runs on every parent re-render and jank on 50+ case lists.
  const segments = useMemo(
    () => (data.summary ? splitSummaryWithCitations(data.summary) : []),
    [data.summary]
  );

  return (
    <div className="space-y-4">
      {/* Key facts grid */}
      {data.keyFacts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {data.keyFacts.slice(0, 9).map((f, i) => (
            <div
              key={i}
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                {f.label}
              </div>
              <div className="text-sm text-slate-900 font-medium truncate">{f.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Summary with inline citations */}
      {data.summary && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
            Zusammenfassung
          </div>
          {segments.length > 0 ? (
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {segments.map((seg, i) =>
                seg.isCitation ? (
                  <CitationChip key={i} label={seg.text} />
                ) : (
                  <React.Fragment key={i}>{seg.text}</React.Fragment>
                )
              )}
            </p>
          ) : (
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {data.summary}
            </p>
          )}
        </div>
      )}

      {/* Top tag chips from citations (when present) */}
      {data.citations.filter((c) => c.type === "related").length > 0 && (
        <div className="flex flex-wrap gap-1">
          {data.citations
            .filter((c) => c.type === "related")
            .slice(0, 12)
            .map((c, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
              >
                {c.label}
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Tab: Verlauf (Timeline of phases).
// ────────────────────────────────────────────────────────────────────────

function TimelineTab({ data }: { data: NormalizedCase }) {
  if (data.timeline.length === 0) {
    return (
      <div className="text-sm text-slate-500 italic p-4 text-center">
        Keine Verlaufsdaten verfügbar.
      </div>
    );
  }

  return (
    <ol className="relative space-y-4 border-l-2 border-slate-200 ml-2 pl-5 pr-2 py-2">
      {data.timeline.map((ev, i) => {
        const tone: Tone =
          ev.status === "past" ? "emerald" : ev.status === "current" ? "blue" : "slate";
        const t = toneStyle(tone);
        return (
          <li key={i} className="relative">
            <span
              className={cn(
                "absolute -left-[27px] top-0.5 h-3.5 w-3.5 rounded-full ring-4 ring-white flex items-center justify-center",
                t.bg
              )}
            >
              <TimelineIcon kind={ev.icon} tone={tone} />
            </span>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-mono text-[11px] text-slate-500">{ev.date}</span>
              {ev.status === "future" && (
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  geplant
                </span>
              )}
              <span className="text-sm font-medium text-slate-900">{ev.title}</span>
            </div>
            {ev.description && (
              <p className="text-xs text-slate-600 mt-0.5">{ev.description}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Tab: Dokumente
// ────────────────────────────────────────────────────────────────────────

function DocumentsTab({ data }: { data: NormalizedCase }) {
  if (data.documents.length === 0) {
    return (
      <div className="text-sm text-slate-500 italic p-4 text-center">
        Keine Dokumente verfügbar.
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {data.documents.map((d, i) => (
        <li
          key={i}
          className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
        >
          <div className="mt-0.5 h-7 w-7 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
            <Badge variant="outline" className="border-0 text-[9px] uppercase font-bold">
              {d.kind === "judgment" ? "URT" : d.kind === "report" ? "RPT" : d.kind === "guidance" ? "GD" : d.kind === "form" ? "FRM" : "DOC"}
            </Badge>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              {d.url ? (
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-blue-700 hover:underline truncate"
                >
                  {d.title}
                </a>
              ) : (
                <span className="text-sm font-semibold text-slate-900 truncate">{d.title}</span>
              )}
              {d.meta && (
                <span className="text-[11px] text-slate-500 whitespace-nowrap">{d.meta}</span>
              )}
            </div>
          </div>
          {d.url && <ExternalLink className="h-3.5 w-3.5 text-slate-400 mt-1 shrink-0" />}
        </li>
      ))}
    </ul>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Tab: Quellen (Citations grouped by type).
// ────────────────────────────────────────────────────────────────────────

function SourcesTab({ data }: { data: NormalizedCase }) {
  const groups: Record<CaseCitation["type"], CaseCitation[]> = {
    regulation: [],
    standard: [],
    guidance: [],
    related: [],
  };
  for (const c of data.citations) groups[c.type].push(c);

  const labels: Record<CaseCitation["type"], string> = {
    regulation: "Verordnungen & Gesetze",
    standard: "Normen & Standards",
    guidance: "Guidance-Dokumente",
    related: "Verwandte Themen",
  };

  const visibleGroups = (Object.keys(groups) as Array<CaseCitation["type"]>).filter(
    (k) => groups[k].length > 0
  );

  if (visibleGroups.length === 0) {
    return (
      <div className="text-sm text-slate-500 italic p-4 text-center">
        Keine Quellen verfügbar.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visibleGroups.map((g) => (
        <div key={g}>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
            {labels[g]} <span className="text-slate-400">({groups[g].length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {groups[g].map((c, i) => (
              <CitationChip key={i} label={c.label} authority={c.authority} href={c.url} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Tab: Aktionen (extra actions)
// ────────────────────────────────────────────────────────────────────────

function ActionsTab({ data, onAction }: { data: NormalizedCase; onAction: (a: CaseAction) => void }) {
  const advanced = data.actions.filter(
    (a) => a.kind === "mark" || a.kind === "compare" || a.kind === "edit"
  );

  return (
    <div className="space-y-3">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
          Schnellaktionen
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {advanced.map((a, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => onAction(a)}
              className="justify-start h-auto py-2.5 px-3"
            >
              {a.kind === "mark" && <Bookmark className="h-4 w-4 mr-2 text-amber-600" />}
              {a.kind === "compare" && <BarChart3 className="h-4 w-4 mr-2 text-blue-600" />}
              {a.kind === "edit" && <Edit className="h-4 w-4 mr-2 text-slate-600" />}
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-medium">{a.label}</span>
                <span className="text-[10px] text-slate-500">
                  {a.kind === "mark" && "Zum Lesezeichen hinzufügen"}
                  {a.kind === "compare" && "Mit ähnlichen Fällen vergleichen"}
                  {a.kind === "edit" && "Daten bearbeiten"}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
          Alle Aktionen
        </div>
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {data.actions.map((a, i) => (
            <li key={i} className="flex items-center gap-3 px-3 py-2.5 text-sm">
              <div className="h-7 w-7 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                {a.kind === "ai-insight" && <Sparkles className="h-4 w-4 text-violet-600" />}
                {a.kind === "pdf-export" && <Download className="h-4 w-4 text-blue-600" />}
                {a.kind === "source" && <ExternalLink className="h-4 w-4 text-slate-600" />}
                {a.kind === "mark" && <Bookmark className="h-4 w-4 text-amber-600" />}
                {a.kind === "compare" && <BarChart3 className="h-4 w-4 text-blue-600" />}
                {a.kind === "edit" && <Edit className="h-4 w-4 text-slate-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900">{a.label}</div>
                {a.prefill?.q && (
                  <div className="text-[11px] text-slate-500 truncate">
                    Prefill: {a.prefill.agent ? `agent=${a.prefill.agent}, ` : ""}q="{a.prefill.q}"
                  </div>
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={() => onAction(a)}>
                Ausführen
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Citation chip — small inline pill for inline citations and the sources tab.
// ────────────────────────────────────────────────────────────────────────

function CitationChip({
  label,
  authority,
  href,
  className,
}: {
  label: string;
  authority?: string;
  href?: string;
  className?: string;
}) {
  const inner = (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md",
        "bg-blue-50 text-blue-700 border border-blue-200",
        "text-[11px] font-mono font-semibold tracking-tight",
        href && href !== "#" ? "hover:bg-blue-100 hover:border-blue-400 cursor-pointer" : "",
        className
      )}
      title={authority ?? label}
    >
      <span aria-hidden="true">§</span>
      {label}
    </span>
  );
  if (href && href !== "#") {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="no-underline">
        {inner}
      </a>
    );
  }
  return inner;
}

// ────────────────────────────────────────────────────────────────────────
// Main: CaseCard composition.
// ────────────────────────────────────────────────────────────────────────

export interface CaseCardProps {
  data: NormalizedCase;
  defaultTab?: TabId;
  className?: string;
}

export function CaseCard({ data, defaultTab = "overview", className }: CaseCardProps) {
  const [, setLocation] = useLocation();

  const onAction = useCallback(
    (a: CaseAction) => {
      if (a.kind === "ai-insight" && a.prefill) {
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(a.prefill)) {
          params.set(k, v);
        }
        setLocation(`/chat?${params.toString()}`);
        return;
      }
      if (a.kind === "source" && a.href) {
        window.open(a.href, "_blank", "noopener,noreferrer");
        return;
      }
      // pdf-export, mark, compare, edit: not implemented in MVP.
      // Hooks to subscribe/track later.
    },
    [setLocation]
  );

  // Left border strip = visual per-card color signal (Bloomberg Law pattern).
  // Maps the impact/status tone of the header. Falls back to slate when missing.
  const accentTone: Tone =
    data.header.impact?.tone ?? data.header.status?.tone ?? "slate";
  const accent = toneStyle(accentTone);

  return (
    <article
      className={cn(
        "relative rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden",
        className
      )}
    >
      {/* 4px left strip — immediate per-card risk visual cue */}
      <div
        aria-hidden="true"
        className={cn("absolute top-0 left-0 bottom-0 w-1", accent.bg, "border-r", accent.border)}
      />
      <CaseCardHeader header={data.header} actions={data.actions} onAction={onAction} />

      <Tabs defaultValue={defaultTab} className="w-full">
        <div className="sticky top-[88px] sm:top-[80px] z-10 bg-white border-b border-slate-200 px-3 sm:px-5">
          <TabsList className="bg-transparent h-10 p-0 gap-1 sm:gap-3 overflow-x-auto scrollbar-hide w-full justify-start">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 text-xs sm:text-sm text-slate-600 rounded-none h-10 px-2 sm:px-3"
            >
              Übersicht
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 text-xs sm:text-sm text-slate-600 rounded-none h-10 px-2 sm:px-3"
            >
              Verlauf
              <span className="ml-1.5 text-[10px] text-slate-400 font-mono">
                {data.timeline.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 text-xs sm:text-sm text-slate-600 rounded-none h-10 px-2 sm:px-3"
            >
              Dokumente
              <span className="ml-1.5 text-[10px] text-slate-400 font-mono">
                {data.documents.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="sources"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 text-xs sm:text-sm text-slate-600 rounded-none h-10 px-2 sm:px-3"
            >
              Quellen
              <span className="ml-1.5 text-[10px] text-slate-400 font-mono">
                {data.citations.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="actions"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 text-xs sm:text-sm text-slate-600 rounded-none h-10 px-2 sm:px-3"
            >
              Aktionen
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="px-5 py-4 min-h-[280px] max-h-[480px] overflow-y-auto bg-slate-50/30">
          <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
            <OverviewTab data={data} />
          </TabsContent>
          <TabsContent value="timeline" className="mt-0 focus-visible:outline-none">
            <TimelineTab data={data} />
          </TabsContent>
          <TabsContent value="documents" className="mt-0 focus-visible:outline-none">
            <DocumentsTab data={data} />
          </TabsContent>
          <TabsContent value="sources" className="mt-0 focus-visible:outline-none">
            <SourcesTab data={data} />
          </TabsContent>
          <TabsContent value="actions" className="mt-0 focus-visible:outline-none">
            <ActionsTab data={data} onAction={onAction} />
          </TabsContent>
        </div>
      </Tabs>
    </article>
  );
}

// Re-export the chip for ad-hoc usage.
export { CitationChip };
