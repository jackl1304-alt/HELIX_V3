import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'wouter';
import { ArrowLeft, Globe, Database, FileText, Patent, BookOpen, ExternalLink } from "@/components/icons";

interface GlobalAuthority {
  id: string;
  name: string;
  region: string;
  url: string;
  type: string;
}

interface RegulatorySource {
  id: string;
  name: string;
  category: string;
  url: string;
  region: string;
  type: string;
}

interface QMSPatent {
  publicationNumber: string;
  title: string;
  url: string;
  source: string;
  jurisdiction: string;
  status: string;
}

interface ScientificStudy {
  id: string;
  author: string;
  year: number;
  title: string;
  focus: string;
  url: string;
  source: string;
}

export default function GlobalSources() {
  const [, setLocation] = useLocation();
  const [authorities, setAuthorities] = useState<GlobalAuthority[]>([]);
  const [sources, setSources] = useState<RegulatorySource[]>([]);
  const [patents, setPatents] = useState<QMSPatent[]>([]);
  const [studies, setStudies] = useState<ScientificStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authRes, sourcesRes, patentsRes, studiesRes] = await Promise.all([
          fetch('/api/global-authorities'),
          fetch('/api/regulatory-sources'),
          fetch('/api/qms-patents'),
          fetch('/api/scientific-studies')
        ]);
        
        const authData = await authRes.json();
        const sourcesData = await sourcesRes.json();
        const patentsData = await patentsRes.json();
        const studiesData = await studiesRes.json();
        
        setAuthorities(authData.data || []);
        setSources(sourcesData.data || []);
        setPatents(patentsData.data || []);
        setStudies(studiesData.data || []);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Zurück zum Dashboard</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Global Sources
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Umfassende weltweite regulatorische Quellen, Patente und Studien
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="authorities" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="authorities" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Behörden
            </TabsTrigger>
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Regulatorische Quellen
            </TabsTrigger>
            <TabsTrigger value="patents" className="flex items-center gap-2">
              <Patent className="h-4 w-4" />
              Patente
            </TabsTrigger>
            <TabsTrigger value="studies" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Studien
            </TabsTrigger>
          </TabsList>

          <TabsContent value="authorities">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-6 w-6 text-blue-600" />
                  <span>Globale Regulatorische Behörden</span>
                  {!loading && <span className="text-sm text-gray-500">({authorities.length})</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <Database className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600 dark:text-gray-400">Lade Behörden...</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {authorities.map((auth) => (
                      <Card key={auth.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                          <h3 className="font-semibold text-lg mb-2">{auth.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Region: {auth.region}</p>
                          <p className="text-xs text-gray-500 mb-3">Typ: {auth.type}</p>
                          <a 
                            href={auth.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Zur Behörde
                          </a>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-6 w-6 text-green-600" />
                  <span>Detaillierte Regulatorische Quellen</span>
                  {!loading && <span className="text-sm text-gray-500">({sources.length})</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <Database className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600 dark:text-gray-400">Lade Quellen...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sources.map((source) => (
                      <Card key={source.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              {source.region}
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              {source.type}
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                              {source.category}
                            </span>
                          </div>
                          <h3 className="font-semibold text-base mb-2">{source.name}</h3>
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Quelle öffnen
                          </a>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Patent className="h-6 w-6 text-orange-600" />
                  <span>QMS-Technologie Patente</span>
                  {!loading && <span className="text-sm text-gray-500">({patents.length})</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <Database className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600 dark:text-gray-400">Lade Patente...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {patents.map((patent, idx) => (
                      <Card key={idx} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                              {patent.jurisdiction}
                            </span>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                              {patent.status}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                              {patent.source}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">{patent.publicationNumber}</p>
                          <h3 className="font-semibold text-base mb-2">{patent.title}</h3>
                          <a 
                            href={patent.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Patent ansehen
                          </a>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="studies">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                  <span>Wissenschaftliche & Klinische Studien</span>
                  {!loading && <span className="text-sm text-gray-500">({studies.length})</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <Database className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600 dark:text-gray-400">Lade Studien...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {studies.map((study) => (
                      <Card key={study.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {study.year && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                                {study.year}
                              </span>
                            )}
                            <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs font-medium">
                              {study.source}
                            </span>
                          </div>
                          {study.author && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{study.author}</p>
                          )}
                          <h3 className="font-semibold text-base mb-2">{study.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{study.focus}</p>
                          <a 
                            href={study.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Studie öffnen
                          </a>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}