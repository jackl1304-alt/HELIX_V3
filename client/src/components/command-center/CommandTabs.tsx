import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { fmtDate } from "@/lib/date";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  FileText,
  Scale,
  Globe,
  CheckCircle,
  Database,
  RefreshCw,
  Sparkles,
  Brain,
  ChevronRight,
  AlertTriangle,
  Shield,
  Clock,
  Activity,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { extractArray } from "@/lib/arrayShape";
import { toneOf, type Tone } from "@/lib/colorTokens";
import { FDAAgentPanel } from "./FDAAgentPanel";

/**
 * CommandTabs — 3 Hauptreiter im Command Center.
 *
 * 1. Regulatory Now → Top-Updates, Cases, Approvals mit Click-Through
 * 2. FDA Agent Live → Inline-Chat mit FDA-Agent (HDL Zitations)
 * 3. Operations      → Sync-Health, Datenquellen-Status, AI-Aufgaben
 */

type TabKey = "regulatory" | "agent" | "operations";
const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; hint: string }[] = [
  { key: "regulatory", label: "Regulatorik Live", icon: FileText, hint: "Updates, Cases, Approvals" },
  { key: "agent", label: "FDA-Agent", icon: Sparkles, hint: "Frag die KI" },
  { key: "operations", label: "Operations", icon: Activity, hint: "Sync, Sources, Health" },
];

export function CommandTabs({ defaultTab = "regulatory" as TabKey }) {
  const [active, setActive] = useState<TabKey>(defaultTab);
  const { t } = useLanguage();
  return (
    <Tabs value={active} onValueChange={(v) => setActive(v as TabKey)} className="w-full">
      <div className="flex items-center justify-between mb-3">
        <TabsList className="bg-slate-100/80 p-1 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className={cn(
                  "data-[state=active]:bg-white data-[state=active]:shadow-sm",
                  "rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2",
                  "data-[state=active]:text-slate-900 text-slate-600"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
        <div className="text-[11px] text-slate-400 hidden md:flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded">
            ⌘K
          </kbd>
          <span>Suche</span>
        </div>
      </div>

      <TabsContent value="regulatory" className="mt-0 focus-visible:outline-none">
        <RegulatoryNowTab />
      </TabsContent>
      <TabsContent value="agent" className="mt-0 focus-visible:outline-none">
        <FDAAgentPanel />
      </TabsContent>
      <TabsContent value="operations" className="mt-0 focus-visible:outline-none">
        <OperationsTab />
      </TabsContent>
    </Tabs>
  );
}

/** Tab 1: Regulatorische Highlights */
function RegulatoryNowTab() {
  const { data: updatesResp } = useQuery<any>({
    queryKey: ["/api/regulatory-updates", { limit: 6 }],
    refetchInterval: 60_000,
  });
  const { data: casesResp } = useQuery<any>({
    queryKey: ["/api/legal-cases", { limit: 4 }],
    refetchInterval: 60_000,
  });
  const { data: ongoingResp } = useQuery<any>({
    queryKey: ["/api/ongoing-approvals", { limit: 4 }],
    refetchInterval: 60_000,
  });

  const updates = extractArray<any>(updatesResp);
  const cases = extractArray<any>(casesResp);
  const ongoing = extractArray<any>(ongoingResp);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel
        title="Updates"
        icon={FileText}
        accent="blue"
        href="/regulatory-updates"
        count={updates.length}
      >
        {updates.length === 0 ? (
          <Empty msg="Keine Updates in den letzten 60 Minuten" />
        ) : (
          <ul className="space-y-1.5">
            {updates.slice(0, 5).map((u: any) => (
              <li key={u.id} className="group">
                <Link
                  to="/regulatory-updates"
                  className="flex items-start justify-between gap-2 px-2 py-2 rounded-md hover:bg-blue-50/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-blue-700">
                      {u.title || u.summary}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>{u.region || u.authority || "—"}</span>
                      <span>·</span>
                      <Clock className="h-3 w-3" />
                      <span>{fmtDate(u.published_date ?? u.publishedDate ?? u.date, { fallback: "—" })}</span>
                    </div>
                  </div>
                  {u.priority && (
                    <span
                      className={cn(
                        "shrink-0 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                        (u.priority || "").toLowerCase() === "high" || (u.priority || "").toLowerCase() === "critical"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {u.priority}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title="Rechtsprechung"
        icon={Scale}
        accent="violet"
        href="/legal-cases"
        count={cases.length}
      >
        {cases.length === 0 ? (
          <Empty msg="Keine neuen Fälle" />
        ) : (
          <ul className="space-y-1.5">
            {cases.slice(0, 4).map((c: any) => (
              <li key={c.id} className="group">
                <Link
                  to="/legal-cases"
                  className="block px-2 py-2 rounded-md hover:bg-violet-50/50 transition-colors"
                >
                  <div className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-violet-700">
                    {c.title || c.case_number}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span>{c.court || c.jurisdiction || "—"}</span>
                    <span>·</span>
                    <span>{fmtDate(c.decision_date ?? c.decisionDate, { fallback: "—" })}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title="Laufende Zulassungen"
        icon={CheckCircle}
        accent="purple"
        href="/zulassungen/laufende"
        count={ongoing.length}
      >
        {ongoing.length === 0 ? (
          <Empty msg="Keine offenen Verfahren" />
        ) : (
          <ul className="space-y-1.5">
            {ongoing.slice(0, 4).map((o: any) => (
              <li key={o.id} className="group">
                <Link
                  to="/zulassungen/laufende"
                  className="block px-2 py-2 rounded-md hover:bg-purple-50/50 transition-colors"
                >
                  <div className="text-sm font-medium text-slate-900 line-clamp-1 group-hover:text-purple-700">
                    {o.product_name || o.title || o.applicant || "—"}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span>{o.agency || o.region || "—"}</span>
                    <span>·</span>
                    <span className="capitalize">{o.status || "active"}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

/** Tab 3: Operations / Sync / Health */
function OperationsTab() {
  const { data: stats } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30_000,
  });
  const { data: sourcesResp } = useQuery<any>({
    queryKey: ["/global-sources"],
    refetchInterval: 60_000,
  });
  const { data: insightsResp } = useQuery<any>({
    queryKey: ["/api/ai-insights", { limit: 5 }],
    refetchInterval: 60_000,
  });

  const sources = extractArray<any>(sourcesResp);
  const insights = extractArray<any>(insightsResp);

  const dataHealth = stats?.dataQuality ?? "—";
  const totalSources = sources.length || stats?.activeDataSources || 0;
  const lastSyncAgo = sources[0]?.lastSync ? fmtDate(sources[0].lastSync, { fallback: "—" }) : "—";

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel title="Daten-Gesundheit" icon={Shield} accent="emerald">
        <div className="space-y-3 px-2 py-1">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-mono font-bold text-emerald-700">
              {dataHealth}
            </span>
            <span className="text-[11px] text-slate-500 uppercase tracking-wider">Quality</span>
          </div>
          <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "92%" }} />
          </div>
          <div className="text-xs text-slate-600 space-y-0.5">
            <div className="flex justify-between">
              <span>Aktive Quellen</span>
              <span className="font-mono">{totalSources}</span>
            </div>
            <div className="flex justify-between">
              <span>Letzter Sync</span>
              <span className="font-mono">{lastSyncAgo}</span>
            </div>
          </div>
          <Link
            to="/sync-manager"
            className="inline-flex items-center text-xs font-medium text-emerald-700 hover:text-emerald-800"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Sync-Logs öffnen
            <ChevronRight className="h-3 w-3 ml-1" />
          </Link>
        </div>
      </Panel>

      <Panel title="Datenquellen Health" icon={Database} accent="emerald" href="/global-sources" count={totalSources}>
        {sources.length === 0 ? (
          <Empty msg="Keine Quellen aktiv" />
        ) : (
          <ul className="space-y-1.5">
            {sources.slice(0, 5).map((s: any) => (
              <li key={s.id} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-md hover:bg-slate-50">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full shrink-0",
                      (s.status || "").toLowerCase() === "active" ? "bg-emerald-500" : "bg-slate-300"
                    )}
                  />
                  <span className="text-sm text-slate-900 truncate">{s.name || s.source || "—"}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono uppercase">
                  {s.region || "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Open KI-Aufgaben" icon={Brain} accent="violet" href="/ai-insights" count={insights.length}>
        {insights.length === 0 ? (
          <Empty msg="Keine offenen Insights" />
        ) : (
          <ul className="space-y-1.5">
            {insights.slice(0, 5).map((i: any) => (
              <li key={i.id} className="group">
                <Link
                  to="/ai-insights"
                  className="block px-2 py-2 rounded-md hover:bg-violet-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-violet-700 min-w-0">
                      {i.title || i.summary || i.content?.slice(0, 80)}
                    </div>
                    {i.confidence != null && (
                      <span className="shrink-0 text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {typeof i.confidence === "number" ? `${i.confidence}%` : "—"}
                      </span>
                    )}
                  </div>
                  {i.priority && (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      <span
                        className={cn(
                          "inline-block px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider text-[10px]",
                          (i.priority || "").toLowerCase() === "high"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {i.priority}
                      </span>
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

/** Panel-Wrapper: einheitlicher Card-Look für alle 3 Tabs */
function Panel({
  title,
  icon: Icon,
  accent,
  href,
  count,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: Tone;
  href?: string;
  count?: number;
  children: React.ReactNode;
}) {
  const tc = toneOf(accent);
  const accentClass = cn(
    "h-6 w-6 rounded flex items-center justify-center",
    tc.chip
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className={accentClass}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {typeof count === "number" && count > 0 && (
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {count}
            </span>
          )}
        </div>
        {href && (
          <Link
            to={href}
            className="text-[11px] font-medium text-slate-500 hover:text-slate-900 flex items-center gap-0.5 transition-colors"
          >
            Alle
            <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <div className="p-2">{children}</div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="px-2 py-6 text-center text-xs text-slate-400">
      <AlertTriangle className="h-4 w-4 mx-auto mb-1 opacity-50" />
      {msg}
    </div>
  );
}
