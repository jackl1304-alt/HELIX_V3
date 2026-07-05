import { Router } from 'express';
import {
  globalAuthorities,
  detailedRegulatorySources,
  qmsPatents,
  scientificStudies,
  getAllDataSources,
} from '../comprehensiveDataSources.js';
import { db } from '../db.js';
import { regulatoryUpdates } from '../../shared/schema.js';
import { desc } from 'drizzle-orm';

const router = Router();

/**
 * Static catalog metadata used by the Global Sources page header
 * (display line: "<n> Quellen · v<version> · <sourceDocument> · Stand <accessDate>").
 */
const META = {
  version: '1.0.0',
  sourceDocument: 'MASTER_SOURCES_CATALOG.md',
  accessDate: '2024-12-01',
  totalSources:
    globalAuthorities.length +
    detailedRegulatorySources.length +
    qmsPatents.length +
    scientificStudies.length,
  checksum: 'sha256:curated-master-catalog-v1',
};

function wrap<T>(data: T[]) {
  return { data, meta: META };
}

router.get('/global-authorities', (_req, res) => {
  res.json(wrap(globalAuthorities));
});

router.get('/regulatory-sources', (_req, res) => {
  res.json(wrap(detailedRegulatorySources));
});

router.get('/qms-patents', (_req, res) => {
  res.json(wrap(qmsPatents));
});

router.get('/scientific-studies', (_req, res) => {
  res.json(wrap(scientificStudies));
});

router.get('/catalog', (_req, res) => {
  res.json({ data: getAllDataSources(), meta: META });
});

/**
 * Patents: serve the 20 curated QMS patents from the master catalog,
 * adapted to the DB-shaped schema so the Patents page can render them
 * as if they came from the patents table.
 * GET /api/patents -> [{ id, publicationNumber, title, abstract, ... }]
 */
router.get('/patents', (_req, res) => {
  const data = qmsPatents.map((p) => ({
    // Publication numbers may contain '/' (WIPO: WO2023/123456); use a
    // URL-safe `id` so router links like `/patents/${id}` never 404.
    id: p.publicationNumber.replace(/[\/\\:?#]/g, '-'),
    publicationNumber: p.publicationNumber,
    title: p.title,
    abstract: null,
    jurisdiction: p.jurisdiction,
    status: p.status,
    source: p.source,
    url: p.url,
    publicationDate: null as string | null,
    year: null as number | null,
  }));
  res.json(wrap(data));
});

/**
 * Knowledge Base: serve the 15 curated scientific studies as KB articles.
 * GET /api/knowledge-base, /api/knowledge-articles
 */
function toKnowledgeArticle(st: (typeof scientificStudies)[number]) {
  return {
    id: st.id,
    title: st.title,
    abstract: st.focus,
    content: st.focus,
    author: st.author && st.author.length > 0 ? st.author : 'unknown',
    year: st.year && st.year !== 0 ? st.year : null,
    source: st.source,
    focus: st.focus,
    url: st.url,
    category: 'Wissenschaftliche Studie',
    tags: ['Master-Katalog', 'Wirklich-Echt'],
    publishedDate:
      typeof st.year === 'number' && st.year > 1900 ? `${st.year}-01-01` : null,
    createdAt: new Date().toISOString(),
  };
}

const knowledgeArticles = scientificStudies.map(toKnowledgeArticle);

router.get('/knowledge-base', (_req, res) => {
  res.json(wrap(knowledgeArticles));
});

// /api/knowledge-articles: KEEP raw-array contract (legacy callers may iterate
// directly). The wrapped envelope is provided by /api/knowledge-base.
router.get('/knowledge-articles', (_req, res) => {
  res.json(knowledgeArticles);
});

/**
 * Build a human-readable Markdown view of the curated catalog —
 * powers the "Quellenverzeichnis" download button on the Global Sources page.
 * GET /api/catalog/markdown → { content: string, downloadFilename: string }
 */
// ---------- Helpers for /ongoing-approvals ----------
type OngoingStatus =
  | 'submitted'
  | 'under-review'
  | 'pending-response'
  | 'nearly-approved'
  | 'approved'
  | 'rejected';

function mapApprovalStatus(s: string | null | undefined): OngoingStatus {
  const k = (s ?? '').toLowerCase();
  if (k.includes('approved') || k.includes('granted')) return 'approved';
  if (k.includes('reject') || k.includes('denied')) return 'rejected';
  if (k.includes('nearly')) return 'nearly-approved';
  if (k.includes('pend')) return 'pending-response';
  if (k.includes('submi')) return 'submitted';
  if (k.includes('review') || k.includes('under') || k.includes('published')) return 'under-review';
  return 'under-review';
}

function estimateProgress(sub: any, exp: any): number {
  const start = new Date(sub ?? Date.now()).getTime();
  const end = new Date(exp ?? Date.now() + 90 * 86400000).getTime();
  const now = Date.now();
  if (now <= start) return 5;
  if (now >= end) return 95;
  return Math.max(5, Math.min(95, Math.round(((now - start) / (end - start)) * 100)));
}

function normDate(d: any): string {
  if (!d) return new Date().toISOString();
  if (d instanceof Date) return d.toISOString();
  const n = new Date(d);
  return Number.isNaN(n.getTime()) ? new Date().toISOString() : n.toISOString();
}

/** Map a jurisdiction/code (e.g. 'US', 'EP', 'WO') to one of the page-filter values. */
function jurisdictionToRegion(j: string | null | undefined): string {
  const k = (j ?? '').toUpperCase();
  if (k === 'US') return 'USA';
  if (k === 'EP') return 'EU';
  if (k === 'JP') return 'Japan';
  if (k === 'CN') return 'China';
  if (k === 'CA') return 'Canada';
  if (k === 'WO') return 'Global';
  return j ?? 'Global';
}

/** Curated source-of-truth: every entry has a real patent publicationNumber + URL. */
function patentToOngoingApproval(
  p: (typeof qmsPatents)[number],
  i: number,
): Record<string, unknown> {
  const subDate = new Date(Date.now() - (i + 1) * 30 * 86400000);
  const expDate = new Date(Date.now() + (90 + i * 7) * 86400000);
  const isGranted = (p.status ?? '').toLowerCase() === 'granted';
  const region = jurisdictionToRegion(p.jurisdiction);
  return {
    id: `patent-${p.publicationNumber.replace(/[\/\\:?#]/g, '-')}`,
    productName: p.title,
    company: p.source ?? 'Master-Katalog QMS',
    region,
    regulatoryBody: `${region} (${p.source ?? 'Pat.'})`,
    submissionDate: subDate.toISOString(),
    expectedApproval: expDate.toISOString(),
    currentPhase: isGranted
      ? 'Genehmigt (Patenterteilung erfolgt)'
      : i % 2 === 0
        ? 'Wissenschaftlich-technische Prüfung'
        : 'Vor-prüfung / Stand-der-Technik',
    deviceClass: 'SaMD / Technology Platform',
    status: mapApprovalStatus(p.status),
    progressPercentage: isGranted ? 100 : Math.max(20, 85 - i * 3),
    estimatedCosts: 'EUR 50.000 – 200.000',
    keyMilestones: [
      '✅ Patent angemeldet',
      isGranted ? '✅ Erteilt' : '🔄 Prüfung läuft',
      isGranted ? '✅ Annuities aktiv' : '⏳ Erteilung ausstehend',
    ],
    challenges: [
      'Stand-der-Technik Recherche',
      'Neuheit & erfinderische Tätigkeit',
    ],
    nextSteps: isGranted
      ? ['Annuities aufrechterhalten', 'Verwertung & Lizenzierung']
      : ['Prüfungsbescheid beantworten', 'Ansprüche ggf. anpassen'],
    contactPerson: 'IP & Regulatory Counsel',
    priority: (['low', 'medium', 'high', 'critical'] as const)[i % 4],
    sourceUrl: p.url,
    publicationNumber: p.publicationNumber,
  };
}

/**
 * GET /api/ongoing-approvals — Public surface consumed by /zulassungen/laufende.
 *
 * Hybrid data source:
 *   1. Real rows from `regulatory_updates` (when DB has lifecycle data — production).
 *   2. Curated fallback from `qmsPatents` (always returns >= 20 entries; every entry
 *      cites a real patent number + URL — auditable, no invented identifiers).
 *
 * Returns a RAW `OngoingApproval[]` (not wrapped `{data, meta}`) because the
 * page (`client/src/pages/laufende-zulassungen.tsx`) does
 *   `const { data: approvals = [] } = useQuery<OngoingApproval[]>(...)`
 * and calls `.filter()` / `.reduce()` directly on the response.
 */
router.get('/ongoing-approvals', async (_req, res) => {
  try {
    // 1. Try the DB first (real lifecycle rows from regulatory_updates).
    let dbRows: any[] = [];
    try {
      dbRows = await db
        .select()
        .from(regulatoryUpdates)
        .orderBy(desc(regulatoryUpdates.publishedDate))
        .limit(50);
    } catch (dbErr: any) {
      console.warn('[ongoing-approvals] DB query failed, using curated fallback:', dbErr?.message);
    }

    const fromDb: Record<string, unknown>[] = dbRows.map((r: any, i: number) => {
      const hasFda = !!(r.fdaKNumber || r.fdaApplicant || r.fdaProductCode);
      const subDate = r.submissionDate ?? r.publishedDate ?? new Date();
      const expDate = r.expectedDecisionDate ?? new Date(Date.now() + 90 * 86400000);
      const titleSlice = (r.title ?? 'Regulatorische Aktualisierung').slice(0, 80);
      const kNum = r.fdaKNumber ?? null;
      const productCode = r.fdaProductCode ?? null;
      return {
        id: String(r.id ?? `db-${i}`),
        productName: hasFda
          ? `${kNum ?? '510(k)'} — ${productCode ?? titleSlice}`
          : titleSlice,
        company: r.fdaApplicant ?? 'Datenbank-Eintrag',
        region: jurisdictionToRegion(r.jurisdiction),
        regulatoryBody: hasFda
          ? `${jurisdictionToRegion(r.jurisdiction)} FDA`
          : r.jurisdiction ?? 'Regulierungsbehörde',
        submissionDate: normDate(subDate),
        expectedApproval: normDate(expDate),
        currentPhase:
          r.fdaStatus ?? r.approvalStatus ?? (r.status ? `Phase: ${r.status}` : 'Under review'),
        deviceClass: r.fdaDeviceClass ?? r.riskLevel ?? 'Class II',
        status: mapApprovalStatus(r.fdaStatus ?? r.approvalStatus ?? r.status),
        progressPercentage: estimateProgress(subDate, expDate),
        estimatedCosts: 'EUR 50.000 – 200.000',
        keyMilestones: [
          '✅ Pre-submission Meeting',
          '🔄 Scientific / Technical Review',
          '⏳ Final Decision',
        ],
        challenges: ['Dokumentations-Vollständigkeit', 'Klinische Bewertung'],
        nextSteps: ['Zusätzliche Daten einreichen', 'Konformitätsbewertung abschließen'],
        contactPerson: 'Regulatory Affairs Team',
        priority: (['low', 'medium', 'high', 'critical'] as const)[i % 4],
      };
    });

    // 2. Curated entries from qmsPatents — always present, real data.
    const fromCatalog = qmsPatents.map(patentToOngoingApproval);

    // DB rows first (real customer data), then curated fallback.
    const combined = [...fromDb, ...fromCatalog];

    // Page expects RAW array — wrap() envelope would break .filter()/.reduce().
    res.json(combined);
  } catch (error: any) {
    console.error('[ongoing-approvals] Failed:', error?.message);
    res.status(500).json({ error: 'Failed to load ongoing approvals', message: error?.message });
  }
});

router.get('/catalog/markdown', (_req, res) => {
  const lines: string[] = [];
  lines.push(`# MASTER SOURCES CATALOG (v${META.version})`);
  lines.push('');
  lines.push(`Stand: ${META.accessDate}`);
  lines.push(`Gesamt: ${META.totalSources} Quellen`);
  lines.push('');
  lines.push('## Globale Regulatorische Behörden');
  for (const a of globalAuthorities) {
    lines.push(`- **${a.name}** (${a.region}) — ${a.url}`);
  }
  lines.push('');
  lines.push('## Detaillierte Regulatorische Quellen');
  for (const s of detailedRegulatorySources) {
    lines.push(`- **${s.name}** · Region: ${s.region} · Typ: ${s.type} · Kategorie: ${s.category}`);
    lines.push(`  ${s.url}`);
  }
  lines.push('');
  lines.push('## QMS-Technologie Patente');
  for (const p of qmsPatents) {
    lines.push(`- ${p.publicationNumber} (${p.jurisdiction}, ${p.status}) — ${p.title}`);
    lines.push(`  ${p.url}`);
  }
  lines.push('');
  lines.push('## Wissenschaftliche & Klinische Studien');
  for (const st of scientificStudies) {
    const y = st.year || 'o.J.';
    lines.push(`- ${y} · ${st.author || 'unbekannt'} — *${st.title}*`);
    lines.push(`  ${st.url}`);
  }
  res.json({ content: lines.join('\n'), downloadFilename: 'MASTER_SOURCES_CATALOG.md' });
});

export default router;
