import 'dotenv/config';

async function testPatents() {
  try {
    console.log('\n🔬 Testing Patent Collector...');
    const { patentCollector } = await import('./server/services/patentCollector.js');
    const patents = await patentCollector.searchPatents('medical device', 10);
    console.log(`✅ Patents: ${patents?.length || 0} items`);
    return patents?.length || 0;
  } catch (error: any) {
    console.error(`❌ Patents Error: ${error.message}`);
    return 0;
  }
}

async function testLegalCases() {
  try {
    console.log('\n⚖️  Testing Legal Case Collector...');
    const { legalCaseCollector } = await import('./server/services/legalCaseCollector.js');
    const cases = await legalCaseCollector.searchLegalCases('medical device', 10);
    console.log(`✅ Legal Cases: ${cases?.length || 0} items`);
    return cases?.length || 0;
  } catch (error: any) {
    console.error(`❌ Legal Cases Error: ${error.message}`);
    return 0;
  }
}

async function testPatentService() {
  try {
    console.log('\n📜 Testing Patent Service...');
    const { patentService } = await import('./server/services/patentService.js');
    const patents = await patentService.searchUSPTOPatents('device', 10);
    console.log(`✅ Patent Service: ${patents?.length || 0} items`);
    return patents?.length || 0;
  } catch (error: any) {
    console.error(`❌ Patent Service Error: ${error.message}`);
    return 0;
  }
}

async function main() {
  console.log('🧪 TESTING ALL ALTERNATIVE SOURCES\n');
  console.log('═══════════════════════════════════════');
  
  const results: Record<string, number> = {};
  
  results['Patents'] = await testPatents();
  results['Legal Cases'] = await testLegalCases();
  results['Patent Service'] = await testPatentService();
  
  console.log('\n═══════════════════════════════════════');
  console.log('\n📊 SUMMARY:');
  for (const [name, count] of Object.entries(results)) {
    console.log(`   ${name}: ${count} items`);
  }
}

main();
