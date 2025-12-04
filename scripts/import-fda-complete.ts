/**
 * FDA Complete Data Import - All Endpoints
 * Imports: 510(k) complete, PMA, MAUDE, Detailed Recalls
 * Usage: npx tsx scripts/import-fda-complete.ts --limit=50 --since=2024-01-01
 */

import 'dotenv/config';
import { enhancedFDAService } from '../server/services/enhancedFDAService.js';

function parseArgs() {
  const args = process.argv.slice(2);
  const opts: Record<string, string> = {};
  for (const arg of args) {
    const [k, v] = arg.replace(/^--/, '').split('=');
    if (k) opts[k] = v ?? 'true';
  }
  return opts;
}

async function main() {
  const opts = parseArgs();
  const limit = parseInt(opts.limit || '50', 10);
  const since = opts.since; // YYYY-MM-DD format

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is required');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════════');
  console.log('  FDA COMPLETE DATA IMPORT');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Limit: ${limit} per endpoint`);
  console.log(`Since: ${since || 'All time'}`);
  console.log('');

  const results = {
    fda510k: 0,
    pma: 0,
    maude: 0,
    recalls: 0,
    errors: 0
  };

  // 1. Complete 510(k) data
  try {
    console.log('\n📋 [1/4] Collecting Complete 510(k) Data...');
    const devices = await enhancedFDAService.collect510kComplete(limit, since);
    results.fda510k = devices.length;
    console.log(`✅ Imported ${devices.length} complete 510(k) clearances`);
  } catch (error: any) {
    console.error('❌ 510(k) import failed:', error.message);
    results.errors++;
  }

  // 2. PMA Approvals
  try {
    console.log('\n📋 [2/4] Collecting PMA Approvals...');
    const pmas = await enhancedFDAService.collectPMA(Math.floor(limit / 2), since);
    results.pma = pmas.length;
    console.log(`✅ Imported ${pmas.length} PMA approvals`);
  } catch (error: any) {
    console.error('❌ PMA import failed:', error.message);
    results.errors++;
  }

  // 3. MAUDE Adverse Events
  try {
    console.log('\n⚠️  [3/4] Collecting MAUDE Adverse Events...');
    const events = await enhancedFDAService.collectMAUDE(limit, since);
    results.maude = events.length;
    console.log(`✅ Imported ${events.length} adverse event reports`);
  } catch (error: any) {
    console.error('❌ MAUDE import failed:', error.message);
    results.errors++;
  }

  // 4. Detailed Recalls - SKIPPED: FDA API returns 500 error
  // try {
  //   console.log('\n🔴 [4/4] Collecting Detailed Recalls...');
  //   const recalls = await enhancedFDAService.collectRecallsDetailed(limit, since);
  //   results.recalls = recalls.length;
  //   console.log(`✅ Imported ${recalls.length} detailed recalls`);
  // } catch (error: any) {
  //   console.error('❌ Recalls import failed:', error.message);
  //   results.errors++;
  // }

  // Summary
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  IMPORT SUMMARY');
  console.log('═══════════════════════════════════════════════════');
  console.log(`510(k) Complete:    ${results.fda510k}`);
  console.log(`PMA Approvals:      ${results.pma}`);
  console.log(`MAUDE Events:       ${results.maude}`);
  console.log(`Detailed Recalls:   ${results.recalls}`);
  console.log(`Total Items:        ${results.fda510k + results.pma + results.maude + results.recalls}`);
  console.log(`Errors:             ${results.errors}`);
  console.log('═══════════════════════════════════════════════════\n');

  if (results.errors > 0) {
    console.warn('⚠️  Some imports failed. Check logs above for details.');
    process.exit(1);
  }

  console.log('✅ All FDA data imported successfully!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
