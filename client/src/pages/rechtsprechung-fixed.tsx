import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Clock, FileText, Scale, Gavel, Download } from "@/components/icons";
import { CaseCard } from '@/components/case/CaseCard';
import { normalizeLegalCase, authorityIcon, impactTone, toneStyle } from '@/lib/caseNormalize';
import type { AnyRecord } from '@/lib/caseNormalize';
import { cn } from '@/lib/utils';

/**
 * Safe date utilities — defenses gegen `decisionDate: {}` und ähnliche
 * invalide Werte aus der Live-DB. Ohne diese Guards rendert die UI den
 * literalen Text "Invalid Date" und Datums-Filter brechen.
 */
function safeDateLike(input: unknown): Date | null {
  if (input === undefined || input === null) return null;
  const raw =
    input instanceof Date
      ? input
      : typeof input === 'string' || typeof input === 'number'
        ? input
        : null;
  const d = new Date(raw as string | number | Date);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Types
interface LegalCase {
  id: string;
  case_number?: string;
  title?: string;
  court?: string;
  jurisdiction?: string;
  decision_date?: string;
  summary?: string;
  content?: string;
  document_url?: string;
  impact_level?: string;
  keywords?: string[];
  source?: string;
}

export default function RechtsprechungFixed() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const queryClient = useQueryClient();

  const { data: legalCases = [], isLoading, error, refetch } = useQuery({
    queryKey: ['legal-cases-fixed'],
    queryFn: async (): Promise<LegalCase[]> => {
      const response = await fetch('/api/legal-cases', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 300000,
    gcTime: 600000,
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ['legal-cases-fixed'] });
      await refetch();
      return { success: true };
    },
  });

  const filteredCases = legalCases.filter((legalCase) => {
    const matchesSearch =
      !searchTerm ||
      legalCase.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      legalCase.court?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesJurisdiction =
      !selectedJurisdiction ||
      selectedJurisdiction === 'all' ||
      legalCase.jurisdiction === selectedJurisdiction;

    const caseDate =
      safeDateLike(legalCase.decision_date) ??
      safeDateLike((legalCase as AnyRecord).decisionDate);
    const matchesDateRange =
      (!startDate || caseDate === null || caseDate >= new Date(startDate)) &&
      (!endDate || caseDate === null || caseDate <= new Date(endDate));

    return matchesSearch && matchesJurisdiction && matchesDateRange;
  });

  const getUniqueJurisdictions = () => {
    const set = new Set<string>();
    legalCases.forEach((c) => {
      if (c.jurisdiction) set.add(c.jurisdiction);
    });
    return Array.from(set);
  };

  const uniqueJurisdictions = getUniqueJurisdictions();

  // High-impact count for stats card.
  const highImpactCount = legalCases.filter((c) => {
    const t = c.impact_level?.toLowerCase();
    return t === 'high' || t === 'critical';
  }).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 via-pink-600 to-rose-700 rounded-2xl shadow-lg">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Legal Intelligence Center</h1>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="px-4 py-2 bg-red-100 text-red-800 rounded-xl text-sm font-semibold flex items-center gap-1">
                <Gavel className="w-4 h-4" />
                Rechtsfälle
              </div>
              <div className="px-4 py-2 bg-pink-100 text-pink-800 rounded-xl text-sm font-semibold flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Gerichtsentscheidungen
              </div>
              <div className="px-4 py-2 bg-rose-100 text-rose-800 rounded-xl text-sm font-semibold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Compliance
              </div>
            </div>
            <p className="text-gray-600 text-lg">
              {legalCases.length} Gerichtsentscheidungen · Klickbaren Tabs pro Fall für Übersicht, Verlauf, Dokumente, Quellen & Aktionen
            </p>
          </div>
        </div>
        <Button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          {syncMutation.isPending ? 'Synchronisiere...' : 'Daten synchronisieren'}
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Fehler beim Laden: {(error as Error).message}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success summary */}
      {!error && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-green-700 text-sm">
              <span>✅ {legalCases.length} Rechtsfälle geladen · {filteredCases.length} sichtbar nach Filter</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            🔍 Suche & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rechtsquelle</label>
              <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Gerichte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Jurisdiktionen</SelectItem>
                  {uniqueJurisdictions.map((jurisdiction) => (
                    <SelectItem key={jurisdiction} value={jurisdiction}>
                      {authorityIcon(jurisdiction)} {jurisdiction}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Startdatum</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Enddatum</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Suche</label>
              <Input
                placeholder="Fall, Gericht oder Entscheidung suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Scale className="w-8 h-8 text-gray-600" />
              <div className="text-2xl font-bold text-gray-900">{filteredCases.length}</div>
            </div>
            <p className="text-sm text-gray-600">Sichtbare Fälle</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <div className="text-2xl font-bold text-yellow-600">{highImpactCount}</div>
            </div>
            <p className="text-sm text-gray-600">High-Impact Fälle</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'border-green-200 bg-green-50/50',
            syncMutation.isPending && 'border-blue-200 bg-blue-50/50'
          )}
        >
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {(() => {
                const t = toneStyle(syncMutation.isPending ? 'blue' : 'emerald');
                return <div className={cn('w-8 h-8 flex items-center justify-center', t.solid)}>✓</div>;
              })()}
              <div
                className={cn(
                  'text-2xl font-bold',
                  syncMutation.isPending ? 'text-blue-600' : 'text-green-600'
                )}
              >
                {syncMutation.isPending ? 'SYNC' : 'OK'}
              </div>
            </div>
            <p className={cn('text-sm', syncMutation.isPending ? 'text-blue-700' : 'text-green-700')}>
              {syncMutation.isPending ? 'Synchronisation läuft' : 'Cache synchron'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Lade Rechtsfälle...</p>
            </CardContent>
          </Card>
        ) : filteredCases.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Rechtsfälle gefunden</h3>
              <p className="text-gray-600">
                {legalCases.length === 0
                  ? 'Keine Daten in der Datenbank verfügbar.'
                  : 'Ihre Suchkriterien ergeben keine Treffer. Versuchen Sie andere Filter.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCases.map((legalCase) => (
            <CaseCard key={legalCase.id} data={normalizeLegalCase(legalCase as AnyRecord)} />
          ))
        )}
      </div>
    </div>
  );
}
