/**
 * Helpers für inconsistente API-Response-Shapes.
 *
 * Viele HELIX endpoints liefern entweder:
 *   1. ein rohes Array  → `T[]`
 *   2. eine Hülle       → `{ data: T[], meta?: {...} }`
 *   3. einen count      → `{ count: number, ... }`
 *
 * `extractArray` normalisiert Fall 1 + 2 zu `T[]`.
 */

export type ApiEnvelope<T> = T[] | { data?: T[]; items?: T[]; results?: T[] };

/**
 * Liefert immer ein Array, auch wenn die Antwort ein leeres Objekt ist.
 * Behandelt null/undefined defensiv (gibt [] zurück).
 */
export function extractArray<T>(resp: ApiEnvelope<T> | null | undefined): T[] {
  if (resp == null) return [];
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp.data)) return resp.data;
  if (Array.isArray(resp.items)) return resp.items;
  if (Array.isArray(resp.results)) return resp.results;
  return [];
}

/**
 * Liefert `n` (oder fallback), wenn die Antwort ein Number ist oder ein Object mit `data.length`.
 */
export function extractCount(resp: unknown, fallback = 0): number {
  if (typeof resp === "number") return resp;
  const a = extractArray(resp as any);
  return a.length || fallback;
}
