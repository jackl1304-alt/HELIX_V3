import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Database, Globe, DollarSign } from 'lucide-react';

/**
 * Data Quality Dashboard - Visual representation of data coverage
 * Zeigt die Abdeckung vor/nach Aktivierung aller Quellen
 */

export function DataQualityDashboard() {
  const currentMetrics = {
    totalSources: 4,
    totalItems: 3890,
    coverage: 2,
    byFunction: [
      { name: 'Regulatory Updates', items: 2325, sources: 1, coverage: 5 },
      { name: 'Legal Cases', items: 70, sources: 2, coverage: 0.8 },
      { name: 'Patents', items: 0, sources: 0, coverage: 0 },
      { name: 'Knowledge Base', items: 0, sources: 0, coverage: 0 },
      { name: 'Standards', items: 0, sources: 0, coverage: 0 },
      { name: 'Clinical Trials', items: 0, sources: 0, coverage: 0 },
      { name: 'Adverse Events', items: 930, sources: 1, coverage: 5 },
      { name: 'Market Data', items: 0, sources: 0, coverage: 0 },
    ]
  };

  const projectedMetrics = {
    phase1: {
      totalSources: 13,
      totalItems: 1654395,
      coverage: 30,
      byFunction: [
        { name: 'Regulatory Updates', items: 4325, sources: 8, coverage: 15 },
        { name: 'Legal Cases', items: 70, sources: 2, coverage: 0.8 },
        { name: 'Patents', items: 650000, sources: 5, coverage: 80 },
        { name: 'Knowledge Base', items: 1000000, sources: 5, coverage: 80 },
        { name: 'Standards', items: 0, sources: 0, coverage: 0 },
        { name: 'Clinical Trials', items: 0, sources: 0, coverage: 0 },
        { name: 'Adverse Events', items: 930, sources: 1, coverage: 5 },
        { name: 'Market Data', items: 0, sources: 0, coverage: 0 },
      ]
    },
    phase2: {
      totalSources: 19,
      totalItems: 1954395,
      coverage: 50,
      byFunction: [
        { name: 'Regulatory Updates', items: 4325, sources: 8, coverage: 15 },
        { name: 'Legal Cases', items: 100070, sources: 5, coverage: 30 },
        { name: 'Patents', items: 650000, sources: 5, coverage: 80 },
        { name: 'Knowledge Base', items: 1000000, sources: 5, coverage: 80 },
        { name: 'Standards', items: 0, sources: 0, coverage: 0 },
        { name: 'Clinical Trials', items: 100000, sources: 2, coverage: 50 },
        { name: 'Adverse Events', items: 100000, sources: 7, coverage: 50 },
        { name: 'Market Data', items: 0, sources: 0, coverage: 0 },
      ]
    },
    phase3: {
      totalSources: 26,
      totalItems: 2034395,
      coverage: 80,
      byFunction: [
        { name: 'Regulatory Updates', items: 4325, sources: 8, coverage: 15 },
        { name: 'Legal Cases', items: 100070, sources: 5, coverage: 30 },
        { name: 'Patents', items: 650000, sources: 5, coverage: 80 },
        { name: 'Knowledge Base', items: 1000000, sources: 5, coverage: 80 },
        { name: 'Standards', items: 30000, sources: 4, coverage: 70 },
        { name: 'Clinical Trials', items: 100000, sources: 2, coverage: 50 },
        { name: 'Adverse Events', items: 100000, sources: 7, coverage: 50 },
        { name: 'Market Data', items: 50000, sources: 3, coverage: 30 },
      ]
    }
  };

  const BarChart = ({ items, maxItems, label, sources }: { items: number; maxItems: number; label: string; sources: number }) => {
    const percentage = (items / maxItems) * 100;
    const color = items === 0 ? 'bg-gray-300' : percentage < 30 ? 'bg-red-400' : percentage < 60 ? 'bg-yellow-400' : 'bg-green-400';

    return (
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">{label}</span>
          <div className="text-xs text-gray-600">
            {items > 1000 ? `${(items / 1000).toFixed(0)}k` : items} items • {sources} sources
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${color} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Data Quality Dashboard</h1>
        <p className="text-gray-600">Datenabdeckung vor und nach Quellen-Aktivierung</p>
      </div>

      {/* Current State Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aktuelle Quellen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentMetrics.totalSources}</div>
            <p className="text-xs text-gray-600 mt-1">Datenquellen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Daten-Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(currentMetrics.totalItems / 1000).toFixed(0)}k</div>
            <p className="text-xs text-gray-600 mt-1">Insgesamt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Global Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentMetrics.coverage}%</div>
            <p className="text-xs text-gray-600 mt-1">Abdeckung</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="destructive">Unvollständig</Badge>
            <p className="text-xs text-gray-600 mt-2">Aktivierung empfohlen</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Coverage by Function */}
      <Card>
        <CardHeader>
          <CardTitle>Aktuelle Abdeckung nach Funktion</CardTitle>
          <CardDescription>2024-11-24 (4 Quellen aktiv)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentMetrics.byFunction.map((func, idx) => (
            <BarChart
              key={idx}
              label={func.name}
              items={func.items}
              maxItems={1000000}
              sources={func.sources}
            />
          ))}
        </CardContent>
      </Card>

      {/* Phase 1 Projection */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Phase 1: Patents + Knowledge + Internationale Quellen</CardTitle>
          <CardDescription className="text-blue-800">
            {projectedMetrics.phase1.totalSources} Quellen • {(projectedMetrics.phase1.totalItems / 1000000).toFixed(1)}M Items • {projectedMetrics.phase1.coverage}% Coverage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">+425x</div>
              <p className="text-xs text-blue-800">Daten Wachstum</p>
            </div>
            <div className="text-center">
              <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">1-2 Wochen</div>
              <p className="text-xs text-blue-800">Aktivierungszeit</p>
            </div>
            <div className="text-center">
              <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">€0</div>
              <p className="text-xs text-blue-800">API Kosten</p>
            </div>
          </div>

          <div className="space-y-4">
            {projectedMetrics.phase1.byFunction.map((func, idx) => (
              <BarChart
                key={idx}
                label={func.name}
                items={func.items}
                maxItems={1000000}
                sources={func.sources}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phase 2 Projection */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-900">Phase 2: Legal Cases + Clinical Trials Expansion</CardTitle>
          <CardDescription className="text-green-800">
            {projectedMetrics.phase2.totalSources} Quellen • {(projectedMetrics.phase2.totalItems / 1000000).toFixed(1)}M Items • {projectedMetrics.phase2.coverage}% Coverage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">+500x</div>
              <p className="text-xs text-green-800">Daten Wachstum</p>
            </div>
            <div className="text-center">
              <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">2-3 Wochen</div>
              <p className="text-xs text-green-800">Gesamtzeit</p>
            </div>
            <div className="text-center">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">€0</div>
              <p className="text-xs text-green-800">API Kosten</p>
            </div>
          </div>

          <div className="space-y-4">
            {projectedMetrics.phase2.byFunction.map((func, idx) => (
              <BarChart
                key={idx}
                label={func.name}
                items={func.items}
                maxItems={1000000}
                sources={func.sources}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phase 3 Projection */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-purple-900">Phase 3: Standards + Market + Analytics Completion</CardTitle>
          <CardDescription className="text-purple-800">
            {projectedMetrics.phase3.totalSources} Quellen • {(projectedMetrics.phase3.totalItems / 1000000).toFixed(1)}M Items • {projectedMetrics.phase3.coverage}% Coverage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">+520x</div>
              <p className="text-xs text-purple-800">Daten Wachstum</p>
            </div>
            <div className="text-center">
              <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">3-4 Wochen</div>
              <p className="text-xs text-purple-800">Gesamtzeit</p>
            </div>
            <div className="text-center">
              <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">€0*</div>
              <p className="text-xs text-purple-800">API Kosten (optional premium)</p>
            </div>
          </div>

          <div className="space-y-4">
            {projectedMetrics.phase3.byFunction.map((func, idx) => (
              <BarChart
                key={idx}
                label={func.name}
                items={func.items}
                maxItems={1000000}
                sources={func.sources}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Investition erforderlich</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">€8-13k</p>
            <p className="text-sm text-gray-600 mt-2">Entwicklung (3-4 Wochen)</p>
            <p className="text-xs text-green-600 mt-1">✓ 0€ für APIs (alle FREE)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jährlicher Datenwert</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">€190-370k</p>
            <p className="text-sm text-gray-600 mt-2">Geschätzter Wert nach Phase 3</p>
            <p className="text-xs text-green-600 mt-1">✓ ROI: 1.500-2.900%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payback-Period</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">4-12 Wochen</p>
            <p className="text-sm text-gray-600 mt-2">Amortisierung des Investitionen</p>
            <p className="text-xs text-green-600 mt-1">✓ Schnell & nachhaltig</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-900">Empfehlungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Badge className="mt-1">KRITISCH</Badge>
            <div>
              <p className="font-medium">Patents-Services aktivieren (Phase 1)</p>
              <p className="text-sm text-gray-700">650k Items/Jahr möglich, aktuell ZERO - höchster Impact</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className="mt-1" variant="secondary">HOCH</Badge>
            <div>
              <p className="font-medium">Knowledge Base erweitern (Phase 1)</p>
              <p className="text-sm text-gray-700">PubMed + FDA Guidance = 1M+ Dokumente kostenfrei</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className="mt-1" variant="secondary">HOCH</Badge>
            <div>
              <p className="font-medium">Internationale Quellen (Phase 1-2)</p>
              <p className="text-sm text-gray-700">7+ Länder für Approval/Safety - 80%+ globale Abdeckung</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DataQualityDashboard;
