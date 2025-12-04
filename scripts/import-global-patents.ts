/**
 * IMPORT SCRIPT: Global Patent Data from all discovered sources
 * Nutzt PatentsView, WIPO, Google Patents, USPTO Bulk Data
 */

import { enhancedPatentService } from './server/services/enhancedPatentService.js';
import { patentMonitoringService } from './server/services/patentMonitoringService.js';

async function importAllPatentSources() {
  console.log('\n🌍 GLOBAL PATENT IMPORT\n════════════════════════════════════\n');

  try {
    // ============================================================
    // PHASE 1: PATENTE IMPORTIEREN
    // ============================================================
    console.log('📥 PHASE 1: Importing patents from all global sources...\n');
    
    const syncResult = await enhancedPatentService.syncAllGlobalPatents();

    console.log('\n📊 IMPORT RESULTS:\n');
    console.log(`Total patents found: ${syncResult.totalFound}`);
    console.log(`Total patents stored: ${syncResult.totalStored}`);
    console.log('\nBy source:');
    for (const source of syncResult.sources) {
      console.log(`  - ${source.name}: ${source.count}`);
    }

    if (syncResult.errors.length > 0) {
      console.log(`\n⚠️  Errors (${syncResult.errors.length}):`);
      syncResult.errors.slice(0, 5).forEach(err => console.log(`  - ${err}`));
      if (syncResult.errors.length > 5) {
        console.log(`  ... and ${syncResult.errors.length - 5} more`);
      }
    }

    // ============================================================
    // PHASE 2: MONITORING SETUP
    // ============================================================
    console.log('\n⏰ PHASE 2: Setting up patent monitoring...\n');

    // Example US Patent Applications to monitor
    const usPatentApps = [
      '17/123456',  // Example format
      '17/654321'
    ];

    // Example PCT Applications
    const pctApps = [
      'PCT/US2024/001234',
      'PCT/US2024/005678'
    ];

    const monitoringResult = await patentMonitoringService.runMonitoringCycle(
      usPatentApps,
      pctApps,
      []
    );

    console.log(`✅ Monitoring setup complete`);
    console.log(`Total applications monitored: ${monitoringResult.totalMonitored}`);
    console.log(`Status alerts: ${monitoringResult.alerts.length}`);

    if (monitoringResult.alerts.length > 0) {
      console.log('\n🔔 Recent alerts:');
      monitoringResult.alerts.slice(-5).forEach(alert => {
        console.log(`  - [${alert.type}] ${alert.applicationNumber}: ${alert.details}`);
      });
    }

    // ============================================================
    // PHASE 3: SUMMARY
    // ============================================================
    console.log('\n════════════════════════════════════');
    console.log('\n✅ IMPORT SUMMARY\n');

    console.log(`📊 Data Imported:`);
    console.log(`   ✅ Patents: ${syncResult.totalStored}`);
    console.log(`   ✅ Monitoring: ${monitoringResult.totalMonitored} apps`);
    console.log(`   ✅ Alerts: ${monitoringResult.alerts.length}`);

    console.log(`\n📝 Sources Used:`);
    console.log(`   1. PatentsView (NIH) - US Patents`);
    console.log(`   2. WIPO PatentScope - International (PCT)`);
    console.log(`   3. Google Patents - Web search`);
    console.log(`   4. USPTO Bulk Data - Complete dumps`);
    console.log(`   5. Lens.org - AI-powered (if configured)`);

    console.log(`\n🚀 Next Steps:`);
    console.log(`   1. Configure API keys for premium services`);
    console.log(`   2. Set up webhook monitoring (WIPO, USPTO)`);
    console.log(`   3. Configure RSS feed monitoring`);
    console.log(`   4. Set up alert notifications (email/webhook)`);

    console.log('\n════════════════════════════════════\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Import error:', error);
    process.exit(1);
  }
}

importAllPatentSources();
