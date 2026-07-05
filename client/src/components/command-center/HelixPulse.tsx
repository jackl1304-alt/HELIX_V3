import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { fmtDate } from "@/lib/date";
import {
  Activity,
  AlertTriangle,
  Clock,
  FileText,
  Sparkles,
  Globe,
  ChevronRight,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { extractArray } from "@/lib/arrayShape";
import { severityTone, severityLabel, type Severity } from "@/lib/colorTokens";

/**
 * Helix Pulse = horizontaler Live-Stream der letzten regulatorischen Events.
 *
 * Severity-Codierung:
 *  - critical (rose-500)  → FDA Warning Letter / Class I Recall / Sicherheitsmangel
 *  - high     (amber-500) → High-Priority Update, MDR-Anforderung
 *  - normal   (blue-500)  → Standards, Guidance, Normale Updates
 *  - info     (slate-400)  → Newsletter, Blog, neutrale Quellen
 *  - ai       (violet-500) → KI-Insights / FDA Agent markiert
 */

interface PulseEvent {
  id: string;
  severity: Severity;
  type: "update" | "case" | "approval" | "insight" | "patent" | "draft";
  title: string;
  meta?: string;
  source?: string;
  href: string;
  ts?: string | null;
}

const PRIORITY_TO_SEVERITY = (prio?: string): Severity => {
  const p = (prio || "").toLowerCase();
  if (p === "critical") return "critical";
  if (p === "high" || p === "hoch") return "high";
  if (p === "medium" || p === "normal") return "normal";
  return "info";
};

export function HelixPulse({ limit = 20 }: { limit?: number }) {
  // Wir laden 4 parallele Streams und mergen zu einem einzigen Timeline.
  const { data: updatesResp } = useQuery<any>({
    queryKey: ["/api/regulatory-updates", { limit }],
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const { data: insightsResp } = useQuery<any>({
    queryKey: ["/api/ai-insights", { limit: 8 }],
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const { data: ongoingResp } = useQuery<any>({
    queryKey: ["/api/ongoing-approvals", { limit: 8 }],
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const { data: patentsResp } = useQuery<any>({
    queryKey: ["/api/patents", { limit: 6 }],
    refetchInterval: 120_000,
    staleTime: 60_000,
  });

  const events = useMemo<PulseEvent[]>(() => {
    const arr: PulseEvent[] = [];
    const updates = extractArray<any>(updatesResp);
    for (const u of updates.slice(0, limit)) {
      const sev = PRIORITY_TO_SEVERITY(u.priority);
      const isCritical =
        /class\s*i|recall|warning|mdr/i.test(u.title || "") && sev === "high";
      arr.push({
        id: `u-${u.id ?? Math.random()}`,
        severity: isCritical ? "critical" : sev,
        type: "update",
        title: u.title || u.summary || "Update",
        meta: u.region || u.authority,
        source: u.source,
        href: "/regulatory-updates",
        ts: u.published_date ?? u.publishedDate ?? u.date ?? null,
      });
    }
    const insights = extractArray<any>(insightsResp);
    for (const i of insights.slice(0, 4)) {
      arr.push({
        id: `ai-${i.id ?? Math.random()}`,
        severity: "ai",
        type: "insight",
        title: i.title || i.summary || "Insight",
        meta: `Confidence ${i.confidence ?? "—"}%`,
        href: "/ai-insights",
        ts: i.createdAt ?? i.generated_at ?? null,
      });
    }
    const ongoing = extractArray<any>(ongoingResp);
    for (const o of ongoing.slice(0, 4)) {
      arr.push({
        id: `ap-${o.id ?? Math.random()}`,
        severity: (o.status || "").toLowerCase().includes("critical") ? "critical" : "normal",
        type: "approval",
        title: o.product_name ?? o.title ?? "Zulassung",
        meta: o.agency ?? o.region ?? o.status,
        href: "/zulassungen/laufende",
        ts: o.submission_date ?? o.createdAt ?? null,
      });
    }
    const patents = extractArray<any>(patentsResp);
    for (const p of patents.slice(0, 3)) {
      arr.push({
        id: `p-${p.id ?? Math.random()}`,
        severity: "info",
        type: "patent",
        title: p.title || p.patentNumber || "Patent",
        meta: p.jurisdiction || p.region,
        href: "/patents",
        ts: p.publicationDate ?? p.publishedDate ?? null,
      });
    }
    // Neueste zuerst
    arr.sort((a, b) => {
      const ta = a.ts ? new Date(a.ts).getTime() : 0;
      const tb = b.ts ? new Date(b.ts).getTime() : 0;
      return tb - ta;
    });
    return arr.slice(0, limit);
  }, [updatesResp, insightsResp, ongoingResp, patentsResp, limit]);

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-6 text-center">
        <Activity className="h-6 w-6 text-slate-400 mx-auto mb-2" />
        <div className="text-sm text-slate-500">
          Live-Stream wird geladen… Erste Events erscheinen in Sekunden.
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-start gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin">
        {events.map((ev, idx) => {
          const sev = severityTone(ev.severity);
          const Icon =
            ev.severity === "critical" || ev.severity === "high"
              ? AlertTriangle
              : ev.severity === "ai"
              ? Sparkles
              : ev.severity === "info"
              ? Globe
              : FileText;
          return (
            <Link
              key={ev.id}
              to={ev.href}
              className={cn(
                "group snap-start shrink-0 w-72 sm:w-80 rounded-lg border bg-white p-3",
                "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200",
                "border-slate-200 hover:border-slate-300",
                sev.ring,
                idx === 0 && ev.severity === "critical" && "ring-2"
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded",
                    sev.chip
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      sev.dot,
                      ev.severity === "critical" && "animate-pulse"
                    )}
                  />
                  {severityLabel(ev.severity)}
                </span>
                <Icon className={cn("h-3.5 w-3.5",
                  ev.severity === "critical" && "text-rose-500",
                  ev.severity === "high" && "text-amber-500",
                  ev.severity === "ai" && "text-violet-500"
                )} />
              </div>
              <div className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
                {ev.title}
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate">
                  {ev.meta || ev.source || "—"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {ev.ts ? fmtDate(ev.ts, { fallback: "—" }) : "—"}
                </span>
              </div>
              <div className="mt-1.5 flex items-center text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors">
                <ChevronRight className="h-3 w-3" />
                <span>Details</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
