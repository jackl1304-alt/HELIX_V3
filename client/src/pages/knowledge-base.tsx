import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, BookOpen, Search, ExternalLink, Database, Calendar } from "@/components/icons";

interface KnowledgeArticle {
  id: string;
  title: string;
  abstract: string | null;
  content: string;
  author: string;
  year: number | null;
  source: string;
  focus: string;
  url: string;
  category: string;
  tags: string[];
  publishedDate: string | null;
  createdAt: string;
}

export default function KnowledgeBase() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  // Live-Daten vom Master-Katalog (15 echte Studien aus PMC / Lancet / Cochrane / Springer)
  const { data, isLoading, error } = useQuery<{ data: KnowledgeArticle[]; meta: any } | KnowledgeArticle[]>({
    queryKey: ['/api/knowledge-base'],
    queryFn: async () => {
      const res = await fetch('/api/knowledge-base');
      if (!res.ok) throw new Error(`KB fetch failed: ${res.status}`);
      return res.json();
    },
    staleTime: 300_000,
  });

  // Antwort kann wrapped ({data, meta}) oder raw-Array sein — beide Fälle robust behandeln
  const articles = useMemo<KnowledgeArticle[]>(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as KnowledgeArticle[];
    if (Array.isArray((data as any).data)) return (data as any).data as KnowledgeArticle[];
    return [];
  }, [data]);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.abstract ?? '').toLowerCase().includes(q) ||
        (a.focus ?? '').toLowerCase().includes(q) ||
        (a.source ?? '').toLowerCase().includes(q)
    );
  }, [articles, searchTerm]);

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
              <span>{t('knowledge.backToDashboard')}</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('knowledge.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('knowledge.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span>{t('knowledge.wissensdatenbank')}</span>
              {!isLoading && (
                <span className="text-sm text-gray-500">({articles.length})</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <Search className="h-5 w-5 text-gray-400" />
              <Input
                placeholder={t('knowledge.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Badge variant="outline">{t('knowledge.articlesCount').replace('{{count}}', String(articles.length))}</Badge>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="text-center py-12">
              <Database className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-600 dark:text-gray-400">{t('knowledge.loadingArticles')}</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-red-600">{t('knowledge.loadError')}: {(error as Error).message}</p>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? t('knowledge.noArticlesForSearch').replace('{{term}}', searchTerm) : t('knowledge.noArticlesFound')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <Card key={a.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold leading-tight">
                      {a.title}
                    </CardTitle>
                    <Badge variant="secondary">{a.source}</Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {a.publishedDate ? (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(a.publishedDate).toLocaleDateString('de-DE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    ) : (
                      <span>{t('knowledge.year')}: {a.year ?? t('knowledge.noYear')}</span>
                    )}
                    {a.author && <span className="ml-2">· {a.author}</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-4">
                    {a.abstract ?? a.focus ?? t('knowledge.noDescription')}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {a.tags?.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                    {a.category && (
                      <Badge variant="default" className="text-xs">{a.category}</Badge>
                    )}
                  </div>
                  {a.url && (
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {t('knowledge.openSource')}
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}