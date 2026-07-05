/**
 * HELIX Command Center Farb-Tokens.
 *
 * Ein einziger Ort, an dem die Akzentfarben für KpiStrip, HelixPulse und
 * CommandTabs definiert sind. Verhindert die vorherige DRY-Verletzung mit
 * drei fast identischen `accentMap`/`severityMap`/`accentClass` Maps.
 */

export type Tone =
  | "blue"
  | "purple"
  | "violet"
  | "emerald"
  | "amber"
  | "rose"
  | "cyan"
  | "slate";

export type Severity = "critical" | "high" | "normal" | "info" | "ai";

export interface ToneClasses {
  /** Linker Akzentstrich in der KPI-Card */
  bar: string;
  /** Klar lesbare Textfarbe für Zahlen */
  text: string;
  /** Ringfarbe bei hover/focus */
  ring: string;
  /** Badge / Chip Hintergrund + Text */
  chip: string;
  /** Subtile Hover-Glow */
  glow: string;
  /** Farbiger Hintergrund-Punkt für "live"-Indikatoren */
  dot: string;
}

const TONE_TABLE: Record<Tone, ToneClasses> = {
  blue: {
    bar:   "bg-blue-500",
    text:  "text-blue-700",
    ring:  "ring-blue-500/30",
    chip:  "bg-blue-100 text-blue-700",
    glow:  "from-blue-500/10",
    dot:   "bg-blue-500",
  },
  purple: {
    bar:   "bg-purple-500",
    text:  "text-purple-700",
    ring:  "ring-purple-500/30",
    chip:  "bg-purple-100 text-purple-700",
    glow:  "from-purple-500/10",
    dot:   "bg-purple-500",
  },
  violet: {
    bar:   "bg-violet-500",
    text:  "text-violet-700",
    ring:  "ring-violet-500/30",
    chip:  "bg-violet-100 text-violet-700",
    glow:  "from-violet-500/10",
    dot:   "bg-violet-500",
  },
  emerald: {
    bar:   "bg-emerald-500",
    text:  "text-emerald-700",
    ring:  "ring-emerald-500/30",
    chip:  "bg-emerald-100 text-emerald-700",
    glow:  "from-emerald-500/10",
    dot:   "bg-emerald-500",
  },
  amber: {
    bar:   "bg-amber-500",
    text:  "text-amber-700",
    ring:  "ring-amber-500/30",
    chip:  "bg-amber-100 text-amber-700",
    glow:  "from-amber-500/10",
    dot:   "bg-amber-500",
  },
  rose: {
    bar:   "bg-rose-500",
    text:  "text-rose-700",
    ring:  "ring-rose-500/30",
    chip:  "bg-rose-100 text-rose-700",
    glow:  "from-rose-500/10",
    dot:   "bg-rose-500",
  },
  cyan: {
    bar:   "bg-cyan-500",
    text:  "text-cyan-700",
    ring:  "ring-cyan-500/30",
    chip:  "bg-cyan-100 text-cyan-700",
    glow:  "from-cyan-500/10",
    dot:   "bg-cyan-500",
  },
  slate: {
    bar:   "bg-slate-500",
    text:  "text-slate-700",
    ring:  "ring-slate-500/30",
    chip:  "bg-slate-100 text-slate-700",
    glow:  "from-slate-500/10",
    dot:   "bg-slate-400",
  },
};

export function toneOf(t: Tone): ToneClasses {
  return TONE_TABLE[t];
}

/** Severity-Defaults für Pulse (Critical → rose-500, AI → violet-500, …). */
export function severityTone(s: Severity): ToneClasses {
  switch (s) {
    case "critical": return TONE_TABLE.rose;
    case "high":     return TONE_TABLE.amber;
    case "normal":   return TONE_TABLE.blue;
    case "info":     return TONE_TABLE.slate;
    case "ai":       return TONE_TABLE.violet;
    default:         return TONE_TABLE.slate;
  }
}

export function severityLabel(s: Severity): string {
  switch (s) {
    case "critical": return "Kritisch";
    case "high":     return "Hoch";
    case "normal":   return "Update";
    case "info":     return "Info";
    case "ai":       return "KI-Agent";
    default:         return s;
  }
}
