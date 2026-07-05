import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, BookOpen, ChevronDown } from '@/components/icons';
import { cn } from '@/lib/utils';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'number'
  | 'checkbox'
  | 'radio';

export interface PresetOption {
  value: string;
  label: { de: string; en: string };
  readonly?: boolean;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: { de: string; en: string };
  must: boolean;
  regulatory_ref?: string;
  helpText?: { de: string; en: string };
  presetOptions?: PresetOption[];
  prefill?: { table: 'tenants' | 'projects' | 'user'; field: string };
  placeholder?: { de: string; en: string };
  min?: number;
  max?: number;
  validation?: { pattern?: string; message?: { de: string; en: string } };
}

export interface LanguageCtx {
  language: 'de' | 'en';
  t: (key: string) => string;
}

interface FieldRendererProps {
  field: FormField;
  value: unknown;
  onChange: (next: unknown) => void;
  error?: string | null;
  lang: LanguageCtx;
}

/** MUST badge — small regulatory marker. */
function MustBadge({ field, lang }: { field: FormField; lang: LanguageCtx }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {field.must && (
        <Badge className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5">
          {lang.t('form.required') ?? 'MUST'}
        </Badge>
      )}
      {field.regulatory_ref && (
        <span
          className="inline-flex items-center gap-1 text-[10px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 border border-gray-200 dark:border-gray-700"
          title={`Regulatorische Referenz: ${field.regulatory_ref}`}
        >
          <BookOpen className="w-3 h-3" />
          {field.regulatory_ref}
        </span>
      )}
    </span>
  );
}

/** Helper to flatten repeated strings / preset text into a textarea default. */
function presetString(v: unknown): string {
  if (v === undefined || v === null) return '';
  if (Array.isArray(v)) return v.join('\n');
  if (typeof v === 'string') return v;
  return String(v);
}

/** FieldRenderer — a single field. */
export function FieldRenderer({ field, value, onChange, error, lang }: FieldRendererProps) {
  const label = field.label[lang.language];
  const ph = field.placeholder?.[lang.language];
  const help = field.helpText?.[lang.language];

  // Render by type.
  const control = (() => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={(value as string) ?? ''}
            placeholder={ph}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
            data-testid={`field-${field.id}`}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value === undefined || value === null ? '' : String(value)}
            placeholder={ph}
            min={field.min}
            max={field.max}
            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
            aria-invalid={!!error}
            data-testid={`field-${field.id}`}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
            data-testid={`field-${field.id}`}
          />
        );
      case 'textarea':
        return (
          <div className="space-y-2">
            <Textarea
              value={presetString(value)}
              placeholder={ph}
              rows={4}
              onChange={(e) => onChange(e.target.value)}
              aria-invalid={!!error}
              data-testid={`field-${field.id}`}
            />
            {field.presetOptions && field.presetOptions.length > 0 && (
              <PresetChips
                options={field.presetOptions}
                onPick={(preset) => {
                  // If the field is currently empty, insert the preset label; else append.
                  const current = presetString(value);
                  const next = current ? `${current}\n${preset.label[lang.language]}` : preset.label[lang.language];
                  onChange(next);
                }}
              />
            )}
          </div>
        );
      case 'select': {
        const opts = field.presetOptions ?? [];
        const filteredValue = opts.some((o) => o.value === value) ? value : (value ?? '');
        return (
          <select
            className={cn(
              'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring',
              error && 'border-destructive',
            )}
            value={filteredValue as string}
            onChange={(e) => onChange(e.target.value)}
            data-testid={`field-${field.id}`}
          >
            <option value="">{lang.t('form.pleaseSelect') ?? '— bitte wählen —'}</option>
            {opts.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label[lang.language]}
                {opt.readonly ? ' (Standardtext)' : ''}
              </option>
            ))}
          </select>
        );
      }
      case 'multiselect':
        return (
          <MultiSelect
            options={field.presetOptions ?? []}
            value={(value as string[]) ?? []}
            onChange={(next) => onChange(next)}
            placeholder={ph ?? (lang.t('form.multiSelectHint') ?? 'Mehrfachauswahl')}
          />
        );
      case 'radio':
        return (
          <div className="flex flex-wrap gap-3">
            {field.presetOptions?.map((opt) => {
              const checked = value === opt.value;
              return (
                <label key={opt.value} className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md border text-sm cursor-pointer transition-colors',
                  checked ? 'bg-blue-50 border-blue-400 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50',
                )}>
                  <input type="radio" name={field.id} value={opt.value} checked={checked} onChange={() => onChange(opt.value)} />
                  <span>{opt.label[lang.language]}</span>
                  {opt.readonly && <Badge variant="outline" className="text-[9px]">Standardtext</Badge>}
                </label>
              );
            })}
          </div>
        );
      case 'checkbox':
        return (
          <label className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-gray-300"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              data-testid={`field-${field.id}`}
            />
            <div className="flex-1">
              <div className="text-sm text-gray-900 dark:text-gray-100">{label}</div>
              {help && <div className="text-xs text-gray-500 mt-1">{help}</div>}
            </div>
          </label>
        );
    }
  })();

  return (
    <div className="space-y-2">
      {/* Label header — only show the label inline for non-checkbox types */}
      {field.type !== 'checkbox' && (
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Label htmlFor={`field-${field.id}`} className="text-sm font-medium">
            {label}
          </Label>
          <MustBadge field={field} lang={lang} />
        </div>
      )}
      {field.type === 'checkbox' && (
        <div className="flex items-center gap-2 mb-1">
          <MustBadge field={field} lang={lang} />
        </div>
      )}
      {control}
      {help && field.type !== 'checkbox' && (
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">{help}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 inline-flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

/** Chip row of preset text snippets the user can pick from. */
function PresetChips({ options, onPick }: { options: PresetOption[]; onPick: (opt: PresetOption) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="text-[10px] uppercase font-semibold text-gray-500 self-center tracking-wider">Textbausteine:</span>
      {options.map((opt) => (
        <button
          type="button"
          key={opt.value}
          title={opt.readonly ? 'Standardtext (kann übernommen werden)' : 'Vorschlag (anpassbar)'}
          onClick={() => onPick(opt)}
          className="inline-flex items-center gap-1 text-[11px] bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full px-2 py-0.5 border border-blue-200 dark:border-blue-700 transition-colors"
        >
          <ChevronDown className="w-3 h-3 -rotate-90" />
          {opt.label.de}
        </button>
      ))}
    </div>
  );
}

/** Minimal accessible multi-select (chip list with removal). */
function MultiSelect({ options, value, onChange, placeholder }: { options: PresetOption[]; value: string[]; onChange: (next: string[]) => void; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  };
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
        data-testid="multiselect-trigger"
      >
        <span className="truncate text-left">
          {value.length === 0
            ? (placeholder ?? '— bitte wählen —')
            : `${value.length} Eintrag${value.length === 1 ? '' : 'e'} ausgewählt`}
        </span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-md border border-input bg-white dark:bg-gray-900 shadow-lg p-1">
          {options.map((opt) => {
            const selected = value.includes(opt.value);
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => toggle(opt.value)}
                className={cn(
                  'flex w-full items-start gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800',
                  selected && 'bg-blue-50 dark:bg-blue-900/30',
                )}
              >
                <span className={cn('mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border', selected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300')}>
                  {selected ? '✓' : ''}
                </span>
                <span className="flex-1">
                  {opt.label.de}
                  {opt.readonly && <Badge variant="outline" className="ml-2 text-[9px] align-middle">Standardtext</Badge>}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((v) => {
            const opt = options.find((o) => o.value === v);
            if (!opt) return null;
            return (
              <span key={v} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5">
                {opt.label.de}
                <button type="button" onClick={() => toggle(v)} className="hover:text-red-600">×</button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
