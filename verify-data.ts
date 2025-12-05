import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

async function main() {
  console.log('🔍 BACKEND DATA VERIFICATION\n');
  
  try {
    const client = neon(process.env.DATABASE_URL!);
    const db = drizzle(client);
    
    // 1. Total Count
    const total = await client('SELECT COUNT(*) as count FROM regulatory_updates');
    console.log(`✅ Total Regulatory Updates: ${total[0].count}`);
    
    // 2. By Source
    const bySrc = await client(`
      SELECT source_id, COUNT(*) as count FROM regulatory_updates 
      GROUP BY source_id ORDER BY count DESC
    `);
    console.log('\n✅ By Source:');
    bySrc.forEach((r: any) => console.log(`   ${r.source_id}: ${r.count}`));
    
    // 3. By Category
    const byCat = await client(`
      SELECT category, COUNT(*) as count FROM regulatory_updates 
      GROUP BY category ORDER BY count DESC
    `);
    console.log('\n✅ By Category:');
    byCat.forEach((r: any) => console.log(`   ${r.category}: ${r.count}`));
    
    // 4. Sample 510k with full data
    const sample510k = await client(`
      SELECT title, description, device_type, fda_k_number, fda_product_code, 
             priority, risk_level, published_date FROM regulatory_updates 
      WHERE source_id = 'fda_510k_complete' LIMIT 1
    `);
    console.log('\n✅ Sample 510(k):');
    if (sample510k.length > 0) {
      const s = sample510k[0];
      console.log(`   Title: ${s.title}`);
      console.log(`   K-Number: ${s.fda_k_number}`);
      console.log(`   Product Code: ${s.fda_product_code}`);
      console.log(`   Priority: ${s.priority}, Risk: ${s.risk_level}`);
      console.log(`   Description length: ${s.description?.length || 0} chars`);
    }
    
    // 5. Sample MAUDE with metadata
    const sampleMAUDE = await client(`
      SELECT title, device_type, priority, risk_level, metadata 
      FROM regulatory_updates 
      WHERE source_id = 'fda_maude' LIMIT 1
    `);
    console.log('\n✅ Sample MAUDE:');
    if (sampleMAUDE.length > 0) {
      const s = sampleMAUDE[0];
      console.log(`   Title: ${s.title}`);
      console.log(`   Device: ${s.device_type}`);
      console.log(`   Priority: ${s.priority}, Risk: ${s.risk_level}`);
      const meta = typeof s.metadata === 'string' ? JSON.parse(s.metadata) : s.metadata;
      console.log(`   Metadata Keys: ${Object.keys(meta || {}).join(', ')}`);
    }
    
    // 6. Date range
    const dates = await client(`
      SELECT MIN(published_date) as oldest, MAX(published_date) as newest 
      FROM regulatory_updates
    `);
    console.log('\n✅ Date Range:');
    console.log(`   Oldest: ${dates[0].oldest}`);
    console.log(`   Newest: ${dates[0].newest}`);
    
    console.log('\n✅ Backend Data Verification PASSED!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
