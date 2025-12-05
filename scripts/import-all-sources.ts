/**
 * Complete Multi-Source Data Import
 * Imports data from ALL available regulatory sources
 * Usage: npx tsx scripts/import-all-sources.ts
 */

import 'dotenv/config';
import { storage } from '../server/storage.js';
import { enhancedFDAService } from '../server/services/enhancedFDAService.js';
import { emaEparService } from '../server/services/emaEparService.js';
import { patentCollector } from '../server/services/patentCollector.js';
import { legalCaseCollector } from '../server/services/legalCaseCollector.js';

interface ImportResult {
  source: string;
  count: number;
  error?: string;
  duration: number;
}

async function importWithTiming(label: string, fn: () => Promise<any[]>): Promise<ImportResult> {
  const start = Date.now();
  try {
    console.log(`\n🔄 [${label}] Starting...`);
    const results = await fn();
    const duration = Date.now() - start;
    console.log(`✅ [${label}] Imported ${results.length} items (${duration}ms)`);
    return { source: label, count: results.length, duration };
  } catch (error: any) {
    const duration = Date.now() - start;
    console.error(`❌ [${label}] Error: ${error.message}`);
    return { source: label, count: 0, error: error.message, duration };
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is required');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════════');
  console.log('  MULTI-SOURCE REGULATORY DATA IMPORT');
  console.log('═══════════════════════════════════════════════════\n');

  const results: ImportResult[] = [];
  const startTime = Date.now();

  // FDA Sources
  results.push(await importWithTiming('FDA 510(k)', () => enhancedFDAService.collect510kComplete(100)));
  results.push(await importWithTiming('FDA PMA', () => enhancedFDAService.collectPMA(50)));
  results.push(await importWithTiming('FDA MAUDE', () => enhancedFDAService.collectMAUDE(100)));

  // EMA Sources
  results.push(await importWithTiming('EMA EPAR', () => emaEparService.collectEPAR(50)));

  // Patent Sources
  results.push(await importWithTiming('USPTO Patents', () => patentCollector.searchPatents('medical device', 30)));
  results.push(await importWithTiming('PatentsView', () => patentCollector.searchPatentsView('device', 30)));

  // Legal Sources
  results.push(await importWithTiming('Legal Cases', () => legalCaseCollector.searchLegalCases('medical device', 20)));

  // Summary
  const totalDuration = Date.now() - startTime;
  const successCount = results.filter(r => !r.error).length;
  const totalItems = results.reduce((sum, r) => sum + r.count, 0);

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  IMPORT SUMMARY');
  console.log('═══════════════════════════════════════════════════');
  console.log(`\nTotal Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`Successful Sources: ${successCount}/${results.length}`);
  console.log(`Total Items Imported: ${totalItems}\n`);

  for (const result of results) {
    const status = result.error ? '❌' : '✅';
    console.log(`${status} ${result.source.padEnd(20)} ${result.count.toString().padStart(5)} items (${result.duration}ms)`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════');

  if (successCount === results.length) {
    console.log('✅ All sources imported successfully!');
    process.exit(0);
  } else {
    console.log(`⚠️  ${results.filter(r => r.error).length} sources failed`);
    process.exit(1);
  }
}

main();
