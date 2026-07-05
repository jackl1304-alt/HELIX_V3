import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Save, Send, Sparkles, FileCheck, ChevronLeft } from '@/components/icons';
import { FieldRenderer, type FormField } from './FieldRenderer';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface FormTemplate {
  id: string;
  category: string;
  jurisdiction: string;
  destinationTable: string;
  title: { de: string; en: string };
  subtitle: { de: string; en: string };
  legalBasis: string;
  fields: FormField[];
}

interface CatalogItem extends Omit<FormTemplate, 'fields'> {
  fieldCount: number;
  mustCount: number;
}

interface SaveResponse {
  id: string;
  formId: string;
  status: 'draft';
}

/**
 * FormAssistant — main UI for the Formular-Assistent.
 *
 * Two-column layout:
 *  - Left: Form catalog (6 legally compliant templates)
 *  - Right: Active form (Dynamic rendering of MUST fields + preset selection)
 *
 * Behavior:
 *  - Loads form schema from /api/form-templates/:id
 *  - Maintains values in local state; tracks completion %
 *  - Server-side "save draft" via /api/form-assistant/:formId/drafts (POST enforces MUST validation)
 *  - Persists to the matching destination DB table (project_charta_documents, conformity_declarations, …)
 */
export default function FormAssistant({ initialFormId }: { initialFormId?: string } = {}) {
  const { language, t: _t } = useLanguage();
  const lang = useMemo(() => ({ language, t: _t }), [language, _t]);
  const queryClient = useQueryClient();

  const [selectedFormId, setSelectedFormId] = useState<string | null>(initialFormId ?? null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [serverErrors, setServerErrors] = useState<string[]>([]);

  // 1) Catalog
  const catalog = useQuery<{ data: CatalogItem[]; meta: any }>({
    queryKey: ['/api/form-templates'],
    queryFn: async () => {
      const r = await fetch('/api/form-templates');
      if (!r.ok) throw new Error('Failed to load form templates');
      return r.json();
    },
  });

  // 2) Active form schema
  const formSchema = useQuery<FormTemplate>({
    queryKey: ['/api/form-templates', selectedFormId],
    enabled: !!selectedFormId,
    queryFn: async () => {
      const r = await fetch(`/api/form-templates/${selectedFormId}`);
      if (!r.ok) throw new Error('Form not found');
      return r.json();
    },
  });

  useEffect(() => {
    // Reset form values when template changes
    setValues({});
    setServerErrors([]);
  }, [selectedFormId]);

  // 3) Save Draft mutation
  const saveDraft = useMutation<SaveResponse, Error, void>({
    mutationFn: async () => {
      if (!selectedFormId) throw new Error('No form selected');
      const r = await fetch(`/api/form-assistant/${selectedFormId}/drafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e?.error ?? `HTTP ${r.status}`);
      }
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/form-assistant', selectedFormId, 'drafts'] });
    },
  });

  // Derived helpers
  const fields = formSchema.data?.fields ?? [];
  const requiredTotal = fields.filter((f) => f.must).length;
  const requiredFilled = fields.filter((f) => f.must && hasValue(values[f.id])).length;
  const optionalFilled = fields.filter((f) => !f.must && hasValue(values[f.id])).length;
  const totalCompleted = requiredFilled + optionalFilled;
  const totalAll = fields.length;
  const completionPct = totalAll === 0 ? 0 : Math.round((totalCompleted / totalAll) * 100);
  const canSave = requiredFilled === requiredTotal && requiredTotal > 0 && !saveDraft.isPending;

  const clientErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    for (const f of fields) {
      const v = values[f.id];
      if (f.must && !hasValue(v)) {
        errs[f.id] = lang.language === 'de' ? 'Pflichtfeld — nicht leer lassen.' : 'Required — must not be empty.';
        continue;
      }
      if (v !== undefined && v !== null && v !== '' && f.validation?.pattern) {
        try {
          if (!new RegExp(f.validation.pattern).test(String(v))) {
            errs[f.id] = f.validation.message?.[lang.language] ?? 'Ungültiges Format';
          }
        } catch {
          /* ignore bad regex */
        }
      }
    }
    return errs;
  }, [fields, values, lang.language]);

  const items = catalog.data?.data ?? [];

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Sidebar — catalog */}
      <aside className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Formular-Katalog
            </CardTitle>
            <CardDescription className="text-xs">
              Rechtssichere Vorlagen — Felder mit MUST-Marker sind Pflicht.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {catalog.isLoading && <div className="text-sm text-gray-500">Lade Katalog…</div>}
            {catalog.error && (
              <div className="text-sm text-red-600">Katalog konnte nicht geladen werden: {(catalog.error as Error).message}</div>
            )}
            {items.map((it) => {
              const active = selectedFormId === it.id;
              return (
                <button
                  key={it.id}
                  onClick={() => setSelectedFormId(it.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border transition-all',
                    active ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-900/20 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:bg-gray-50',
                  )}
                  data-testid={`catalog-${it.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold leading-tight">{it.title.de}</div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">{it.category.toUpperCase()}</Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{it.subtitle.de}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px]">{it.mustCount} Pflichtfelder</Badge>
                    <span className="text-[10px] text-gray-400">{it.fieldCount} Felder</span>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {selectedFormId && (
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setSelectedFormId(null)}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Zurück zum Katalog
          </Button>
        )}
      </aside>

      {/* Main canvas */}
      <section className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-6">
        {!selectedFormId && (
          <Card>
            <CardHeader>
              <CardTitle>Willkommen beim Formular-Assistent</CardTitle>
              <CardDescription>Wählen Sie links eine rechtssichere Vorlage aus.</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert">
              <p>
                Jedes Formular enthält ausschließlich regulatorisch akzeptierte Wortlaute. Pflichtfelder sind
                mit einem roten <span className="font-mono text-xs font-bold text-red-600">MUST</span>-Marker
                versehen — diese Felder müssen vor dem Signieren ausgefüllt sein. Bei Auswahlfeldern
                wird zusätzlich die regulatorische Quelle (z. B. <em>MDR Anhang IV §1</em>) angezeigt.
              </p>
              <ul className="text-sm space-y-1 mt-4">
                <li><strong>Vorbelegt</strong>: Hersteller, Antragsteller, Projektleitung — kommen aus Ihren Stammdaten.</li>
                <li><strong>Vorauswahlpflicht</strong>: Klassifikationen, Normen, Methoden sind als Standardwortlaut markiert und werden per Klick übernommen.</li>
                <li><strong>Textbausteine</strong>: Bei Freitextfeldern schlägt das System konforme Formulierungen vor (z. B. ISO 14971 Hazard-Beschreibungen).</li>
                <li><strong>Persistenz</strong>: Entwürfe werden revisionssicher in Ihrer Tenant-Datenbank abgelegt.</li>
              </ul>
            </CardContent>
          </Card>
        )}

        {selectedFormId && formSchema.isLoading && (
          <Card><CardContent className="p-8 text-gray-500">Lade Formular…</CardContent></Card>
        )}

        {selectedFormId && formSchema.error && (
          <Card><CardContent className="p-8 text-red-600">Formular konnte nicht geladen werden.</CardContent></Card>
        )}

        {selectedFormId && formSchema.data && (
          <>
            {/* Header + progress */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle>{formSchema.data.title.de}</CardTitle>
                    <CardDescription>{formSchema.data.subtitle.de}</CardDescription>
                    <div className="text-[11px] font-mono text-gray-500 mt-1">
                      Rechtsgrundlage: <span className="font-semibold">{formSchema.data.legalBasis}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">
                      Zielmarkt: <Badge variant="outline" className="text-[10px]">{formSchema.data.jurisdiction}</Badge>
                      <span className="ml-2">Persistenz: <code className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1 rounded">{formSchema.data.destinationTable}</code></span>
                    </div>
                  </div>
                  <Badge className="bg-red-600 text-white">{requiredFilled}/{requiredTotal} Pflichtfelder</Badge>
                </div>
                <div className="mt-4">
                  <Progress value={completionPct} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">{completionPct}% aller Felder ausgefüllt</div>
                </div>
              </CardHeader>
            </Card>

            {/* Fields */}
            <Card>
              <CardContent className="space-y-5 p-6">
                {fields.map((f) => (
                  <FieldRenderer
                    key={f.id}
                    field={f}
                    value={values[f.id]}
                    onChange={(v) => setValues((prev) => ({ ...prev, [f.id]: v }))}
                    error={clientErrors[f.id] ?? null}
                    lang={lang}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Save / Submit bar */}
            <Card>
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {canSave ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Alle Pflichtfelder gefüllt — bereit zur Ablage.
                    </>
                  ) : (
                    <>
                      <span className="text-amber-600">Noch {requiredTotal - requiredFilled} Pflichtfelder offen.</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => saveDraft.mutate()}
                    disabled={!canSave || saveDraft.isPending}
                    data-testid="save-draft"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {saveDraft.isPending ? 'Speichert…' : 'Als Entwurf speichern'}
                  </Button>
                  <Button disabled className="bg-blue-700 text-white">
                    <Send className="w-4 h-4 mr-1" /> Zur Einreichung (folgt)
                  </Button>
                </div>
              </CardContent>
              {saveDraft.data && (
                <div className="px-4 pb-4 text-xs text-green-700 flex items-center gap-1">
                  <FileCheck className="w-3 h-3" /> Entwurf gespeichert: <code>{saveDraft.data.id}</code>
                </div>
              )}
              {saveDraft.error && (
                <div className="px-4 pb-4 text-xs text-red-700">
                  Fehler: {saveDraft.error.message}
                  {serverErrors.length > 0 && (
                    <ul className="mt-1 ml-4 list-disc">
                      {serverErrors.map((e) => <li key={e}>{e}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </Card>
          </>
        )}
      </section>
    </div>
  );
}

function hasValue(v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'number') return Number.isFinite(v);
  return true;
}
