import { liveDataSourcesService } from '../server/services/liveDataSourcesService.js';
import { dataOrchestrator } from '../server/services/data-orchestrator.js';

async function main() {
  console.log('[INIT] Initializing live data sources...');

  // 1. Initialize data sources in DB
  await liveDataSourcesService.initializeLiveDataSources();
  console.log('[INIT] Data sources initialized');

  // 2. Sync all live sources
  const syncResult = await liveDataSourcesService.syncAllLiveSources();
  console.log('[INIT] Live sync complete:', syncResult);

  // 3. Run orchestrator sync for all sources
  const report = await dataOrchestrator.syncAllSources(50);
  console.log('[INIT] Orchestrator sync complete:', {
    successful: report.successful_sources,
    failed: report.failed_sources,
    total_updates: report.total_updates_inserted,
  });

  console.log('[INIT] Done!');
  process.exit(0);
}

main().catch(err => {
  console.error('[INIT] Failed:', err);
  process.exit(1);
});
