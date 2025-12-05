import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, TrendingUp, Settings, BarChart3, FileText } from 'lucide-react';

const DataSourcesNavigation: React.FC = () => {
  const sections = [
    {
      title: 'Data Source Details',
      description: 'Detaillierte Übersicht aller integrierten Datenquellen',
      icon: Database,
      link: '/admin/data-sources-details',
      features: [
        '150M+ Datenpunkte',
        '6 große Quellen',
        'Echtzeitstatistiken',
        'Kategorisierung'
      ]
    },
    {
      title: 'Data Sources Management',
      description: 'Verwalte API-Zugangsschlüssel und Konfigurationen',
      icon: Settings,
      link: '/admin/data-sources',
      features: [
        'API-Schlüssel',
        'Sync-Status',
        'Ratengrenzwerte',
        'Kosten-Info'
      ]
    },
    {
      title: 'Analytics Dashboard',
      description: 'Visualisierte Datenverteilung und Trends',
      icon: BarChart3,
      link: '/analytics',
      features: [
        'Charts & Grafiken',
        'Trend-Analyse',
        'Performance-Metriken',
        'Vergleiche'
      ]
    },
    {
      title: 'Documentation',
      description: 'Comprehensive research und Implementierungs-Guide',
      icon: FileText,
      link: '#',
      features: [
        '50+ Quellen recherchiert',
        '363M+ Items katalogisiert',
        'Implementierungs-Roadmap',
        'Kosten-Analyse'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Datenquellen-Verwaltung</h1>
          <p className="text-slate-400 text-lg">Verwalte und überwache alle integrierten Datenquellen</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <Link key={idx} href={section.link}>
                <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Icon className="w-8 h-8 text-blue-400" />
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <CardTitle className="text-white">{section.title}</CardTitle>
                    <CardDescription className="text-slate-400">{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {section.features.map((feature, fidx) => (
                          <div key={fidx} className="text-sm text-slate-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mt-4 border-blue-600 text-blue-400 hover:bg-blue-600/20"
                      >
                        Öffnen →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Statistics Section */}
        <div className="mt-12 bg-slate-800 border border-slate-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">System-Statistiken</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Records', value: '150M+', desc: 'All-time data' },
              { label: 'Active Records', value: '200K+', desc: 'Currently running' },
              { label: 'Data Sources', value: '6', desc: 'Major sources' },
              { label: 'Daily Updates', value: '50K+', desc: 'New records' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-slate-700 p-4 rounded">
                <p className="text-slate-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-blue-400 mt-2">{stat.value}</p>
                <p className="text-slate-500 text-xs mt-1">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Facts */}
        <div className="mt-12 bg-slate-800 border border-slate-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Datenquellen Übersicht</h2>
          
          <div className="space-y-4">
            {[
              { src: 'Patents (USPTO)', records: '12M', active: '25M', pct: '210%' },
              { src: 'Patents (Espacenet)', records: '100M', active: '30M', pct: '30%' },
              { src: 'Clinical Trials', records: '500K', active: '175K', pct: '35%' },
              { src: 'PubMed Papers', records: '35M', active: '3M', pct: '8.6%' },
              { src: 'NIST Standards', records: '6K', active: '5K', pct: '83%' },
              { src: 'FDA Regulatory', records: '2.3M', active: '500K', pct: '21.7%' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-700 rounded">
                <div>
                  <p className="text-white font-semibold">{item.src}</p>
                </div>
                <div className="flex gap-8">
                  <div className="text-right">
                    <p className="text-slate-400 text-xs">Total</p>
                    <p className="text-white font-semibold">{item.records}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs">Active</p>
                    <p className="text-green-400 font-semibold">{item.active}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs">Aktiv %</p>
                    <p className="text-blue-400 font-semibold">{item.pct}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourcesNavigation;
