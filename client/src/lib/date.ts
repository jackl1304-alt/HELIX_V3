/**
 * Zentrale Datums-Helper für die HELIX-UI.
 *
 * Verhindert "Invalid Date"-Literale in der Oberfläche, wenn:
 *   - ein Feld null/undefined ist
 *   - ein Feld ein leeres Objekt {} ist (von Drizzle ohne ISO-Date → JSON-stringified)
 *   - ein Feld ein nicht-parsebarer String ist
 *   - ein Feld ein ungültiges Date-Objekt ist (Invalid Date)
 *
 * Wird von customer-*, admin-customers, laufende-zulassungen, regulatory, legal etc. genutzt.
 */

type DateInput = string | number | Date | null | undefined | object;

const FALLBACK_DASH = "—";

/**
 * Wandelt beliebigen Input in ein gültiges Date oder null.
 * Niemals wirft eine Exception, niemals gibt Invalid Date zurück.
 */
export function safeDateLike(input: DateInput): Date | null {
  if (input == null) return null;
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input;
  }
  if (typeof input === "number") {
    const d = new Date(input);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (trimmed === "" || trimmed === "Invalid Date") return null;
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  // Objekte (z. B. {}), Arrays, booleans → kein gültiges Datum
  if (typeof input === "object") {
    // Defensiv: manche APIs liefern { iso: '...' } oder { date: '...' }
    const obj = input as Record<string, unknown>;
    const nested =
      (typeof obj.iso === "string" && obj.iso) ||
      (typeof obj.date === "string" && obj.date) ||
      (typeof obj.value === "string" && obj.value);
    if (typeof nested === "string") return safeDateLike(nested);
    return null;
  }
  return null;
}

/**
 * Liefert ein lokalisierbares Datum (de-DE) oder Fallback.
 *
 * Modi:
 *   "short"   → "13.07.2025"           (Default; kompakt für Tabellen)
 *   "long"    → "13. Juli 2025"         (ausgeschriebener Monat, z. B. Wissensdatenbank-Listen)
 *   "datetime" → "13.07.2025, 14:35"   (mit Uhrzeit)
 *   "iso"     → "2025-07-13"           (maschinenlesbar)
 */
export function fmtDate(
  input: DateInput,
  options: { fallback?: string; mode?: "short" | "long" | "datetime" | "iso"; locale?: string } = {}
): string {
  const { fallback = FALLBACK_DASH, mode = "short", locale = "de-DE" } = options;
  const d = safeDateLike(input);
  if (!d) return fallback;
  if (mode === "iso") {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  if (mode === "long") {
    return d.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  if (mode === "datetime") {
    return d.toLocaleString(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  // "short"
  return d.toLocaleDateString(locale);
}

/**
 * Liefert ein relatives Datum ("vor 3 Tagen", "gestern", "heute", "in 2 Wochen")
 * oder fmtDate(input), wenn das Datum weiter in der Vergangenheit/Zukunft liegt.
 */
export function fmtRelative(input: DateInput, fallback = FALLBACK_DASH): string {
  const d = safeDateLike(input);
  if (!d) return fallback;
  const diffMs = d.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const rtf = new Intl.RelativeTimeFormat("de-DE", { numeric: "auto" });
  if (Math.abs(diffDays) <= 14) {
    return rtf.format(diffDays, "day");
  }
  return fmtDate(d);
}
