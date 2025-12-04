import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Globe,
  DollarSign,
  Zap,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

interface DataSource {
  id: string;
  name: string;
  category: 'regulatory' | 'legal' | 'patent' | 'safety' | 'clinical' | 'standards' | 'knowledge' | 'market';
  region: string | string[];
  type: 'api' | 'database' | 'scraping' | 'restricted';
  pricing: 'free' | 'freemium' | 'premium' | 'restricted';
  cost: string;
  items: number;
  dataType: string;
  status: 'active' | 'ready' | 'planned';
  url: string;
  authRequired: boolean;
  updateFrequency: string;
  rateLimit: string;
  docs: string;
  notes?: string;
}

const DATA_SOURCES: DataSource[] = [
  // REGULATORY - ACTIVE
  {
    id: 'fda-510k',
    name: 'FDA 510k Clearances',
    category: 'regulatory',
    region: 'USA',
    type: 'api',
    pricing: 'free',
    cost: '€0',
    items: 930,
    dataType: 'Device Approvals',
    status: 'active',
    url: 'https://open.fda.gov/apis/device/510k/',
    authRequired: false,
    updateFrequency: 'Daily',
    rateLimit: '240 req/min',
    docs: 'https://open.fda.gov/docs/'
  },
  {
    id: 'fda-maude',
    name: 'FDA MAUDE Adverse Events',
    category: 'safety',
    region: 'USA',
    type: 'api',
    pricing: 'free',
    cost: '€0',
    items: 930,
    dataType: 'Adverse Event Reports',
    status: 'active',
    url: 'https://open.fda.gov/apis/device/event/',
    authRequired: false,
    updateFrequency: 'Weekly',
    rateLimit: '240 req/min',
    docs: 'https://open.fda.gov/docs/'
  },
  {
    id: 'fda-pma',
    name: 'FDA PMA Approvals',
    category: 'regulatory',
    region: 'USA',
    type: 'api',
    pricing: 'free',
    cost: '€0',
    items: 465,
    dataType: 'Premarket Approvals',
    status: 'active',
    url: 'https://open.fda.gov/apis/device/pma/',
    authRequired: false,
    updateFrequency: 'Weekly',
    rateLimit: '240 req/min',
    docs: 'https://open.fda.gov/docs/'
  },
  {
    id: 'fda-enforcement',
    name: 'FDA Enforcement Actions',
    category: 'legal',
    region: 'USA',
    type: 'api',
    pricing: 'free',
    cost: '€0',
    items: 20,
    dataType: 'Legal Cases',
    status: 'active',
    url: 'https://open.fda.gov/apis/device/enforcement/',
    authRequired: false,
    updateFrequency: 'Weekly',
    rateLimit: '240 req/min',
    docs: 'https://open.fda.gov/docs/'
  },
  // REGULATORY - READY TO ACTIVATE
  {
    id: 'ema-alerts',
    name: 'EMA News & Alerts',
    category: 'regulatory',
    region: 'Europe',
    type: 'api',
    pricing: 'free',
    cost: '€0',
    items: 800,
    dataType: 'Regulatory Updates',
    status: 'ready',
    url: 'https://www.ema.europa.eu/',
    authRequired: false,
    updateFrequency: 'Daily',
    rateLimit: 'Unlimited',
    docs: 'https://www.ema.europa.eu/en/human-regulatory'
  },
  {
    id: 'bfarm',
    name: 'BfArM Meldungen',
    category: 'regulatory',
    region: 'Germany',
    type: 'api',
    pricing: 'free',
    cost: '€0',
    items: 150,
    dataType: 'Regulatory Updates',
    status: 'ready',
    url: 'https://www.bfarm.de/',
    authRequired: false,
    updateFrequency: 'Daily',
    rateLimit: 'Unlimited',
    docs: 'https://www.bfarm.de/DE/Home/home_node.html'
  },
  {
    id: 'mhra',
    name: 'MHRA Updates (UK)',
    category: 'regulatory',
    region: 'UK',
    type: 'api',
    pricing: 'free',
    cost: '€0',
    items: 120,
    dataType: 'Regulatory Updates',
    status: 'ready',
    url: 'https://www.mhra.gov.uk/',
    authRequired: false,
    updateFrequency: 'Daily',
    rateLimit: 'Unlimited',
    docs: 'https://www.mhra.gov.uk/news-and-updates'
  },
  {
    id: 'swissmedic',
    name: 'Swissmedic Alerts',
    category: 'regulatory',
    region: 'Switzerland',
    type: 'api',
    pricing: 'free',
    cost: '€0',
    items: 80,
    dataType: 'Regulatory Updates',
    status: 'ready',
    url: 'https://www.swissmedic.ch/',
    authRequired: false,
    updateFrequency: 'Daily',
    rateLimit: 'Unlimited',
    docs: 'https://www.swissmedic.ch/en/'
  },
  {
    id: 'health-canada',
    name: 'Health Canada Notices',
    category: 'regulatory',
    region: 'Canada',
    type: 'api',
    pricing: 'free',
    cost: '€0',
    items: 150,
    dataType: 'Regulatory Updates',
    status: 'ready',
    url: 'https://www.canada.ca/en/health-canada',
    authRequired: false,
    updateFrequency: 'Daily',
    rateLimit: 'Unlimited',
    docs: 'https://www.canada.ca/en/health-canada/services/drugs-health-products/medeffects-canada'
  },
  {
    id: 'tga',
    name: 'TGA Updates (Australia)',
    category: 'regulatory',
    region: 'Australia',
    type: 'api',
    pricing: 'free',
    cost: '€0',
    items: 80,
    dataType: 'Regulatory Updates',
    status: 'ready',
    url: 'https://www.tga.gov.au/',
    authRequired: false,
    updateFrequency: 'Daily',
    rateLimit: 'Unlimited',
    docs: 'https://www.tga.gov.au/news-and-media'
  },
  {
    id: 'pmda',
    name: 'PMDA Announcements (Japan)',
    category: 'regulatory',
    region: 'Japan',
    type: 'api',
    pricing: 'free',
    cost: '€0',
    items: 150,
    dataType: 'Regulatory Updates',
    status: 'ready',
    url: 'https://www.pmda.go.jp/',
    authRequired: false,
    updateFrequency: 'Daily',
    rateLimit: 'Unlimited',
    docs: 'https://www.pmda.go.jp/english/'
  },
  // PATENTS
  {
    id: 'patentsview',
    name: 'PatentsView (USA)',
    category: 'patent',
    region: 'USA',
    type: 'api',
    pricing: 'free',
    cost: '€0',
    items: 50000,
    dataType: 'Patents',
    status: 'ready',
    url: 'https://www.patentsview.org/',
    authRequired: false,
    updateFrequency: 'Monthly',
    rateLimit: 'Unlimited',
    docs: 'https://www.patentsview.org/apis'
  },
  {
    id: 'wipo',
    name: 'WIPO PatentScope (Global)',
    category: 'patent',
    region: ['Europe', 'Asia', 'Global'],
    type: 'api',
    pricing: 'free',
    cost: '€0',
    items: 100000,
    dataType: 'Patents',
    status: 'ready',
    url: 'https://www.wipo.int/',
    authRequired: false,
    updateFrequency: 'Monthly',
    rateLimit: 'Unlimited',
    docs: 'https://patentscope.wipo.int/search/en/search.jsf'
  },
  {
    id: 'google-patents',
    name: 'Google Patents',
    category: 'patent',
    region: 'Global',
    type: 'scraping',
    pricing: 'free',
    cost: '€0',
    items: 500000,
    dataType: 'Patents',
    status: 'ready',
    url: 'https://patents.google.com/',
    authRequired: false,
    updateFrequency: 'Real-time',
    rateLimit: 'Rate limited',
    docs: 'https://patents.google.com/?oq=&country=US'
  },
  {
    id: 'lens-org',
    name: 'Lens.org (Patent + Scholar)',
    category: 'patent',
    region: 'Global',
    type: 'api',
    pricing: 'freemium',
    cost: '€0 - €500/Mo',
    items: 100000,
    dataType: 'Patents & Research',
    status: 'ready',
    url: 'https://lens.org/',
    authRequired: true,
    updateFrequency: 'Monthly',
    rateLimit: 'Tiered',
    docs: 'https://lens.org/api'
  },
  // LEGAL CASES
  {
    id: 'courtlistener',
    name: 'CourtListener (USA Federal)',
    category: 'legal',
    region: 'USA',
    type: 'api',
    pricing: 'free',
    cost: '€0',
    items: 10000,
    dataType: 'Court Cases',
    status: 'ready',
    url: 'https://www.courtlistener.com/',
    authRequired: false,
    updateFrequency: 'Daily',
    rateLimit: 'Unlimited',
    docs: 'https://www.courtlistener.com/api/rest-info/'
  },
  {
    id: 'google-scholar',
    name: 'Google Scholar',
    category: 'legal',
    region: 'Global',
    type: 'scraping',
    pricing: 'free',
    cost: '€0',
    items: 100000,
    dataType: 'Legal Cases & Research',
    status: 'ready',
    url: 'https://scholar.google.com/',
    authRequired: false,
    updateFrequency: 'Daily',
    rateLimit: 'Rate limited',
    docs: 'https://scholar.google.com/'
  },
  {
    id: 'bailii',
    name: 'BAILII (UK/Ireland)',
    category: 'legal',
    region: ['UK', 'Ireland'],
    type: 'api',
    pricing: 'free',
    cost: '€0',
    items: 50000,
    dataType: 'Court Cases',
    status: 'ready',
    url: 'https://www.bailii.org/',
    authRequired: false,
    updateFrequency: 'Weekly',
    rateLimit: 'Unlimited',
    docs: 'https://www.bailii.org/'
  },
  // CLINICAL TRIALS
  {
    id: 'clinicaltrials',
    name: 'ClinicalTrials.gov',
    category: 'clinical',
    region: 'Global',
    type: 'api',
    pricing: 'free',
    cost: '€0',
    items: 50000,
    dataType: 'Clinical Trials',
    status: 'ready',
    url: 'https://clinicaltrials.gov/',
    authRequired: false,
    updateFrequency: 'Daily',
    rateLimit: 'Unlimited',
    docs: 'https://clinicaltrials.gov/api/'
  },
  {
    id: 'who-trials',
    name: 'WHO ICTRP (Global Trials)',
    category: 'clinical',
    region: 'Global',
    type: 'api',
    pricing: 'free',
    cost: '€0',
    items: 50000,
    dataType: 'Clinical Trials',
    status: 'ready',
    url: 'https://www.who.int/clinical-trials-registry-platform',
    authRequired: false,
    updateFrequency: 'Daily',
    rateLimit: 'Unlimited',
    docs: 'https://www.who.int/clinical-trials-registry-platform'
  },
  // KNOWLEDGE BASE
  {
    id: 'fda-guidance',
    name: 'FDA Guidance Documents',
    category: 'knowledge',
    region: 'USA',
    type: 'api',
    pricing: 'free',
    cost: '€0',
    items: 500,
    dataType: 'Guidance Documents',
    status: 'ready',
    url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents',
    authRequired: false,
    updateFrequency: 'Weekly',
    rateLimit: 'Unlimited',
    docs: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents'
  },
  {
    id: 'pubmed',
    name: 'PubMed/MEDLINE',
    category: 'knowledge',
    region: 'Global',
    type: 'api',
    pricing: 'free',
    cost: '€0',
    items: 1000000,
    dataType: 'Medical Publications',
    status: 'ready',
    url: 'https://pubmed.ncbi.nlm.nih.gov/',
    authRequired: false,
    updateFrequency: 'Daily',
    rateLimit: 'Unlimited',
    docs: 'https://www.ncbi.nlm.nih.gov/pmc/tools/openxml/'
  },
  {
    id: 'who-reports',
    name: 'WHO Technical Reports',
    category: 'knowledge',
    region: 'Global',
    type: 'api',
    pricing: 'free',
    cost: '€0',
    items: 200,
    dataType: 'Technical Reports',
    status: 'ready',
    url: 'https://www.who.int/publications',
    authRequired: false,
    updateFrequency: 'Monthly',
    rateLimit: 'Unlimited',
    docs: 'https://www.who.int/publications'
  },
  // PREMIUM SOURCES
  {
    id: 'lexisnexis',
    name: 'LexisNexis Legal Suite',
    category: 'legal',
    region: 'Global',
    type: 'database',
    pricing: 'premium',
    cost: '€2000-5000/Mo',
    items: 1000000,
    dataType: 'Legal Cases & Analysis',
    status: 'planned',
    url: 'https://www.lexisnexis.com/',
    authRequired: true,
    updateFrequency: 'Real-time',
    rateLimit: 'Enterprise',
    docs: 'https://www.lexisnexis.com/en-us/products/lexis-plus.page'
  },
  {
    id: 'westlaw',
    name: 'Westlaw Legal Database',
    category: 'legal',
    region: 'Global',
    type: 'database',
    pricing: 'premium',
    cost: '€2000-5000/Mo',
    items: 1000000,
    dataType: 'Legal Cases & Analysis',
    status: 'planned',
    url: 'https://www.westlaw.com/',
    authRequired: true,
    updateFrequency: 'Real-time',
    rateLimit: 'Enterprise',
    docs: 'https://www.westlaw.com/'
  },
  {
    id: 'scopus',
    name: 'Scopus (Citations)',
    category: 'knowledge',
    region: 'Global',
    type: 'database',
    pricing: 'premium',
    cost: '€5000/Jahr',
    items: 100000,
    dataType: 'Citation Analysis',
    status: 'planned',
    url: 'https://www.scopus.com/',
    authRequired: true,
    updateFrequency: 'Monthly',
    rateLimit: 'Enterprise',
    docs: 'https://www.scopus.com/home.uri'
  },
  {
    id: 'crunchbase',
    name: 'Crunchbase (M&A/Funding)',
    category: 'market',
    region: 'Global',
    type: 'database',
    pricing: 'premium',
    cost: '€500-5000/Mo',
    items: 100000,
    dataType: 'Company Data',
    status: 'planned',
    url: 'https://www.crunchbase.com/',
    authRequired: true,
    updateFrequency: 'Real-time',
    rateLimit: 'Tiered',
    docs: 'https://about.crunchbase.com/crunchbase-basic/'
  },
];

const CATEGORIES = {
  regulatory: { label: 'Regulatorisch', color: 'bg-blue-100 text-blue-800' },
  legal: { label: 'Juristische Fälle', color: 'bg-purple-100 text-purple-800' },
  patent: { label: 'Patente & IP', color: 'bg-green-100 text-green-800' },
  safety: { label: 'Sicherheit', color: 'bg-red-100 text-red-800' },
  clinical: { label: 'Klinische Studien', color: 'bg-cyan-100 text-cyan-800' },
  standards: { label: 'Standards', color: 'bg-yellow-100 text-yellow-800' },
  knowledge: { label: 'Wissensdatenbank', color: 'bg-pink-100 text-pink-800' },
  market: { label: 'Marktdaten', color: 'bg-orange-100 text-orange-800' },
};

export function AdminDataSourcesPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPricing, setSelectedPricing] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [activeSources, setActiveSources] = useState(new Set(['fda-510k', 'fda-maude', 'fda-pma', 'fda-enforcement']));

  // Filtering Logic
  const filteredSources = useMemo(() => {
    return DATA_SOURCES.filter(source => {
      const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           source.dataType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || source.category === selectedCategory;
      const matchesPricing = !selectedPricing || source.pricing === selectedPricing;
      const matchesStatus = !selectedStatus || source.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesPricing && matchesStatus;
    });
  }, [searchTerm, selectedCategory, selectedPricing, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const active = filteredSources.filter(s => s.status === 'active').length;
    const ready = filteredSources.filter(s => s.status === 'ready').length;
    const planned = filteredSources.filter(s => s.status === 'planned').length;
    const free = filteredSources.filter(s => s.pricing === 'free' || s.pricing === 'freemium').length;
    const premium = filteredSources.filter(s => s.pricing === 'premium' || s.pricing === 'restricted').length;
    const totalItems = filteredSources.reduce((sum, s) => sum + s.items, 0);
    
    return { active, ready, planned, free, premium, totalItems };
  }, [filteredSources]);

  const toggleSourceActive = (id: string) => {
    setActiveSources(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">API Datenquellen Verwaltung</h1>
        <p className="text-gray-600">Zentrale Verwaltung aller verfügbaren Datenquellen mit Free/Paid Übersicht</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-gray-600">Aktiv</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.ready}</div>
              <p className="text-xs text-gray-600">Aktivierbar</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.planned}</div>
              <p className="text-xs text-gray-600">Geplant</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.free}</div>
              <p className="text-xs text-gray-600">Kostenlos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <Globe className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.premium}</div>
              <p className="text-xs text-gray-600">Premium</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{(stats.totalItems / 1000).toFixed(0)}k</div>
              <p className="text-xs text-gray-600">Daten-Items</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Suche</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Nach Quellennamen oder Datentyp suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Category Filter */}
            <div className="flex gap-1 flex-wrap">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Alle Kategorien
              </Button>
              {Object.entries(CATEGORIES).map(([key, { label }]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                >
                  {label}
                </Button>
              ))}
            </div>

            {/* Pricing Filter */}
            <div className="flex gap-1">
              <Button
                variant={selectedPricing === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPricing(null)}
              >
                Alle Preise
              </Button>
              <Button
                variant={selectedPricing === 'free' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPricing('free')}
              >
                Kostenlos
              </Button>
              <Button
                variant={selectedPricing === 'freemium' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPricing('freemium')}
              >
                Freemium
              </Button>
              <Button
                variant={selectedPricing === 'premium' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPricing('premium')}
              >
                Premium
              </Button>
            </div>

            {/* Status Filter */}
            <div className="flex gap-1">
              <Button
                variant={selectedStatus === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus(null)}
              >
                Alle Status
              </Button>
              <Button
                variant={selectedStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('active')}
              >
                Aktiv
              </Button>
              <Button
                variant={selectedStatus === 'ready' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('ready')}
              >
                Aktivierbar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSources.map(source => {
          const isActive = activeSources.has(source.id);
          const categoryInfo = CATEGORIES[source.category];
          
          return (
            <Card key={source.id} className={isActive ? 'border-green-500 border-2' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base">{source.name}</CardTitle>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge className={categoryInfo.color}>
                        {categoryInfo.label}
                      </Badge>
                      <Badge variant={source.pricing === 'free' ? 'default' : 'secondary'}>
                        {source.pricing === 'free' ? '✓ Kostenlos' : source.cost}
                      </Badge>
                      <Badge variant={
                        source.status === 'active' ? 'default' :
                        source.status === 'ready' ? 'secondary' :
                        'outline'
                      }>
                        {source.status === 'active' ? '🟢 Aktiv' :
                         source.status === 'ready' ? '🟡 Aktivierbar' :
                         '⚪ Geplant'}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleSourceActive(source.id)}
                    className={isActive ? 'text-green-600' : ''}
                  >
                    {isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Region:</span>
                    <p className="font-medium">
                      {Array.isArray(source.region) ? source.region.join(', ') : source.region}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Datentyp:</span>
                    <p className="font-medium">{source.dataType}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Items:</span>
                    <p className="font-medium">
                      {source.items > 1000 ? `${(source.items / 1000).toFixed(0)}k+` : source.items}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Update:</span>
                    <p className="font-medium text-xs">{source.updateFrequency}</p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="border-t pt-2 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Auth erforderlich:</span>
                    <span>{source.authRequired ? '✓ Ja' : '✗ Nein'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">API-Typ:</span>
                    <span className="font-medium uppercase">{source.type}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(source.url, '_blank')}
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Website
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(source.docs, '_blank')}
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Docs
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {filteredSources.length === 0 && (
        <Card>
          <CardContent className="pt-8 text-center">
            <p className="text-gray-600">Keine Datenquellen gefunden, die den Filterkriterien entsprechen.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AdminDataSourcesPanel;
