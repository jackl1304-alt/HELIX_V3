import 'dotenv/config';
import { clinicalTrialsService } from './server/services/clinicalTrialsService.js';

async function main() {
  try {
    console.log('🔬 Fetching device clinical trials...\n');
    const trials = await clinicalTrialsService.collectDeviceTrials(30);
    console.log(`✅ Fetched ${trials.length} clinical trials`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

main();
