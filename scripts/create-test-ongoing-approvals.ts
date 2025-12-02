// Script zum Erstellen von Test-Projekten für laufende Zulassungen
import 'dotenv/config';
import { config } from 'dotenv';
config();
import { storage } from '../server/storage.js';

async function createTestProjects() {
  try {
    console.log('🚀 Erstelle Test-Projekte für laufende Zulassungen...\n');

    const testProjects = [
      {
        name: 'CardioSense AI Monitoring System',
        description: 'KI-gestütztes EKG-Monitoring-System für kontinuierliche Herzüberwachung',
        deviceType: 'Diagnostic Device',
        deviceClass: 'Klasse IIa',
        intendedUse: 'Kontinuierliche EKG-Überwachung und Arrhythmie-Erkennung',
        therapeuticArea: 'Kardiologie',
        status: 'regulatory_review',
        riskLevel: 'high',
        priority: 1,
        targetMarkets: ['EU'],
        startDate: new Date('2025-06-01').toISOString(),
        targetSubmissionDate: new Date('2025-06-15').toISOString(),
        estimatedApprovalDate: new Date('2025-12-15').toISOString(),
        estimatedCostRegulatory: 180000,
        metadata: {
          company: 'MedTech Innovations GmbH',
          contactPerson: 'Dr. Sarah Weber - Regulatory Affairs',
          challenges: [
            'Zusätzliche klinische Daten für KI-Algorithmus angefordert',
            'Post-Market Surveillance Plan muss erweitert werden'
          ],
          nextSteps: [
            'Antwort auf Fragen der Benannten Stelle bis 15. August',
            'Erweiterte klinische Validierung einreichen'
          ]
        }
      },
      {
        name: 'NeuroStim Implant V3',
        description: 'Tiefenhirnstimulations-Implantat der dritten Generation',
        deviceType: 'Implantable Device',
        deviceClass: 'Class III',
        intendedUse: 'Behandlung von Parkinson und essentieller Tremor',
        therapeuticArea: 'Neurologie',
        status: 'approval_pending',
        riskLevel: 'critical',
        priority: 1,
        targetMarkets: ['US'],
        startDate: new Date('2025-03-10').toISOString(),
        targetSubmissionDate: new Date('2025-03-10').toISOString(),
        estimatedApprovalDate: new Date('2026-01-30').toISOString(),
        estimatedCostRegulatory: 875000,
        metadata: {
          company: 'Brain Tech Solutions',
          contactPerson: 'Mark Johnson - VP Regulatory',
          challenges: [
            'FDA fordert erweiterte Langzeitsicherheitsdaten',
            'Zusätzliche Biokompatibilitätsstudien erforderlich'
          ],
          nextSteps: [
            'Antwort auf FDA Major Deficiency Letter bis 20. August',
            'Advisory Panel Meeting vorbereiten'
          ]
        }
      },
      {
        name: 'FlexiScope Endoskop',
        description: 'Flexibles Endoskop mit verbesserter Bildqualität',
        deviceType: 'Surgical Device',
        deviceClass: 'Class II',
        intendedUse: 'Gastrointestinale Endoskopie',
        therapeuticArea: 'Gastroenterologie',
        status: 'in_development',
        riskLevel: 'medium',
        priority: 2,
        targetMarkets: ['Japan'],
        startDate: new Date('2025-07-01').toISOString(),
        targetSubmissionDate: new Date('2025-09-01').toISOString(),
        estimatedApprovalDate: new Date('2026-03-15').toISOString(),
        estimatedCostRegulatory: 8500000,
        metadata: {
          company: 'Precision Medical Devices',
          contactPerson: 'Hiroshi Tanaka - Japan Representative',
          challenges: [
            'Anpassung an japanische JIS Standards erforderlich',
            'Lokale klinische Daten müssen ergänzt werden'
          ],
          nextSteps: [
            'Response zu Administrative Review einreichen',
            'Lokale Klinik-Kooperationen etablieren'
          ]
        }
      }
    ];

    console.log(`Erstelle ${testProjects.length} Test-Projekte...\n`);

    for (const projectData of testProjects) {
      try {
        const project = await storage.createProject(projectData);
        console.log(`✅ Projekt erstellt: ${project.name} (ID: ${project.id})`);
        console.log(`   Status: ${project.status}`);
        console.log(`   Region: ${JSON.stringify(projectData.targetMarkets)}`);
        console.log('');
      } catch (error: any) {
        console.error(`❌ Fehler beim Erstellen von ${projectData.name}:`, error.message);
      }
    }

    // Prüfe Ergebnis
    console.log('\n📊 Prüfe Ergebnis...');
    const ongoingApprovals = await storage.getOngoingApprovals();
    console.log(`✅ ${ongoingApprovals.length} laufende Zulassungen gefunden\n`);

    if (ongoingApprovals.length > 0) {
      console.log('Erfolgreich erstellt:');
      ongoingApprovals.forEach((approval: any) => {
        console.log(`  - ${approval.productName} (${approval.status}, ${approval.progressPercentage}%)`);
      });
    }

  } catch (error: any) {
    console.error('❌ Fehler:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
  
  process.exit(0);
}

createTestProjects();
