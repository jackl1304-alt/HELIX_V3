/**
 * Formular-Assistent — Master-Katalog rechtssicherer Vorlagen.
 *
 * Single source of truth for the Formular-Assistent feature. Each entry defines:
 *  - id / category / destination table (`dest.table`)
 *  - jurisdiction (FDA / MDR / ISO 13485 / ISO 14971 / IEC 62304)
 *  - fields[] : UI-ready schema with MUST markers, regulatory refs, and preset options
 *
 * Pre-fill rules are deterministic (no LLM) so the resulting documents are
 * audit-safe: every pre-filled value traces to either (a) hardcoded legal text
 * or (b) a row in the tenant's existing DB tables (project, tenant, device).
 *
 * Rules for adding a new field:
 *  - `must: true` is the default — DO NOT change without legal review.
 *  - `regulatory_ref` MUST cite the exact clause (e.g. "MDR 2017/745 Annex II §1.1(c)").
 *  - `presetOptions` are the regulator-acceptable wordings the user MUST pick from.
 *  - `prefill` needs three keys: { table: 'projects'|'tenants'|'user', field: 'colName' }.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'number'
  | 'checkbox'
  | 'radio';

export interface FormField {
  id: string;
  type: FieldType;
  label: { de: string; en: string };
  must: boolean;
  regulatory_ref?: string;
  helpText?: { de: string; en: string };
  presetOptions?: { value: string; label: { de: string; en: string }; readonly?: boolean }[];
  prefill?: { table: 'tenants' | 'projects' | 'user'; field: string };
  placeholder?: { de: string; en: string };
  min?: number;
  max?: number;
  validation?: {
    pattern?: string;
    message?: { de: string; en: string };
  };
}

export interface FormTemplate {
  id: string;
  category: 'mdr' | 'fda' | 'iso13485' | 'iso14971' | 'iec62304';
  jurisdiction: string;
  /** Stable identifier of the destination DB table (or 'project_charta_documents' as fallback for FDA 510(k)). */
  destinationTable:
    | 'project_charta_documents'
    | 'requirements_specifications'
    | 'risk_analysis_records'
    | 'conformity_declarations'
    | 'non_conformity_reports';
  title: { de: string; en: string };
  subtitle: { de: string; en: string };
  legalBasis: string;
  fields: FormField[];
}

// ----------------------------------------------------------------------------
// 1. Projektauftrag / Project Charter (MDR + ISO 13485 §4.2.4)
// ----------------------------------------------------------------------------
export const FORM_PROJECT_CHARTER: FormTemplate = {
  id: 'project-charter',
  category: 'iso13485',
  jurisdiction: 'EU + Global (ISO 13485 / MDR)',
  destinationTable: 'project_charta_documents',
  title: {
    de: 'Projektauftrag (Project Charter)',
    en: 'Project Charter',
  },
  subtitle: {
    de: 'MDR/ISO 13485 Deliverable — definiert Umfang, Ziele und Verantwortlichkeiten',
    en: 'MDR/ISO 13485 deliverable — defines scope, objectives, responsibilities',
  },
  legalBasis: 'ISO 13485:2016 §4.2.4 · MDR 2017/745 Anhang II §1.1',
  fields: [
    {
      id: 'title',
      type: 'text',
      label: { de: 'Projekttitel', en: 'Project title' },
      must: true,
      regulatory_ref: 'ISO 13485 §4.2.4 a)',
      prefill: { table: 'projects', field: 'name' },
      placeholder: { de: 'z.B. CardioSense 2.0 — FDA 510(k) Submission', en: 'e.g. CardioSense 2.0 — FDA 510(k) submission' },
    },
    {
      id: 'projectNumber',
      type: 'text',
      label: { de: 'Projektnummer', en: 'Project number' },
      must: true,
      regulatory_ref: 'ISO 13485 §7.5.2',
      prefill: { table: 'projects', field: 'id' },
      helpText: {
        de: 'Eindeutige Kennung — wird in jeder MDR-Lieferakte referenziert.',
        en: 'Unique identifier — referenced in every MDR deliverable.',
      },
    },
    {
      id: 'customer',
      type: 'text',
      label: { de: 'Auftraggeber / Kunde', en: 'Customer / Sponsor' },
      must: true,
      prefill: { table: 'tenants', field: 'name' },
    },
    {
      id: 'projectLead',
      type: 'text',
      label: { de: 'Projektleitung', en: 'Project lead' },
      must: true,
      regulatory_ref: 'ISO 13485 §6.1',
      prefill: { table: 'user', field: 'name' },
    },
    {
      id: 'engineers',
      type: 'multiselect',
      label: { de: 'Projektteam', en: 'Project team' },
      must: false,
      helpText: {
        de: 'Ein Komma-getrennter Eintrag pro Verantwortlichen.',
        en: 'One comma-separated entry per owner.',
      },
    },
    {
      id: 'startDate',
      type: 'date',
      label: { de: 'Projektstart', en: 'Start date' },
      must: true,
      regulatory_ref: 'ISO 13485 §4.2.4 b)',
    },
    {
      id: 'endDate',
      type: 'date',
      label: { de: 'Geplantes Ende', en: 'Planned end date' },
      must: true,
    },
    {
      id: 'budget',
      type: 'number',
      label: { de: 'Budget (EUR)', en: 'Budget (EUR)' },
      must: true,
      min: 0,
      validation: { pattern: '^\\d+(\\.\\d{1,2})?$', message: { de: 'Bitte EUR-Betrag eingeben', en: 'Enter EUR amount' } },
    },
    {
      id: 'deviceType',
      type: 'select',
      label: { de: 'Produkttyp', en: 'Device type' },
      must: true,
      regulatory_ref: 'MDR 2017/745 Anhang VIII',
      presetOptions: [
        { value: 'active-implantable', label: { de: 'Aktives implantierbares Medizinprodukt', en: 'Active implantable medical device' }, readonly: true },
        { value: 'md-class-i', label: { de: 'Medizinprodukt Klasse I', en: 'Medical device class I' }, readonly: true },
        { value: 'md-class-iia', label: { de: 'Medizinprodukt Klasse IIa', en: 'Medical device class IIa' }, readonly: true },
        { value: 'md-class-iib', label: { de: 'Medizinprodukt Klasse IIb', en: 'Medical device class IIb' }, readonly: true },
        { value: 'md-class-iii', label: { de: 'Medizinprodukt Klasse III', en: 'Medical device class III' }, readonly: true },
        { value: 'ivd', label: { de: 'In-vitro-Diagnostikum', en: 'In-vitro diagnostic (IVD)' }, readonly: true },
        { value: 'samd', label: { de: 'Software as a Medical Device (SaMD)', en: 'Software as a Medical Device (SaMD)' }, readonly: true },
      ],
    },
    {
      id: 'objectives',
      type: 'textarea',
      label: { de: 'Projektziele', en: 'Project objectives' },
      must: true,
      regulatory_ref: 'ISO 13485 §4.2.4 c)',
      presetOptions: [
        { value: 'ce-mark', label: { de: 'Erst-CE-Kennzeichnung des Produkts', en: 'First-time CE marking of the device' }, readonly: true },
        { value: '510k', label: { de: 'FDA 510(k) Clearance', en: 'FDA 510(k) clearance' }, readonly: true },
        { value: 'pma', label: { de: 'FDA Premarket Approval (PMA)', en: 'FDA premarket approval (PMA)' }, readonly: true },
        { value: 'iso13485-cert', label: { de: 'ISO 13485:2016 Erstzertifizierung', en: 'Initial ISO 13485:2016 certification' }, readonly: true },
      ],
    },
    {
      id: 'successCriteria',
      type: 'textarea',
      label: { de: 'Erfolgskriterien', en: 'Success criteria' },
      must: true,
      regulatory_ref: 'ISO 13485 §4.2.4 d)',
      presetOptions: [
        { value: 'regulatory', label: { de: 'Erhalt der regulatorischen Genehmigung im Zielmarkt', en: 'Receipt of regulatory clearance in target market' }, readonly: true },
        { value: 'clinical', label: { de: 'Erfolgreich abgeschlossene Klinische Bewertung', en: 'Successfully completed clinical evaluation' }, readonly: true },
        { value: 'qms', label: { de: 'Erfolgreich abgeschlossenes QMS-Audit', en: 'Successfully completed QMS audit' }, readonly: true },
      ],
    },
    {
      id: 'signatureDate',
      type: 'date',
      label: { de: 'Datum der Unterzeichnung', en: 'Signature date' },
      must: true,
      regulatory_ref: 'ISO 13485 §4.2.4',
    },
  ],
};

// ----------------------------------------------------------------------------
// 2. Anforderungsspezifikation (IEC 62304 + ISO 13485 §4.2.3)
// ----------------------------------------------------------------------------
export const FORM_REQUIREMENTS_SPEC: FormTemplate = {
  id: 'requirements-spec',
  category: 'iec62304',
  jurisdiction: 'EU + Global (IEC 62304 / ISO 13485)',
  destinationTable: 'requirements_specifications',
  title: {
    de: 'Anforderungsspezifikation',
    en: 'Requirements Specification',
  },
  subtitle: {
    de: 'IEC 62304 + ISO 13485 — funktionale, nicht-funktionale und regulatorische Anforderungen',
    en: 'IEC 62304 + ISO 13485 — functional, non-functional and regulatory requirements',
  },
  legalBasis: 'IEC 62304:2006+AMD1:2015 §5.2 · ISO 13485:2016 §4.2.3',
  fields: [
    {
      id: 'requirementId',
      type: 'text',
      label: { de: 'Anforderungs-ID', en: 'Requirement ID' },
      must: true,
      regulatory_ref: 'IEC 62304 §5.2.1',
      placeholder: { de: 'z.B. REQ-001', en: 'e.g. REQ-001' },
    },
    {
      id: 'category',
      type: 'select',
      label: { de: 'Kategorie', en: 'Category' },
      must: true,
      regulatory_ref: 'IEC 62304 §5.2.2',
      presetOptions: [
        { value: 'functional', label: { de: 'Funktional', en: 'Functional' }, readonly: true },
        { value: 'non-functional', label: { de: 'Nicht-funktional', en: 'Non-functional' }, readonly: true },
        { value: 'regulatory', label: { de: 'Regulatorisch', en: 'Regulatory' }, readonly: true },
        { value: 'safety', label: { de: 'Sicherheit (IEC 62304 §5.2.6)', en: 'Safety (IEC 62304 §5.2.6)' }, readonly: true },
        { value: 'security', label: { de: 'Cybersicherheit', en: 'Cybersecurity' }, readonly: true },
      ],
    },
    {
      id: 'priority',
      type: 'radio',
      label: { de: 'Priorität', en: 'Priority' },
      must: true,
      regulatory_ref: 'IEC 62304 §5.2.4',
      presetOptions: [
        { value: 'must', label: { de: 'MUST — Pflicht', en: 'MUST — Mandatory' }, readonly: true },
        { value: 'should', label: { de: 'SHOULD — Empfohlen', en: 'SHOULD — Recommended' }, readonly: true },
        { value: 'could', label: { de: 'COULD — Nice-to-have', en: 'COULD — Nice-to-have' }, readonly: true },
      ],
    },
    {
      id: 'description',
      type: 'textarea',
      label: { de: 'Beschreibung', en: 'Description' },
      must: true,
      regulatory_ref: 'IEC 62304 §5.2.5',
      presetOptions: [
        { value: 'shall-detect', label: { de: 'Das System MUSS [Spezifikation] erkennen und melden.', en: 'The system SHALL detect and report [specification].' }, readonly: false },
        { value: 'shall-log', label: { de: 'Das System MUSS [Ereignis] revisionssicher protokollieren (ISO 13485 §8.2.2).', en: 'The system SHALL record [event] in an audit-proof log (ISO 13485 §8.2.2).' }, readonly: false },
      ],
      helpText: {
        de: 'MUSS in "Das System MUSS …" formuliert sein (IEC 62304 §5.2.5).',
        en: 'Must be phrased as "The system SHALL …" (IEC 62304 §5.2.5).',
      },
    },
    {
      id: 'source',
      type: 'text',
      label: { de: 'Quelle', en: 'Source' },
      must: false,
      helpText: { de: 'Regulatorische Quelle oder Stakeholder-Anfrage', en: 'Regulatory source or stakeholder request' },
    },
    {
      id: 'riskLinks',
      type: 'multiselect',
      label: { de: 'Verknüpfte Risiken', en: 'Linked risks' },
      must: false,
      helpText: { de: 'Risk-IDs aus dem ISO 14971 Risikomanagement', en: 'Risk IDs from the ISO 14971 risk management file' },
    },
    {
      id: 'verificationMethod',
      type: 'select',
      label: { de: 'Verifikationsmethode', en: 'Verification method' },
      must: true,
      regulatory_ref: 'IEC 62304 §5.7',
      presetOptions: [
        { value: 'inspection', label: { de: 'Inspektion', en: 'Inspection' }, readonly: true },
        { value: 'analysis', label: { de: 'Analyse', en: 'Analysis' }, readonly: true },
        { value: 'test', label: { de: 'Test', en: 'Test' }, readonly: true },
        { value: 'simulation', label: { de: 'Simulation', en: 'Simulation' }, readonly: true },
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// 3. Risikoanalyse (ISO 14971:2019)
// ----------------------------------------------------------------------------
export const FORM_RISK_ANALYSIS: FormTemplate = {
  id: 'risk-analysis',
  category: 'iso14971',
  jurisdiction: 'EU + Global (ISO 14971)',
  destinationTable: 'risk_analysis_records',
  title: {
    de: 'Risikoanalyse (ISO 14971)',
    en: 'Risk Analysis (ISO 14971)',
  },
  subtitle: {
    de: 'Hazard → Hazardous Situation → Harm mit Severity × Probability',
    en: 'Hazard → hazardous situation → harm with severity × probability',
  },
  legalBasis: 'ISO 14971:2019 §5.4 · ISO/TR 24971:2020',
  fields: [
    {
      id: 'riskId',
      type: 'text',
      label: { de: 'Risiko-ID', en: 'Risk ID' },
      must: true,
      placeholder: { de: 'z.B. RISK-007', en: 'e.g. RISK-007' },
    },
    {
      id: 'hazard',
      type: 'textarea',
      label: { de: 'Gefahr (Hazard)', en: 'Hazard' },
      must: true,
      regulatory_ref: 'ISO 14971 §5.4 a)',
      presetOptions: [
        { value: 'energy', label: { de: 'Abgabe gefährlicher Energie (IED 60601-1)', en: 'Release of hazardous energy (IEC 60601-1)' }, readonly: false },
        { value: 'wrong-dose', label: { de: 'Falsche Dosierung / Dosierungsmenge', en: 'Wrong dosage / overdose / underdose' }, readonly: false },
        { value: 'infection', label: { de: 'Infektionsrisiko durch Kontamination', en: 'Infection risk via contamination' }, readonly: false },
      ],
    },
    {
      id: 'hazardousSituation',
      type: 'textarea',
      label: { de: 'Gefährdungssituation', en: 'Hazardous situation' },
      must: true,
      regulatory_ref: 'ISO 14971 §5.4 b)',
    },
    {
      id: 'harm',
      type: 'textarea',
      label: { de: 'Möglicher Schaden (Harm)', en: 'Possible harm' },
      must: true,
      regulatory_ref: 'ISO 14971 §5.4 c)',
      presetOptions: [
        { value: 'injury', label: { de: 'Verletzung des Patienten oder Anwenders', en: 'Injury to patient or operator' }, readonly: false },
        { value: 'death', label: { de: 'Tod', en: 'Death' }, readonly: true },
        { value: 'data-leak', label: { de: 'Verlust oder Veröffentlichung von Patientendaten', en: 'Loss or disclosure of patient data' }, readonly: false },
      ],
    },
    {
      id: 'severity',
      type: 'select',
      label: { de: 'Schweregrad (Severity)', en: 'Severity' },
      must: true,
      regulatory_ref: 'ISO 14971 Anhang C',
      presetOptions: [
        { value: '5', label: { de: '5 — Katastrophal (Tod)', en: '5 — Catastrophic (death)' }, readonly: true },
        { value: '4', label: { de: '4 — Kritisch (irreversible Schädigung)', en: '4 — Critical (irreversible injury)' }, readonly: true },
        { value: '3', label: { de: '3 — Ernst (reversible, ärztliche Hilfe)', en: '3 — Serious (reversible, medical intervention)' }, readonly: true },
        { value: '2', label: { de: '2 — Gering (kurzzeitige Beschwerden)', en: '2 — Minor (transient discomfort)' }, readonly: true },
        { value: '1', label: { de: '1 — Vernachlässigbar', en: '1 — Negligible' }, readonly: true },
      ],
    },
    {
      id: 'probability',
      type: 'select',
      label: { de: 'Wahrscheinlichkeit (Probability)', en: 'Probability' },
      must: true,
      regulatory_ref: 'ISO 14971 Anhang D',
      presetOptions: [
        { value: '5', label: { de: '5 — Häufig (≥ 1 / 1 000)', en: '5 — Frequent (≥ 1 / 1 000)' }, readonly: true },
        { value: '4', label: { de: '4 — Gelegentlich (1 / 10 000)', en: '4 — Occasional (1 / 10 000)' }, readonly: true },
        { value: '3', label: { de: '3 — Selten (1 / 100 000)', en: '3 — Rare (1 / 100 000)' }, readonly: true },
        { value: '2', label: { de: '2 — Unwahrscheinlich (1 / 1 000 000)', en: '2 — Improbable (1 / 1 000 000)' }, readonly: true },
        { value: '1', label: { de: '1 — Unmöglich', en: '1 — Incredible' }, readonly: true },
      ],
    },
    {
      id: 'riskAcceptance',
      type: 'select',
      label: { de: 'Akzeptanzkriterium', en: 'Acceptance criterion' },
      must: true,
      regulatory_ref: 'ISO 14971 §6.4',
      presetOptions: [
        { value: 'acceptable', label: { de: 'Akzeptabel — keine Maßnahme erforderlich', en: 'Acceptable — no action required' }, readonly: true },
        { value: 'alarp', label: { de: 'ALARP — so weit wie vernünftigerweise praktikabel reduzieren', en: 'ALARP — as low as reasonably practicable' }, readonly: true },
        { value: 'unacceptable', label: { de: 'Nicht akzeptabel — Konstruktionsänderung erforderlich', en: 'Unacceptable — design change required' }, readonly: true },
      ],
    },
    {
      id: 'mitigationMeasures',
      type: 'textarea',
      label: { de: 'Risikominderungsmaßnahmen', en: 'Risk mitigation measures' },
      must: true,
      regulatory_ref: 'ISO 14971 §7.1',
      helpText: {
        de: 'Mindestens eine inhärente Sicherheitsmaßnahme (Design), eine Schutzmaßnahme (Produktion) und eine Information (Kennzeichnung) gemäß ISO 14971 §7.1 — Priority-Reihenfolge einhalten.',
        en: 'At least one inherent safety measure (design), one protective measure (production) and one information (labelling) per ISO 14971 §7.1 — keep priority order.',
      },
      presetOptions: [
        { value: 'inherent', label: { de: 'Inhärente Sicherheit durch Design: [Maßnahme]', en: 'Inherent safety by design: [measure]' }, readonly: false },
        { value: 'protective', label: { de: 'Schutzmaßnahme in Produktion/Anwendung: [Maßnahme]', en: 'Protective measure in production/use: [measure]' }, readonly: false },
        { value: 'information', label: { de: 'Information für Anwender (Kennzeichnung, Schulung): [Maßnahme]', en: 'Information for users (label, training): [measure]' }, readonly: false },
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// 4. Konformitätserklärung (MDR 2017/745 Anhang IV)
// ----------------------------------------------------------------------------
export const FORM_CONFORMITY_DECLARATION: FormTemplate = {
  id: 'conformity-declaration',
  category: 'mdr',
  jurisdiction: 'EU (MDR 2017/745)',
  destinationTable: 'conformity_declarations',
  title: {
    de: 'EU-Konformitätserklärung',
    en: 'EU Declaration of Conformity',
  },
  subtitle: {
    de: 'MDR 2017/745 Anhang IV — Pflichtinhalte vor Unterzeichnung vollständig ausfüllen',
    en: 'MDR 2017/745 Annex IV — required content before signing',
  },
  legalBasis: 'MDR 2017/745 Anhang IV · VERORDNUNG (EU) 2023/607 (Übergangsfristen)',
  fields: [
    {
      id: 'manufacturerName',
      type: 'text',
      label: { de: 'Name des Herstellers', en: 'Manufacturer name' },
      must: true,
      regulatory_ref: 'MDR Anhang IV §1',
      prefill: { table: 'tenants', field: 'name' },
    },
    {
      id: 'manufacturerAddress',
      type: 'textarea',
      label: { de: 'Anschrift des Herstellers (Eingetragene Niederlassung)', en: 'Manufacturer registered address' },
      must: true,
      regulatory_ref: 'MDR Anhang IV §1',
      prefill: { table: 'tenants', field: 'address' },
    },
    {
      id: 'productName',
      type: 'text',
      label: { de: 'Produktname / Handelsname', en: 'Product / trade name' },
      must: true,
      regulatory_ref: 'MDR Anhang IV §2',
      prefill: { table: 'projects', field: 'name' },
    },
    {
      id: 'riskClass',
      type: 'select',
      label: { de: 'Risikoklasse', en: 'Risk class' },
      must: true,
      regulatory_ref: 'MDR Anhang VIII',
      presetOptions: [
        { value: 'I', label: { de: 'Klasse I', en: 'Class I' }, readonly: true },
        { value: 'IIa', label: { de: 'Klasse IIa', en: 'Class IIa' }, readonly: true },
        { value: 'IIb', label: { de: 'Klasse IIb', en: 'Class IIb' }, readonly: true },
        { value: 'III', label: { de: 'Klasse III', en: 'Class III' }, readonly: true },
      ],
    },
    {
      id: 'basicUdi',
      type: 'text',
      label: { de: 'Basic UDI-DI', en: 'Basic UDI-DI' },
      must: true,
      regulatory_ref: 'MDR Anhang VI Teil C',
      validation: { pattern: '^[A-Z0-9-]{6,}$', message: { de: 'Basic UDI-DI muss mindestens 6 alphanumerische Zeichen enthalten', en: 'Basic UDI-DI must contain at least 6 alphanumeric chars' } },
    },
    {
      id: 'appliedStandards',
      type: 'multiselect',
      label: { de: 'Angewandte harmonisierte Normen', en: 'Applied harmonised standards' },
      must: true,
      regulatory_ref: 'MDR Anhang IV §3',
      presetOptions: [
        { value: 'iso13485', label: { de: 'EN ISO 13485:2016/A11:2021', en: 'EN ISO 13485:2016/A11:2021' }, readonly: true },
        { value: 'iso14971', label: { de: 'EN ISO 14971:2019/A11:2021', en: 'EN ISO 14971:2019/A11:2021' }, readonly: true },
        { value: 'iec62304', label: { de: 'IEC 62304:2006+AMD1:2015', en: 'IEC 62304:2006+AMD1:2015' }, readonly: true },
        { value: 'iec60601-1', label: { de: 'IEC 60601-1:2005+AMD1:2012+AMD2:2020', en: 'IEC 60601-1:2005+AMD1:2012+AMD2:2020' }, readonly: true },
        { value: 'iec62366-1', label: { de: 'IEC 62366-1:2015+AMD1:2020', en: 'IEC 62366-1:2015+AMD1:2020' }, readonly: true },
        { value: 'iso10993-1', label: { de: 'ISO 10993-1:2018', en: 'ISO 10993-1:2018' }, readonly: true },
      ],
    },
    {
      id: 'notifiedBodyId',
      type: 'text',
      label: { de: 'Benannte Stelle (Kennnummer)', en: 'Notified body (ID)' },
      must: true,
      regulatory_ref: 'MDR Anhang IV §4',
      placeholder: { de: 'z.B. 0123 — TÜV SÜD Product Service GmbH', en: 'e.g. 0123 — TÜV SÜD Product Service GmbH' },
      validation: { pattern: '^\\d{4}$', message: { de: '4-stellige Kennnummer der Benannten Stelle', en: '4-digit notified body ID' } },
    },
    {
      id: 'ceMarkDate',
      type: 'date',
      label: { de: 'CE-Kennzeichnung Datum', en: 'CE mark date' },
      must: true,
      regulatory_ref: 'MDR Anhang IV §5',
    },
    {
      id: 'signatoryName',
      type: 'text',
      label: { de: 'Unterzeichner (Name)', en: 'Signatory name' },
      must: true,
      regulatory_ref: 'MDR Anhang IV §6',
      prefill: { table: 'user', field: 'name' },
    },
    {
      id: 'signatoryTitle',
      type: 'text',
      label: { de: 'Funktion des Unterzeichners', en: 'Signatory function' },
      must: true,
      regulatory_ref: 'MDR Anhang IV §6',
      presetOptions: [
        { value: 'ceo', label: { de: 'Geschäftsführer / CEO', en: 'CEO / Managing Director' }, readonly: true },
        { value: 'prrc', label: { de: 'PRRC (Person Responsible for Regulatory Compliance)', en: 'PRRC (Person Responsible for Regulatory Compliance)' }, readonly: true },
        { value: 'qm', label: { de: 'Qualitätsmanagement-Beauftragter (QMB)', en: 'Quality Manager (QM)' }, readonly: true },
      ],
    },
    {
      id: 'signatureDate',
      type: 'date',
      label: { de: 'Ort und Datum der Unterzeichnung', en: 'Place and date of signature' },
      must: true,
      regulatory_ref: 'MDR Anhang IV §6',
    },
  ],
};

// ----------------------------------------------------------------------------
// 5. NCR / CAPA-Bericht (ISO 13485 §8.3 — Nichtkonformität + Korrekturmaßnahme)
// ----------------------------------------------------------------------------
export const FORM_NCR_CAPA: FormTemplate = {
  id: 'ncr-capa',
  category: 'iso13485',
  jurisdiction: 'EU + Global (ISO 13485 §8.3)',
  destinationTable: 'non_conformity_reports',
  title: {
    de: 'NCR / CAPA-Bericht',
    en: 'Non-Conformity Report / CAPA',
  },
  subtitle: {
    de: 'ISO 13485 §8.3 — Korrektur- und Vorbeugemaßnahmen für Nichtkonformitäten',
    en: 'ISO 13485 §8.3 — corrective and preventive actions for non-conformities',
  },
  legalBasis: 'ISO 13485:2016 §8.3 · ISO 9001:2015 §10.2',
  fields: [
    {
      id: 'ncrNumber',
      type: 'text',
      label: { de: 'NCR-Nummer', en: 'NCR number' },
      must: true,
      regulatory_ref: 'ISO 13485 §8.3.2 a)',
      placeholder: { de: 'NCR-2026-001', en: 'NCR-2026-001' },
    },
    {
      id: 'detectionDate',
      type: 'date',
      label: { de: 'Datum der Erkennung', en: 'Detection date' },
      must: true,
      regulatory_ref: 'ISO 13485 §8.3.2 b)',
    },
    {
      id: 'detectedBy',
      type: 'text',
      label: { de: 'Erkannt durch', en: 'Detected by' },
      must: true,
      prefill: { table: 'user', field: 'name' },
    },
    {
      id: 'description',
      type: 'textarea',
      label: { de: 'Beschreibung der Nichtkonformität', en: 'Non-conformity description' },
      must: true,
      regulatory_ref: 'ISO 13485 §8.3.2 c)',
      helpText: {
        de: 'Was genau ist passiert? Welches Produkt / welcher Prozess ist betroffen? Welche Daten / Aufzeichnungen belegen die Abweichung?',
        en: 'What exactly happened, which product or process is affected, what data / records document the deviation?',
      },
    },
    {
      id: 'affectedProductProcess',
      type: 'textarea',
      label: { de: 'Betroffenes Produkt / Prozess', en: 'Affected product / process' },
      must: true,
    },
    {
      id: 'immediateAction',
      type: 'textarea',
      label: { de: 'Sofortmaßnahme', en: 'Immediate action' },
      must: true,
      regulatory_ref: 'ISO 13485 §8.3.3 a)',
      helpText: {
        de: 'Maßnahme zur sofortigen Eingrenzung — z.B. Sperrung der Charge, Kundeninformation, Rückruf.',
        en: 'Action to immediately contain — e.g. lot hold, customer notification, recall.',
      },
    },
    {
      id: 'rootCauseAnalysis',
      type: 'select',
      label: { de: 'Methode der Ursachenanalyse', en: 'Root cause analysis method' },
      must: true,
      regulatory_ref: 'ISO 13485 §8.3.3 b)',
      presetOptions: [
        { value: '5why', label: { de: '5-Why-Analyse', en: '5-Why analysis' }, readonly: true },
        { value: 'ishikawa', label: { de: 'Ishikawa (Fischgrät)', en: 'Ishikawa (fishbone)' }, readonly: true },
        { value: 'fmea', label: { de: 'FMEA (Failure Mode & Effects Analysis)', en: 'FMEA' }, readonly: true },
        { value: 'fault-tree', label: { de: 'Fault Tree Analysis (FTA)', en: 'Fault Tree Analysis (FTA)' }, readonly: true },
      ],
    },
    {
      id: 'rootCause',
      type: 'textarea',
      label: { de: 'Identifizierte Ursache', en: 'Identified root cause' },
      must: true,
      regulatory_ref: 'ISO 13485 §8.3.3 b)',
    },
    {
      id: 'correctionAction',
      type: 'textarea',
      label: { de: 'Korrekturmaßnahme', en: 'Correction action' },
      must: true,
      regulatory_ref: 'ISO 13485 §8.3.3 c)',
    },
    {
      id: 'preventionAction',
      type: 'textarea',
      label: { de: 'Vorbeugemaßnahme', en: 'Prevention action' },
      must: true,
      regulatory_ref: 'ISO 13485 §8.3.4',
      helpText: {
        de: 'Maßnahme zur Verhinderung der Wiederholung an der Quelle.',
        en: 'Action to prevent recurrence at the source.',
      },
    },
    {
      id: 'responsiblePerson',
      type: 'text',
      label: { de: 'Verantwortlich', en: 'Responsible person' },
      must: true,
    },
    {
      id: 'targetCloseoutDate',
      type: 'date',
      label: { de: 'Ziel-Datum Wirksamkeitsnachweis', en: 'Target closeout date' },
      must: true,
    },
  ],
};

// ----------------------------------------------------------------------------
// 6. FDA 510(k) Cover Sheet
// ----------------------------------------------------------------------------
export const FORM_FDA_510K: FormTemplate = {
  id: 'fda-510k',
  category: 'fda',
  jurisdiction: 'USA (FDA 21 CFR Part 807)',
  destinationTable: 'project_charta_documents', // Reuse: stored as a "submission project" with [FDA 510(k)] title prefix
  title: {
    de: 'FDA 510(k) Premarket Notification — Cover Sheet',
    en: 'FDA 510(k) Premarket Notification — Cover Sheet',
  },
  subtitle: {
    de: 'FDA Form 3514 — Kernangaben vor Einreichung erforderlich',
    en: 'FDA Form 3514 — core data required before submission',
  },
  legalBasis: '21 CFR Part 807 Subpart E · FDA Form 3514 (Version 2020)',
  fields: [
    {
      id: 'submitterName',
      type: 'text',
      label: { de: 'Einreichender (Antragsteller)', en: 'Submitter name' },
      must: true,
      regulatory_ref: '21 CFR 807.20 (a)(1)',
      prefill: { table: 'tenants', field: 'name' },
    },
    {
      id: 'kNumber',
      type: 'text',
      label: { de: '510(k)-Nummer', en: '510(k) number' },
      must: true,
      regulatory_ref: '21 CFR 807.20 (b)',
      validation: { pattern: '^K\\d{6}$', message: { de: 'Format: K + 6 Ziffern (z.B. K231234)', en: 'Format: K + 6 digits (e.g. K231234)' } },
    },
    {
      id: 'deviceName',
      type: 'text',
      label: { de: 'Produkt-/Handelsname', en: 'Device trade name' },
      must: true,
      regulatory_ref: '21 CFR 807.20 (a)(2)',
      prefill: { table: 'projects', field: 'name' },
    },
    {
      id: 'commonName',
      type: 'text',
      label: { de: 'Allgemeine Bezeichnung', en: 'Common / usual name' },
      must: true,
      regulatory_ref: '21 CFR 807.20 (a)(2)',
    },
    {
      id: 'classification',
      type: 'select',
      label: { de: 'FDA-Klassifikation (Class)', en: 'FDA classification (Class)' },
      must: true,
      regulatory_ref: '21 CFR 860',
      presetOptions: [
        { value: 'I', label: { de: 'Klasse I', en: 'Class I' }, readonly: true },
        { value: 'II', label: { de: 'Klasse II', en: 'Class II' }, readonly: true },
        { value: 'III', label: { de: 'Klasse III', en: 'Class III' }, readonly: true },
      ],
    },
    {
      id: 'panelCode',
      type: 'select',
      label: { de: 'FDA Product Code / Panel', en: 'FDA product code / panel' },
      must: true,
      regulatory_ref: 'FDA Product Classification Panel',
      presetOptions: [
        { value: 'cardiovascular', label: { de: 'Cardiovascular Panel', en: 'Cardiovascular panel' }, readonly: true },
        { value: 'orthopedic', label: { de: 'Orthopedic Panel', en: 'Orthopedic panel' }, readonly: true },
        { value: 'general-hospital', label: { de: 'General Hospital Panel', en: 'General hospital panel' }, readonly: true },
        { value: 'radiology', label: { de: 'Radiology Panel', en: 'Radiology panel' }, readonly: true },
        { value: 'neurology', label: { de: 'Neurology Panel', en: 'Neurology panel' }, readonly: true },
        { value: 'anesthesiology', label: { de: 'Anesthesiology Panel', en: 'Anesthesiology panel' }, readonly: true },
      ],
    },
    {
      id: 'predicateDevice510k',
      type: 'multiselect',
      label: { de: 'Predicate Device (510(k)-Nummer + Hersteller)', en: 'Predicate device (510(k) number + manufacturer)' },
      must: true,
      regulatory_ref: '21 CFR 807.92 (a)(3)',
      helpText: {
        de: 'Mindestens ein Predicate Device angeben. K-Nummer + Hersteller erforderlich.',
        en: 'Provide at least one predicate device. K-number + manufacturer required.',
      },
    },
    {
      id: 'substantialEquivalenceStatement',
      type: 'select',
      label: { de: 'Aussage zur wesentlichen Gleichwertigkeit', en: 'Substantial equivalence statement' },
      must: true,
      regulatory_ref: '21 CFR 807.92 (b)',
      presetOptions: [
        { value: 'se-different-tech-no-q', label: { de: 'SE-1: Gleiche Zweckbestimmung + gleiche Technologie — keine Fragen zur Sicherheit/Wirksamkeit', en: 'SE-1: same intended use + same technology — no new questions of safety/effectiveness' }, readonly: true },
        { value: 'se-different-tech-q', label: { de: 'SE-2: Gleiche Zweckbestimmung + andere Technologie — keine neuen Fragen zur Sicherheit/Wirksamkeit', en: 'SE-2: same intended use + different technology — no new questions' }, readonly: true },
        { value: 'se-different-tech-new-q', label: { de: 'SE-3: Andere Zweckbestimmung oder neue Fragen zu Sicherheit/Wirksamkeit — Leistungsdaten erforderlich', en: 'SE-3: different intended use or new questions of safety/effectiveness — performance data required' }, readonly: true },
      ],
    },
    {
      id: 'performanceStandardsClaim',
      type: 'checkbox',
      label: { de: 'Leistungsnorm-Anspruch (Performance Standards Claim)', en: 'Performance standards claim' },
      must: false,
      regulatory_ref: '21 CFR 807.92 (c)',
      helpText: {
        de: 'Falls zutreffend: gemäß Section 514 des FD&C Act.',
        en: 'If applicable: pursuant to Section 514 of the FD&C Act.',
      },
    },
    {
      id: 'truthfulStatement',
      type: 'checkbox',
      label: {
        de: 'Ich versichere hiermit, dass die Angaben in dieser Einreichung wahrheitsgemäß und korrekt sind (21 CFR 807.87 (k)).',
        en: 'I certify that the information in this submission is truthful and accurate (21 CFR 807.87 (k)).',
      },
      must: true,
      regulatory_ref: '21 CFR 807.87 (k)',
    },
    {
      id: 'submitterSignatureDate',
      type: 'date',
      label: { de: 'Datum der Unterzeichnung', en: 'Signature date' },
      must: true,
      regulatory_ref: '21 CFR 807.87',
    },
  ],
};

// ----------------------------------------------------------------------------
// Katalog
// ----------------------------------------------------------------------------
export const FORM_CATALOG: FormTemplate[] = [
  FORM_PROJECT_CHARTER,
  FORM_REQUIREMENTS_SPEC,
  FORM_RISK_ANALYSIS,
  FORM_CONFORMITY_DECLARATION,
  FORM_NCR_CAPA,
  FORM_FDA_510K,
];

export function getFormById(id: string): FormTemplate | undefined {
  return FORM_CATALOG.find((f) => f.id === id);
}
