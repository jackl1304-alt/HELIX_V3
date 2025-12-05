// Script zum Prüfen der laufenden Zulassungen im Backend
import 'dotenv/config';
import { storage } from '../server/storage.js';

async function checkOngoingApprovals() {
  try {
    console.log('🔍 Prüfe laufende Zulassungen im Backend...\n');

    // 1. Prüfe alle Projekte
    console.log('1️⃣ Alle Projekte:');
    const allProjects = await storage.getAllProjects();
    console.log(`   Gesamt: ${allProjects.length} Projekte`);
    
    if (allProjects.length > 0) {
      console.log('\n   Projekte nach Status:');
      const byStatus = allProjects.reduce((acc: any, p: any) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {});
      Object.entries(byStatus).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count}`);
      });
    }

    // 2. Prüfe Projekte mit relevantem Status
    console.log('\n2️⃣ Projekte mit Status für laufende Zulassungen:');
    const relevantStatuses = ['regulatory_review', 'approval_pending', 'in_development'];
    const relevantProjects = allProjects.filter((p: any) => 
      relevantStatuses.includes(p.status)
    );
    console.log(`   Gefunden: ${relevantProjects.length} Projekte`);
    
    if (relevantProjects.length > 0) {
      console.log('\n   Details:');
      relevantProjects.forEach((p: any) => {
        console.log(`   - ${p.name} (${p.status})`);
        console.log(`     ID: ${p.id}`);
        console.log(`     Device Class: ${p.device_class || 'N/A'}`);
        console.log(`     Target Markets: ${JSON.stringify(p.target_markets || [])}`);
        console.log(`     Created: ${p.created_at}`);
        console.log('');
      });
    }

    // 3. Prüfe getOngoingApprovals Funktion
    console.log('3️⃣ getOngoingApprovals() Ergebnis:');
    const ongoingApprovals = await storage.getOngoingApprovals();
    console.log(`   Transformiert: ${ongoingApprovals.length} laufende Zulassungen`);
    
    if (ongoingApprovals.length > 0) {
      console.log('\n   Transformierte Daten:');
      ongoingApprovals.forEach((approval: any) => {
        console.log(`   - ${approval.productName}`);
        console.log(`     Status: ${approval.status}`);
        console.log(`     Region: ${approval.region}`);
        console.log(`     Progress: ${approval.progressPercentage}%`);
        console.log('');
      });
    }

    // 4. Zusammenfassung
    console.log('\n📊 Zusammenfassung:');
    console.log(`   - Gesamt Projekte: ${allProjects.length}`);
    console.log(`   - Relevante Projekte: ${relevantProjects.length}`);
    console.log(`   - Laufende Zulassungen (transformiert): ${ongoingApprovals.length}`);

    if (ongoingApprovals.length === 0 && allProjects.length > 0) {
      console.log('\n⚠️  PROBLEM: Es gibt Projekte, aber keine werden als laufende Zulassungen angezeigt!');
      console.log('   Mögliche Ursachen:');
      console.log('   - Projekte haben nicht den richtigen Status (regulatory_review, approval_pending, in_development)');
      console.log('   - Transformations-Fehler in getOngoingApprovals()');
    } else if (allProjects.length === 0) {
      console.log('\n💡 HINWEIS: Keine Projekte in der Datenbank gefunden.');
      console.log('   Erstelle Test-Projekte mit: POST /api/ongoing-approvals/create-test');
    }

  } catch (error: any) {
    console.error('❌ Fehler:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
  
  process.exit(0);
}

checkOngoingApprovals();

