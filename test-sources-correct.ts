/**
 * TEST: Alternative Data Sources (Patents, Legal Cases, Running Patents)
 * Tests all non-FDA sources to verify implementation and data connectivity
 */

import { legalCaseCollector } from './server/services/legalCaseCollector.js';
import { syncAllPatentSources } from './server/services/patentService.js';
import { PatentCollector } from './server/services/patentCollector.js';

console.log('\n🧪 TESTING ALL ALTERNATIVE SOURCES\n════════════════════════════════════');

async function runTests() {
  const startTime = Date.now();
  const results: any = {
    patents: { success: false, count: 0, error: null },
    legalCases: { success: false, count: 0, error: null },
    patentCollector: { success: false, count: 0, error: null }
  };

  // ============================================================
  // 1. TEST: Patent Service (syncAllPatentSources)
  // ============================================================
  console.log('\n📜 Testing Patent Service (syncAllPatentSources)...');
  try {
    const patentResult = await syncAllPatentSources();
    results.patents.success = true;
    results.patents.count = patentResult.totalPatentsSynced;
    console.log(`   ✅ Patents synced: ${patentResult.totalPatentsSynced}`);
    if (patentResult.errors.length > 0) {
      console.log(`   ⚠️  Errors: ${patentResult.errors.join('; ')}`);
    }
  } catch (error: any) {
    results.patents.error = error.message;
    console.log(`   ❌ Error: ${error.message}`);
  }

  // ============================================================
  // 2. TEST: Legal Case Collector (collectAllLegalCases)
  // ============================================================
  console.log('\n⚖️  Testing Legal Case Collector...');
  try {
    const legalResult = await legalCaseCollector.collectAllLegalCases();
    results.legalCases.success = true;
    results.legalCases.count = legalResult.totalStored;
    console.log(`   ✅ Legal cases collected: ${legalResult.totalCollected}`);
    console.log(`   ✅ Legal cases stored: ${legalResult.totalStored}`);
    if (legalResult.errors.length > 0) {
      console.log(`   ⚠️  Errors: ${legalResult.errors.join('; ')}`);
    }
  } catch (error: any) {
    results.legalCases.error = error.message;
    console.log(`   ❌ Error: ${error.message}`);
  }

  // ============================================================
  // 3. TEST: Patent Collector (collectAllPatents)
  // ============================================================
  console.log('\n🔬 Testing Patent Collector (collectAllPatents)...');
  try {
    const collector = new PatentCollector();
    const allPatentsResult = await collector.collectAllPatents();
    results.patentCollector.success = true;
    results.patentCollector.count = allPatentsResult.totalStored;
    console.log(`   ✅ Patents collected: ${allPatentsResult.totalCollected}`);
    console.log(`   ✅ Patents stored: ${allPatentsResult.totalStored}`);
    if (allPatentsResult.errors.length > 0) {
      console.log(`   ⚠️  Errors: ${allPatentsResult.errors.slice(0, 3).join('; ')}...`);
    }
  } catch (error: any) {
    results.patentCollector.error = error.message;
    console.log(`   ❌ Error: ${error.message}`);
  }

  // ============================================================
  // SUMMARY
  // ============================================================
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log('\n════════════════════════════════════');
  console.log('📊 SUMMARY:');
  console.log(`   Patents Service: ${results.patents.success ? '✅' : '❌'} (${results.patents.count} synced)`);
  console.log(`   Legal Cases: ${results.legalCases.success ? '✅' : '❌'} (${results.legalCases.count} stored)`);
  console.log(`   Patent Collector: ${results.patentCollector.success ? '✅' : '❌'} (${results.patentCollector.count} found)`);
  console.log(`\n⏱️  Duration: ${elapsed}s`);
  console.log('════════════════════════════════════\n');

  return results;
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
