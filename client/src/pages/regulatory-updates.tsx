import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CaseCard } from "@/components/case/CaseCard";
import { normalizeRegulatoryUpdate, type AnyRecord } from "@/lib/caseNormalize";

// Local interface matches what the live API actually returns (see Phase-2 recon).
// Schema deckt ~40 Felder ab, aber die Live-API liefert nur eine Teilmenge —
// der Normalizer ist defensiv und fällt auf "—" / leere State sauber zurück.

// Codex-Style Generator: Estimiere Schlüsselzahl für Identifizierung
function isNewUpdate(dateString?: string): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  const now = new Date();
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

interface RegulatoryUpdate {
  id: string;
  title: string;
  summary?: string | null;
  content?: string | null;
  url?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  source_description?: string | null;
  source_country?: string | null;
  publishedAt?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  tags?: string[] | null;
  isActive?: boolean;
  source?: string | null;
  // Optional fields (may be empty from API but kept for schema compatibility).
  jurisdiction?: string | null;
  priority?: number | null;
  source_id?: string | null;
  sourceId?: string | null;
}

export default function RegulatoryUpdates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const { t, language } = useLanguage();

  const { data: updates = [], isLoading, error } = useQuery<RegulatoryUpdate[]>({
    queryKey: ["/api/regulatory-updates"],
    queryFn: async (): Promise<RegulatoryUpdate[]> => {
      const response = await fetch("/api/regulatory-updates", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 60_000,
  });

  const filteredUpdates = updates.filter((update) => {
    const matchesSearch =
      !searchQuery ||
      update.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.source_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.source_country?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion =
      !regionFilter ||
      update.source_country === regionFilter ||
      update.jurisdiction === regionFilter;

    const matchesPriority =
      !priorityFilter ||
      (priorityFilter === "high" && (update.priority ?? 0) >= 3) ||
      (priorityFilter === "normal" && (update.priority ?? 0) < 3);

    const matchesType =
      !typeFilter ||
      update.source_description?.toLowerCase().includes(typeFilter.toLowerCase()) ||
      update.source?.toLowerCase().includes(typeFilter.toLowerCase());

    return matchesSearch && matchesRegion && matchesPriority && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Regulatorische Updates
              </h1>
              <p className="text-gray-600 text-lg">
                {updates.length} aktive Quellen · klickbare Tabs pro Update (Übersicht · Verlauf · Dokumente · Quellen · Aktionen)
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('regulatory.searchUpdates') ?? "Update, Quelle oder Land suchen…"}
                  className="pl-3"
                />
              </div>
              <div className="text-sm text-gray-600">
                {filteredUpdates.length} von {updates.length} sichtbar
                {language === 'de' ? '' : ` (${language})`}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <select
                className="px-3 py-2 border rounded-md text-sm"
                value={regionFilter ?? ""}
                onChange={(e) => setRegionFilter(e.target.value || null)}
              >
                <option value="">Alle Regionen</option>
                <option value="US">US (FDA)</option>
                <option value="EU">EU (EMA / MDR)</option>
                <option value="DE">DE (BfArM)</option>
                <option value="UK">UK (MHRA)</option>
                <option value="JP">JP (PMDA)</option>
                <option value="CN">CN (NMPA)</option>
              </select>

              <select
                className="px-3 py-2 border rounded-md text-sm"
                value={priorityFilter ?? ""}
                onChange={(e) => setPriorityFilter(e.target.value || null)}
              >
                <option value="">Alle Prioritäten</option>
                <option value="high">Hoch (priority ≥ 3)</option>
                <option value="normal">Normal</option>
              </select>

              <select
                className="px-3 py-2 border rounded-md text-sm"
                value={typeFilter ?? ""}
                onChange={(e) => setTypeFilter(e.target.value || null)}
              >
                <option value="">Alle Typen</option>
                <option value="regulation">Regulation</option>
                <option value="guidance">Guidance</option>
                <option value="standard">Standard</option>
                <option value="approval">Approval / 510(k)</option>
                <option value="alert">Safety Alert</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center"
                onClick={() => {
                  setRegionFilter(null);
                  setPriorityFilter(null);
                  setTypeFilter(null);
                  setSearchQuery("");
                }}
              >
                Filter zurücksetzen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error state */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-2 text-red-700">
              Fehler beim Laden: {(error as Error).message}
            </CardContent>
          </Card>
        )}

        {/* Updates list — each entry renders a <CaseCard> */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Lade regulatorische Updates…</p>
            </div>
          </div>
        ) : filteredUpdates.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-3xl">📋</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Keine Updates gefunden
              </h3>
              <p className="text-gray-500">
                {updates.length === 0
                  ? "Es liegen aktuell keine Updates vor."
                  : "Versuchen Sie andere Filter oder Suchbegriffe."}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredUpdates.map((update) => (
              <CaseCard
                key={update.id}
                data={normalizeRegulatoryUpdate(update as AnyRecord)}
              />
            ))}

            {/* Hidden screen-reader hint: count neue Updates */}
            <span className="sr-only" aria-live="polite">
              {filteredUpdates.filter((u) => isNewUpdate(u.publishedAt ?? u.created_at)).length}{" "}
              neue Updates in den letzten 7 Tagen.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
