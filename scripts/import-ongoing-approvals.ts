/**
 * Import Script für laufende Zulassungen aus verschiedenen Quellen
 * 
 * Ruft laufende (nicht abgeschlossene) Zulassungen von verschiedenen Quellen ab:
 * - FDA Dockets (Regulations.gov)
 * - FDA 510(k) mit sehr recent decision_date (als "neu genehmigt" markiert)
 * - EMA News für laufende Prozesse
 * - Weitere Quellen nach Bedarf
 * 
 * Nutzung:
 *   npx tsx scripts/import-ongoing-approvals.ts --source=all
 *   npx tsx scripts/import-ongoing-approvals.ts --source=fda-dockets
 *   npx tsx scripts/import-ongoing-approvals.ts --source=recent-510k
 */
import 'dotenv/config';
import { FDADocketsService } from '../server/services/fdaDocketsService.js';
import { storage } from '../server/storage.js';
import fetch from 'node-fetch';
import crypto from 'node:crypto';
import { regulatoryUpdates } from '../shared/schema.js';
import { getScriptDb } from './script-db.js';

function parseArgs() {
  const args = process.argv.slice(2);
  const opts: Record<string, string> = {};
  for (const arg of args) {
    const [k, v] = arg.replace(/^--/, '').split('=');
    if (k) opts[k] = v ?? 'true';
  }
  return opts;
}

/**
 * Importiert sehr recent FDA 510(k) Clearances als "laufende" Zulassungen
 * (innerhalb der letzten 30 Tage genehmigt - als "neu genehmigt" betrachtet)
 */
async function importRecent510k(limit: number = 50) {
  const { sql, db } = getScriptDb();
  let imported = 0;

  try {
    // Hole 510(k) Clearances der letzten 30 Tage
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sinceDate = thirtyDaysAgo.toISOString().split('T')[0];

    const url = `https://api.fda.gov/device/510k.json?limit=${limit}&search=decision_date:[${sinceDate}+TO+NOW]`;
    console.log(`🔍 Hole recent 510(k) von: ${url}`);

    const res = await fetch(url);
    if (!res.ok) {
      console.error(`❌ API Fehler: ${res.status} ${res.statusText}`);
      return 0;
    }

    const json: any = await res.json();
    const records: any[] = json.results ?? [];

    if (!records.length) {
      console.log('ℹ️ Keine recent 510(k) Clearances gefunden.');
      return 0;
    }

    console.log(`📦 Empfangen: ${records.length} recent 510(k) Clearances`);

    for (const r of records) {
      try {
        if (!r.k_number || !r.device_name) {
          continue;
        }

        // Prüfe ob bereits vorhanden
        const existing = await sql`
          SELECT id FROM regulatory_updates WHERE fda_k_number = ${r.k_number}
        `;
        if (existing.length > 0) {
          continue; // Bereits vorhanden
        }

        const title = `FDA 510(k): ${r.device_name}`;
        const hashedTitle = crypto.createHash('sha256').update(title.toLowerCase()).digest('hex');
        const decisionDate = r.decision_date ? new Date(r.decision_date) : new Date();

        // Device Class basierte Priorität
        const deviceClass = (r.device_class || '').toUpperCase();
        let riskLevel = 'low';
        let priority = 2;
        if (deviceClass === 'III') { riskLevel = 'high'; priority = 5; }
        else if (deviceClass === 'II') { riskLevel = 'medium'; priority = 3; }

        // Als "neu genehmigt" markieren (approval_status = 'approved', aber sehr recent)
        await db.insert(regulatoryUpdates).values({
          title,
          hashedTitle,
          description: r.device_name || 'FDA 510(k) Medical Device',
          type: 'approval',
          category: '510k',
          jurisdiction: 'US',
          publishedDate: decisionDate,
          effectiveDate: decisionDate,
          approvalStatus: 'approved', // Genehmigt, aber sehr recent
          priority,
          riskLevel,
          actionRequired: false,
          actionType: 'monitoring',
          sourceUrl: `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=${r.k_number}`,
          fdaKNumber: r.k_number,
          fdaApplicant: r.applicant || 'Unknown Applicant',
          fdaDeviceClass: r.device_class,
          fdaRegulationNumber: r.regulation_number,
          fdaProductCode: r.product_code,
          fdaDecisionDate: decisionDate,
          language: 'en',
          tags: ['fda', '510k', 'recent'],
          authorityVerified: true,
          metadata: {
            advisory_committee: r.advisory_committee,
            contact: r.contact,
            decision_code: r.decision_code,
            is_recent_approval: true,
            days_since_approval: Math.floor((new Date().getTime() - decisionDate.getTime()) / (1000 * 60 * 60 * 24))
          }
        });

        imported++;
        console.log(`✅ Imported recent 510(k): ${r.k_number}`);
      } catch (e: any) {
        console.error(`⚠️ Fehler bei ${r.k_number}:`, e.message);
      }
    }
  } catch (error) {
    console.error('💥 Fehler in importRecent510k:', error);
  }

  return imported;
}

/**
 * Hauptfunktion
 */
async function main() {
  const opts = parseArgs();
  const source = opts.source || 'all';

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL fehlt. Bitte setzen.');
    process.exit(1);
  }

  console.log(`🚀 Starte Import laufender Zulassungen (source: ${source})`);

  let totalImported = 0;

  try {
    if (source === 'all' || source === 'fda-dockets') {
      console.log('\n📋 Importiere FDA Dockets...');
      const docketsService = new FDADocketsService();
      const docketsImported = await docketsService.importOngoingApprovals();
      totalImported += docketsImported;
      console.log(`✅ FDA Dockets: ${docketsImported} importiert`);
    }

    if (source === 'all' || source === 'recent-510k') {
      console.log('\n📋 Importiere recent FDA 510(k) Clearances...');
      const recent510k = await importRecent510k(50);
      totalImported += recent510k;
      console.log(`✅ Recent 510(k): ${recent510k} importiert`);
    }

    console.log(`\n✅ Fertig! Gesamt importiert: ${totalImported}`);
  } catch (error) {
    console.error('💥 Unerwarteter Fehler:', error);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('💥 Unerwarteter Fehler:', err);
  process.exit(1);
});

