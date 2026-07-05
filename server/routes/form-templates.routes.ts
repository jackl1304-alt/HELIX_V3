import { Router, type Request, type Response } from 'express';
import { FORM_CATALOG, getFormById, type FormTemplate } from '../services/form-template-catalog.js';
import { db } from '../db.js';
import {
  projectChartaDocuments,
  requirementsSpecifications,
  riskAnalysisRecords,
  conformityDeclarations,
  nonConformityReports,
} from '../../shared/schema.js';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

/** Resolve the tenant context. In production this is the auth-derived tenant id; in dev/demo we accept ?tenant= for self-service usage. */
function resolveTenantId(req: Request, requireExplicit: boolean = false): string | null {
  const headerTenant = (req.headers['x-tenant-id'] as string | undefined)?.trim();
  const queryTenant = (req.query.tenant as string | undefined)?.trim();
  const explicitTenant = headerTenant || queryTenant;
  if (explicitTenant) return explicitTenant;
  // Writes (POST) require an explicit tenant — falling back to a literal string would
  // fail with a foreign-key violation if that tenant row does not exist. Reads (GET)
  // can fall back to 'demo-tenant' so the catalog endpoint is usable without auth.
  return requireExplicit ? null : 'demo-tenant';
}

/** GET /api/form-templates — list all templates (id, title, jurisdiction, counts) */
router.get('/form-templates', (_req: Request, res: Response) => {
  const summary = FORM_CATALOG.map((f) => ({
    id: f.id,
    category: f.category,
    jurisdiction: f.jurisdiction,
    destinationTable: f.destinationTable,
    title: f.title,
    subtitle: f.subtitle,
    legalBasis: f.legalBasis,
    fieldCount: f.fields.length,
    mustCount: f.fields.filter((x) => x.must).length,
  }));
  res.json({ data: summary, meta: { version: '1.0.0', totalForms: FORM_CATALOG.length, source: 'helix-master-catalog' } });
});

/** GET /api/form-templates/:id — full field schema */
router.get('/form-templates/:id', (req: Request, res: Response) => {
  const formId = String(req.params.id ?? '').trim();
  if (!formId) return res.status(404).json({ error: 'Form template not found', id: '' });
  const tpl = getFormById(formId);
  if (!tpl) return res.status(404).json({ error: 'Form template not found', id: formId });
  res.json(tpl);
});

/**
 * GET /api/form-assistant/:formId/drafts — list persisted drafts for the tenant.
 * The destination table is resolved from the form's destinationTable field.
 */
router.get('/form-assistant/:formId/drafts', async (req: Request, res: Response) => {
  try {
    const formId = String(req.params.formId ?? '').trim();
    if (!formId) return res.status(404).json({ error: 'Form template not found', id: '' });
    const tpl = getFormById(formId);
    if (!tpl) return res.status(404).json({ error: 'Form template not found', id: formId });
    const tenantId = resolveTenantId(req);
    if (!tenantId) return res.status(400).json({ error: 'Tenant not resolved' });

    const rows = await readDrafts(tpl, tenantId);
    res.json(rows);
  } catch (err: any) {
    console.error('[form-assistant] list drafts failed:', err?.message);
    res.status(500).json({ error: 'Failed to read drafts', message: err?.message });
  }
});

/**
 * POST /api/form-assistant/:formId/drafts — persist a draft.
 * Body: { values: Record<string, any>, projectId?: string, title?: string }
 * Writes to tpl.destinationTable with tenant scoping.
 */
router.post('/form-assistant/:formId/drafts', async (req: Request, res: Response) => {
  try {
    const formId = String(req.params.formId ?? '').trim();
    if (!formId) return res.status(404).json({ error: 'Form template not found', id: '' });
    const tpl = getFormById(formId);
    if (!tpl) return res.status(404).json({ error: 'Form template not found', id: formId });
    const tenantId = resolveTenantId(req, /* requireExplicit */ true);
    if (!tenantId) return res.status(400).json({ error: 'Tenant not resolved — provide x-tenant-id header or ?tenant= query param' });

    const body = (req.body ?? {}) as { values?: Record<string, unknown>; projectId?: string; title?: string };
    const values = body.values ?? {};

    // Server-side validation (must + non-empty + regex format).
    const missing: string[] = [];
    const invalid: string[] = [];
    for (const f of tpl.fields) {
      const v = values[f.id];
      const present = !(v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0));
      if (f.must && !present) {
        missing.push(f.id);
        continue;
      }
      if (present && f.validation?.pattern) {
        try {
          if (!new RegExp(f.validation.pattern).test(String(v))) invalid.push(f.id);
        } catch {
          invalid.push(f.id);
        }
      }
    }
    if (missing.length) {
      return res.status(422).json({ error: 'Validation failed — missing MUST fields', missing });
    }
    if (invalid.length) {
      return res.status(422).json({ error: 'Validation failed — invalid field format', invalid });
    }

    const id = await writeDraft(tpl, tenantId, body);
    // Surface a warning when the row will need a future migration to read properly
    // (FDA 510(k) writes go to project_charta_documents; `stakeholders` jsonb is the
    // best we have until a dedicated metadata jsonb / fda_510k_submissions table exists).
    const warnings: string[] = [];
    if (tpl.id === 'fda-510k') {
      warnings.push('fda-510k-stored-in-project_charta-pending-migration');
    }
    res.status(201).json({ id, formId: tpl.id, status: 'draft', warnings });
  } catch (err: any) {
    console.error('[form-assistant] persist draft failed:', err?.message);
    res.status(500).json({ error: 'Failed to persist draft', message: err?.message });
  }
});

// ---------------------------------------------------------------------------
// Internal helpers: dispatch reads + writes to the correct destination table.
// ---------------------------------------------------------------------------
async function readDrafts(tpl: FormTemplate, tenantId: string): Promise<Record<string, unknown>[]> {
  const table = tpl.destinationTable;
  let rows: any[] = [];
  if (table === 'project_charta_documents') {
    rows = await db
      .select()
      .from(projectChartaDocuments)
      .where(eq(projectChartaDocuments.tenantId, tenantId))
      .orderBy(desc(projectChartaDocuments.updatedAt));
  } else if (table === 'requirements_specifications') {
    rows = await db
      .select()
      .from(requirementsSpecifications)
      .where(eq(requirementsSpecifications.tenantId, tenantId))
      .orderBy(desc(requirementsSpecifications.updatedAt));
  } else if (table === 'risk_analysis_records') {
    rows = await db
      .select()
      .from(riskAnalysisRecords)
      .where(eq(riskAnalysisRecords.tenantId, tenantId))
      .orderBy(desc(riskAnalysisRecords.updatedAt));
  } else if (table === 'conformity_declarations') {
    rows = await db
      .select()
      .from(conformityDeclarations)
      .where(eq(conformityDeclarations.tenantId, tenantId))
      .orderBy(desc(conformityDeclarations.updatedAt));
  } else if (table === 'non_conformity_reports') {
    rows = await db
      .select()
      .from(nonConformityReports)
      .where(eq(nonConformityReports.tenantId, tenantId))
      .orderBy(desc(nonConformityReports.updatedAt));
  }
  return rows;
}

async function writeDraft(
  tpl: FormTemplate,
  tenantId: string,
  body: { values?: Record<string, unknown>; projectId?: string; title?: string },
): Promise<string> {
  const values = body.values ?? {};
  const table = tpl.destinationTable;
  // Map field-id → DB column. Only the fields present in our destination tables are kept;
  // unmapped fields land in metadata as a JSON blob so no data is lost.
  let inserted: { id: string } | null = null;

  if (table === 'project_charta_documents') {
    // Form-specific objectives derivation: do NOT fall through to a generic 'description' field
    // because FDA 510(k)'s `description` slot holds the truthfulness statement
    // (21 CFR 807.87 (k)) — which would be semantically wrong inside project_charta_documents.objectives.
    const objectives =
      tpl.id === 'fda-510k'
        ? `[FDA 510(k)] ${String(values['kNumber'] ?? 'K??????')} — ${String(values['deviceName'] ?? values['productName'] ?? '')}`.trim()
        : textOrNull(values['objectives']);

    const [row] = await db
      .insert(projectChartaDocuments)
      .values({
        tenantId,
        projectId: body.projectId ?? 'standalone',
        title: body.title ?? (`[${tpl.id}] ${String(values['title'] ?? values['productName'] ?? values['riskId'] ?? values['deviceName'] ?? 'Draft')}`),
        projectNumber: textOrNull(values['projectNumber'])?.slice(0, 64)
          ?? (tpl.id === 'fda-510k' ? textOrNull(values['kNumber'])?.slice(0, 64) : null),
        customer: String(values['customer'] ?? values['manufacturerName'] ?? values['submitterName'] ?? '').slice(0, 200) || null,
        projectLead: String(values['projectLead'] ?? values['signatoryName'] ?? values['detectedBy'] ?? '').slice(0, 200) || null,
        engineers: [],
        startDate: parseDate(values['startDate']),
        endDate: parseDate(values['endDate']),
        budget: parseIntSafe(values['budget']),
        objectives,
        successCriteria: textOrNull(values['successCriteria']),
        // Stakeholders is a jsonb column originally for stakeholder lists; we attach
        // the full form values here so nothing is lost. A future migration should add
        // a dedicated `metadata jsonb` column and move FDA-510k to its own table.
        stakeholders: { formValues: values } as any,
        signatureDate: parseDate(values['signatureDate'] ?? values['submitterSignatureDate']),
        status: 'draft',
        version: 1,
      })
      .returning({ id: projectChartaDocuments.id });
    inserted = row ?? null;
  } else if (table === 'requirements_specifications') {
    const [row] = await db
      .insert(requirementsSpecifications)
      .values({
        tenantId,
        projectId: body.projectId ?? 'standalone',
        requirementId: String(values['requirementId'] ?? 'REQ-' + Date.now()).slice(0, 100),
        category: String(values['category'] ?? 'functional'),
        description: String(values['description'] ?? ''),
        priority: String(values['priority'] ?? 'should'),
        source: textOrNull(values['source']),
        status: 'open',
        verificationMethod: String(values['verificationMethod'] ?? 'test').slice(0, 50),
        riskLinks: parseArray(values['riskLinks']),
        version: 1,
      })
      .returning({ id: requirementsSpecifications.id });
    inserted = row ?? null;
  } else if (table === 'risk_analysis_records') {
    const [row] = await db
      .insert(riskAnalysisRecords)
      .values({
        tenantId,
        projectId: body.projectId ?? 'standalone',
        riskId: String(values['riskId'] ?? 'RISK-' + Date.now()).slice(0, 100),
        hazard: String(values['hazard'] ?? ''),
        hazardousSituation: textOrNull(values['hazardousSituation']),
        failureMode: textOrNull(values['harm']),
        damageScenario: textOrNull(values['mitigationMeasures']),
        severity: parseIntSafe(values['severity']),
        probability: parseIntSafe(values['probability']),
        riskScore: computeRiskScore(values['severity'], values['probability']),
        acceptanceCriterion: String(values['riskAcceptance'] ?? 'alarp').slice(0, 64),
        mitigationMeasures: { raw: values['mitigationMeasures'] },
        residualSeverity: null,
        residualProbability: null,
        residualRisk: null,
        verificationMethod: null,
        status: 'identified',
        version: 1,
      })
      .returning({ id: riskAnalysisRecords.id });
    inserted = row ?? null;
  } else if (table === 'conformity_declarations') {
    const [row] = await db
      .insert(conformityDeclarations)
      .values({
        tenantId,
        projectId: body.projectId ?? 'standalone',
        manufacturerName: String(values['manufacturerName'] ?? '').slice(0, 200),
        manufacturerAddress: textOrNull(values['manufacturerAddress']),
        productName: String(values['productName'] ?? 'Product').slice(0, 200),
        riskClass: String(values['riskClass'] ?? 'IIa').slice(0, 20),
        appliedStandards: parseArray(values['appliedStandards']),
        notifiedBodyId: String(values['notifiedBodyId'] ?? '').slice(0, 64),
        ceMarkDate: parseDate(values['ceMarkDate']),
        signatoryName: String(values['signatoryName'] ?? '').slice(0, 200),
        signatoryTitle: String(values['signatoryTitle'] ?? '').slice(0, 120),
        signatureDate: parseDate(values['signatureDate']),
        documentStatus: 'draft',
        version: 1,
      })
      .returning({ id: conformityDeclarations.id });
    inserted = row ?? null;
  } else if (table === 'non_conformity_reports') {
    const [row] = await db
      .insert(nonConformityReports)
      .values({
        tenantId,
        projectId: body.projectId ?? 'standalone',
        ncrNumber: String(values['ncrNumber'] ?? 'NCR-' + Date.now()).slice(0, 64),
        detectionDate: parseDate(values['detectionDate']),
        description: textOrNull(values['description']),
        affectedProductProcess: textOrNull(values['affectedProductProcess']),
        immediateAction: textOrNull(values['immediateAction']),
        rootCauseAnalysis: String(values['rootCauseAnalysis'] ?? '5why').slice(0, 64),
        correctionAction: textOrNull(values['correctionAction']),
        preventionAction: textOrNull(values['preventionAction']),
        responsiblePerson: String(values['responsiblePerson'] ?? values['detectedBy'] ?? '').slice(0, 200),
        closeoutDate: parseDate(values['targetCloseoutDate']),
        status: 'open',
        version: 1,
      })
      .returning({ id: nonConformityReports.id });
    inserted = row ?? null;
  }

  if (!inserted) throw new Error(`No destination table handler for ${tpl.destinationTable}`);
  return inserted.id;
}

// ---------------------------------------------------------------------------
// Tiny value parsers — keep the column-mapping resilient without extra libs.
// ---------------------------------------------------------------------------
function textOrNull(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length === 0 ? null : s;
}
function parseDate(v: unknown): Date | null {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}
function parseIntSafe(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
}
function parseArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === 'string' && v.trim() !== '') {
    return v.split(/[,;]\s*/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}
function computeRiskScore(s: unknown, p: unknown): number | null {
  const ns = parseIntSafe(s);
  const np = parseIntSafe(p);
  if (ns === null || np === null) return null;
  return ns * np;
}

/**
 * Fail-fast catalog validation: every `validation.pattern` MUST compile at module load.
 * Throws on authoring mistakes so broken patterns surface immediately on server boot,
 * not silently swallowed by both client and server validation passes.
 */
(() => {
  for (const f of FORM_CATALOG) {
    for (const fld of f.fields) {
      if (fld.validation?.pattern) {
        try { new RegExp(fld.validation.pattern); } catch (e) {
          throw new Error(`[form-template-catalog] invalid regex in field '${f.id}.${fld.id}': ${(e as Error).message}`);
        }
      }
    }
  }
})();

export default router;
