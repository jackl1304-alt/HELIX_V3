import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { fmtDate } from "@/lib/date";
import {
  Brain,
  Sparkles,
  Send,
  Shield,
  FileSearch,
  Loader2,
  ExternalLink,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * FDA Agent Panel — kompakter Inline-Chat im Command Center.
 *
 * Prompted via /api/chat/rag. Zeigt die letzte Antwort des FDA-Agenten
 * mit Citation-Chips (klickbar zu Regulatory-Updates).
 */

interface Citation {
  id?: string | number;
  source?: string;
  title?: string;
  url?: string;
}

interface FdaReply {
  answer?: string;
  response?: string;
  message?: string;
  text?: string;
  citations?: Citation[];
  sources?: Citation[];
  references?: Citation[];
  confidence?: number;
  agent?: string;
  generated_at?: string;
}

const DEFAULT_PROMPTS = [
  "Welche FDA 510(k) Anforderungen gelten für Klasse-III Herzpumpen?",
  "Neueste EMA-Qualifizierung für KI-Medizinprodukte (MDR Annex VIII)",
  "Was ändert sich 2025 in der EU-IVDR für In-vitro-Diagnostika?",
  "Top-3 Risiken: BfArM-Empfehlungen für Software als Medizinprodukt",
];

export function FDAAgentPanel() {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState<{ role: "user" | "agent"; content: string; citations?: Citation[]; ts: string }[]>(
    []
  );

  const askMutation = useMutation({
    mutationFn: async (question: string) => {
      const res = await fetch("/api/chat/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({ question, query: question, agent: "fda" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      return (await res.json()) as FdaReply;
    },
    onSuccess: (data, variables) => {
      const answerText =
        data.answer ?? data.response ?? data.message ?? data.text ?? "Keine Antwort erhalten.";
      const citations =
        data.citations ?? data.sources ?? data.references ?? [];
      setHistory((prev) => [
        ...prev,
        { role: "user", content: variables, ts: new Date().toISOString() },
        {
          role: "agent",
          content: answerText,
          citations,
          ts: data.generated_at ?? new Date().toISOString(),
        },
      ]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) return;
    askMutation.mutate(trimmed);
    setPrompt("");
  };

  const handleSuggestion = (s: string) => {
    setPrompt(s);
    askMutation.mutate(s);
  };

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50/40 via-white to-white overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold flex items-center gap-53">
                HELIX FDA-Agent{" "}
                <span className="px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-medium">
                  Beta
                </span>
              </div>
              <div className="text-[11px] text-violet-100/90 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                RAG · FDA + EMA + BfArM · mit Citations
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="uppercase tracking-wider">live</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {history.length === 0 && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-violet-600" />
              </div>
              <div className="text-sm text-slate-700 leading-relaxed">
                Ich bin der HELIX FDA-Agent. Frag mich zu regulatorischen Anforderungen,
                Zulassungen oder aktuellen Entwicklungen — ich antworte mit Quellen aus
                FDA, EMA, BfArM und der Wissensdatenbank.
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-2">
              {DEFAULT_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSuggestion(p)}
                  disabled={askMutation.isPending}
                  className={cn(
                    "text-left text-xs px-3 py-2.5 rounded-lg border border-slate-200",
                    "bg-white hover:border-violet-300 hover:bg-violet-50/50 transition-all",
                    "text-slate-700 hover:text-slate-900",
                    askMutation.isPending && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <FileSearch className="h-3.5 w-3.5 text-violet-500 inline mr-1 -mt-0.5" />
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {history.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2.5",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {m.role === "agent" && (
                  <div className="h-7 w-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                    <Brain className="h-4 w-4 text-violet-600" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-tr-sm"
                      : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm"
                  )}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                  {m.role === "agent" && m.citations && m.citations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/70">
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1.5">
                        Quellen
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.citations.slice(0, 4).map((c, j) => (
                          <a
                            key={j}
                            href={c.url || "/regulatory-updates"}
                            target={c.url ? "_blank" : undefined}
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-700 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span className="truncate max-w-[160px]">
                              {c.source || c.title || `[${j + 1}]`}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <div
                    className={cn(
                      "mt-1 text-[10px]",
                      m.role === "user" ? "text-violet-100" : "text-slate-400"
                    )}
                  >
                    {fmtDate(m.ts, { mode: "datetime", fallback: "—" })}
                  </div>
                </div>
              </div>
            ))}
            {askMutation.isPending && (
              <div className="flex gap-2.5">
                <div className="h-7 w-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                  <Loader2 className="h-4 w-4 text-violet-600 animate-spin" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm text-slate-500">
                  FDA-Agent durchsucht Wissensdatenbank…
                </div>
              </div>
            )}
            {askMutation.isError && (
              <div className="text-xs text-rose-600 px-2">
                Fehler: {(askMutation.error as Error)?.message ?? "Unbekannt"}
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-3 border-t border-slate-200">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Frage den FDA-Agenten…"
            className="flex-1 text-sm"
            disabled={askMutation.isPending}
            data-testid="fda-agent-input"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!prompt.trim() || askMutation.isPending}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-0 hover:from-violet-700 hover:to-fuchsia-700"
          >
            {askMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
