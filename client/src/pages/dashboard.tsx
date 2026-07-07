import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { fmtDate } from "@/lib/date";
import { extractArray } from "@/lib/arrayShape";
import {
  Search,
  Sparkles,
  Mail,
  Database,
  Globe,
  Book,
  BarChart3,
  ChevronRight,
  RefreshCw,
} from "@/components/icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KpiStrip } from "@/components/command-center/KpiStrip";
import { HelixPulse } from "@/components/command-center/HelixPulse";
import { CommandTabs } from "@/components/command-center/CommandTabs";
import { cn } from "@/lib/utils";

/**
 * Helix Command Center — die neue Hauptseite (`/`, `/dashboard`).
 *
 * Drei-Schichten-Informationsarchitektur:
 *   1. KPI-Strip          — 8 Kennzahlen oben, gradient accents, refetch 30s
 *   2. Helix Pulse        — horizontaler Live-Stream der Events
 *   3. Command Tabs       — Regulatory Now / FDA Agent / Operations
 *
 * Plus: Quick-Actions Grid (für 100 Power-User), Command-Search.
 */
export default function Dashboard() {
  const { t } = useLanguage();
  const fallbackDate = t('time.today');
  const [, setLocation] = useLocation();

  // Health-Stats für die Quick-Action-Tiles
  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 60_000,
  });
  const { data: insightsResp } = useQuery<any>({
    queryKey: ["/api/ai-insights", { limit: 1 }],
  });
  const insightsCount = extractArray(insightsResp).length;

  return (
    <div className="space-y-4">
      {/* Top-Bar: Brand + Suche */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-blue-50/30 to-violet-50/30 p-4 sm:p-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span className="inline-block h-7 w-7 rounded-lg bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-600 shadow-md" />
            {t("dashboard.title")}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {fmtDate(new Date().toISOString(), {
              mode: "long",
              fallback: fallbackDate,
            })}
            {" · "}
            <span className="font-mono text-slate-600">
              {stats?.activeDataSources ?? 0}
            </span>{" "}
            {t('dashboard.activeQuellen')} ·{" "}
            <span className="font-mono text-slate-600">
              {stats?.totalUpdates ?? 0}
            </span>{" "}
            {t('dashboard.updatesTotal')}
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = (e.currentTarget.elements.namedItem("globalSearch") as HTMLInputElement)
              ?.value?.trim();
            if (!input) return;
            // Intelligente Suche: FDA-Fragen shortcutten direkt in den Agenten.
            const fdaHint = /\b(fda|ema|bfarm|mdr|ivdr|510\(k\)|k-number|iso|iec|zulass|warnung|recall)/i.test(input);
            const target = fdaHint
              ? `/chat?agent=fda&q=${encodeURIComponent(input)}`
              : `/intelligent-search?q=${encodeURIComponent(input)}`;
            setLocation(target);
          }}
          className="flex items-center gap-2 flex-1 max-w-md"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              name="globalSearch"
              placeholder={t('dashboard.searchBarPlaceholder')}
              className="pl-9 pr-3 h-9 text-sm"
              data-testid="command-center-search"
            />
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-500">
            {t('dashboard.searchHint')}
          </kbd>
        </form>
      </div>

      {/* KPI Strip — alles auf einen Blick */}
      <KpiStrip />

      {/* Helix Pulse — Live Activity Stream */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {t('dashboard.helixPulse')}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t('dashboard.liveStreamEvents')} · {t('dashboard.openAiTasks').replace('{{count}}', String(insightsCount))}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-slate-600 hover:text-slate-900">
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            {t('dashboard.refresh')}
          </Button>
        </div>
        <HelixPulse limit={18} />
      </Card>

      {/* Command Tabs — Regulatory | FDA-Agent | Operations */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-900">{t('dashboard.commandGrid')}</h2>
          <span className="text-[11px] text-slate-400">
            {t('dashboard.moreDetailsTabs')}
          </span>
        </div>
        <CommandTabs defaultTab="regulatory" />
      </div>

      {/* Quick Actions — für die 100 Power-User */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-violet-500" />
              {t("dashboard.quickActions")}
            </h2>
            <p className="text-[11px] text-slate-500">
              {t('dashboard.directAccessWorkflows')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {[
            {
              href: "/data-collection",
              icon: Database,
              label: t("dashboard.dataSourcesSync"),
              sub: t("dashboard.fdaEmaWho"),
              tone: "orange",
            },
            {
              href: "/newsletter-admin",
              icon: Mail,
              label: t("dashboard.newsletterSync"),
              sub: t("dashboard.medtechSources"),
              tone: "blue",
            },
            {
              href: "/knowledge-base",
              icon: Book,
              label: t("knowledge.title"),
              sub: t('dashboard.articles'),
              tone: "emerald",
            },
            {
              href: "/newsletter-manager",
              icon: Mail,
              label: t("dashboard.newsletter"),
              sub: t("dashboard.createNewIssue"),
              tone: "purple",
            },
            {
              href: "/analytics",
              icon: BarChart3,
              label: t("nav.analytics"),
              sub: t("dashboard.advancedTrends"),
              tone: "rose",
            },
            {
              href: "/patents",
              icon: Globe,
              label: t("nav.globalPatents"),
              sub: t('dashboard.usptoEpoWipo'),
              tone: "cyan",
            },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.href}
                to={a.href}
                className={cn(
                  "group block rounded-lg border border-slate-200 bg-white p-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center mb-2",
                  a.tone === "orange" && "bg-orange-100 text-orange-700",
                  a.tone === "blue" && "bg-blue-100 text-blue-700",
                  a.tone === "emerald" && "bg-emerald-100 text-emerald-700",
                  a.tone === "purple" && "bg-purple-100 text-purple-700",
                  a.tone === "rose" && "bg-rose-100 text-rose-700",
                  a.tone === "cyan" && "bg-cyan-100 text-cyan-700"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  {a.label}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                  {a.sub}
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
