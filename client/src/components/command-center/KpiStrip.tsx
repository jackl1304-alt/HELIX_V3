import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  FileText,
  Scale,
  CheckCircle,
  Brain,
  Database,
  Globe,
  Sparkles,
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { extractArray } from "@/lib/arrayShape";
import { toneOf, type Tone } from "@/lib/colorTokens";

/**
 * KPI-Strip für das Helix Command Center.
 *
 * 8 Cards horizontal. Jede Karte:
 *   - Akzentfarbe (links) je Kategorie
 *   - Große Zahl (font-mono tabularnums)
 *   - Delta vs. letzte Woche (TrendingUp/Down Pfeil)
 *   - Click-through zum Tab in der Command-Grid
 *
 * Daten werden alle 30s neu geladen (`refetchInterval`).
 */
interface KpiDatum {
  label: string;
  value: number;
  delta?: number; // % Veränderung vs. letzte Periode
  href: string;
  accent: Tone;
  loading?: boolean;
  /** Flash-Indikator: 'pulse' für neue Items, 'alert' für kritische Schwellen */
  severity?: "ok" | "warn" | "alert";
  hint?: string;
}

const formatNumber = (n: number | undefined) => {
  if (n == null || isNaN(n)) return "—";
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
};

export function KpiStrip({ className }: { className?: string }) {
  // Stat-Endpoint: einmal für die Header-KPIs (Live = 30s).
  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  // Spezielle Endpoints, die Frontpage-KPIs erweitern.
  const { data: ongoing } = useQuery<any>({
    queryKey: ["/api/ongoing-approvals"],
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const { data: insights } = useQuery<any>({
    queryKey: ["/api/ai-insights"],
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const { data: cases } = useQuery<any>({
    queryKey: ["/api/legal-cases"],
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const { data: patents } = useQuery<any>({
    queryKey: ["/api/patents"],
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
  const { data: updates } = useQuery<any>({
    queryKey: ["/api/regulatory-updates", { limit: 50 }],
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const criticalUpdates = extractArray<any>(updates).filter(
    (u: any) => {
      const p = (u.priority || "").toLowerCase();
      return p === "critical" || p === "high";
    }
  ).length;

  const data: KpiDatum[] = [
    {
      label: "Reg. Updates 7d",
      value: stats?.recentUpdates ?? 0,
      delta: stats?.recentUpdatesDelta ?? undefined,
      href: "/regulatory-updates",
      accent: "blue",
    },
    {
      label: "Kritisch",
      value: criticalUpdates,
      delta: undefined,
      href: "/regulatory-updates?priority=high",
      accent: criticalUpdates > 5 ? "rose" : "amber",
      severity: criticalUpdates > 5 ? "alert" : criticalUpdates > 0 ? "warn" : "ok",
    },
    {
      label: "Laufende Zulassungen",
      value: extractArray<any>(ongoing).length,
      href: "/zulassungen/laufende",
      accent: "purple",
    },
    {
      label: "Rechtsfälle",
      value: extractArray<any>(cases).length || (stats?.totalLegalCases ?? 0),
      href: "/legal-cases",
      accent: "violet",
    },
    {
      label: "Patente 30d",
      value: extractArray<any>(patents).length || (stats?.totalPatents ?? 0),
      href: "/patents",
      accent: "cyan",
    },
    {
      label: "KI-Insights open",
      value: extractArray<any>(insights).length,
      href: "/ai-insights",
      accent: "violet",
      severity: "ok",
    },
    {
      label: "Datenquellen",
      value: stats?.activeDataSources ?? 0,
      href: "/global-sources",
      accent: "emerald",
      severity: (stats?.activeDataSources ?? 0) > 0 ? "ok" : "alert",
    },
    {
      label: "Gesamt-Updates",
      value: stats?.totalUpdates ?? 0,
      href: "/regulatory-updates",
      accent: "slate",
    },
  ];

  return (
    <div
      className={cn(
        "grid gap-2 sm:gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-8",
        className
      )}
      role="list"
      aria-label="Helix Command Center KPIs"
    >
      {data.map((kpi) => (
        <KpiCard key={kpi.label} kpi={kpi} loading={statsLoading} />
      ))}
    </div>
  );
}

function KpiCard({ kpi, loading }: { kpi: KpiDatum; loading: boolean }) {
  const accent = toneOf(kpi.accent);

  return (
    <Link
      to={kpi.href}
      role="listitem"
      className={cn(
        "group relative block rounded-xl border border-slate-200 bg-white p-3 sm:p-4 overflow-hidden",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-300",
        accent.ring,
        "focus:outline-none focus:ring-2 focus:ring-offset-1"
      )}
      aria-label={`${kpi.label}: ${formatNumber(loading ? undefined : kpi.value)}`}
    >
      {/* Akzent-Bar (links) */}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-1.5",
          accent.bar
        )}
      />

      {/* Severity pulse indicator (oben rechts) */}
      {kpi.severity && kpi.severity !== "ok" && (
        <span
          aria-hidden
          className={cn(
            "absolute right-2 top-2 inline-flex h-2 w-2 rounded-full",
            kpi.severity === "alert" ? "bg-rose-500 animate-pulse" : "bg-amber-500"
          )}
        />
      )}

      {/* Label */}
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 truncate">
        {kpi.label}
      </div>

      {/* Big number */}
      <div className="mt-1 flex items-baseline gap-2">
        <div
          className={cn(
            "font-mono font-bold text-2xl sm:text-3xl leading-none tabular-nums text-slate-900",
            loading && "text-slate-400"
          )}
        >
          {loading ? "—" : formatNumber(kpi.value)}
        </div>
        {kpi.delta != null && !loading && (
          <div
            className={cn(
              "inline-flex items-center text-[11px] font-medium",
              kpi.delta >= 0 ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {kpi.delta >= 0 ? (
              <TrendingUp className="h-3 w-3 mr-0.5" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-0.5" />
            )}
            {Math.abs(kpi.delta).toFixed(1)}%
          </div>
        )}
      </div>

      {/* Hover-Hinweis */}
      {kpi.hint && (
        <div className="mt-1 text-[11px] text-slate-400 truncate">{kpi.hint}</div>
      )}

      {/* Subtle gradient on hover */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-1 -z-10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity bg-gradient-to-br",
          accent.glow,
          "to-transparent"
        )}
      />
    </Link>
  );
}
