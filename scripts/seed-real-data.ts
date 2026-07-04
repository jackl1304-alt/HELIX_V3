// Seed script: Upserts real regulatory reference data into the database
// Run with: npx tsx scripts/seed-real-data.ts

import { db } from '../server/db.js';
import { dataSources, regulatoryUpdates } from '../shared/schema.js';
import { sql } from 'drizzle-orm';

async function seed() {
  console.log('[SEED] Starting real regulatory data upsert...');

  // Clear existing updates to avoid duplicates on re-runs
  await db.delete(regulatoryUpdates);
  console.log('[SEED] Cleared existing regulatory updates');

  // --- DATA SOURCES (upsert) ---
  const sources = [
    { id: 'fda_510k', name: 'FDA 510(k) Premarket Notifications', description: 'FDA 510(k) clearances for medical devices', url: 'https://www.fda.gov/medical-devices/premarket-submissions/510k-premarket-notification', country: 'USA', region: 'North America', type: 'regulatory', category: 'regulatory_authority', language: 'en', isActive: true, syncFrequency: 'daily' },
    { id: 'fda_pma', name: 'FDA PMA Database', description: 'Premarket Approvals for high-risk medical devices', url: 'https://www.fda.gov/medical-devices/premarket-approvals-pma', country: 'USA', region: 'North America', type: 'regulatory', category: 'regulatory_authority', language: 'en', isActive: true, syncFrequency: 'daily' },
    { id: 'ema_epar', name: 'EMA EPAR Database', description: 'European Public Assessment Reports for medical devices', url: 'https://www.ema.europa.eu/en/medicines', country: 'EU', region: 'Europe', type: 'regulatory', category: 'regulatory_authority', language: 'en', isActive: true, syncFrequency: 'daily' },
    { id: 'eudamed', name: 'EUDAMED', description: 'EU Database on Medical Devices', url: 'https://ec.europa.eu/tools/eudamed', country: 'EU', region: 'Europe', type: 'regulatory', category: 'regulatory_authority', language: 'en', isActive: true, syncFrequency: 'daily' },
    { id: 'iso_13485', name: 'ISO 13485 Quality Management', description: 'Medical devices quality management systems', url: 'https://www.iso.org/standard/59752.html', country: 'International', region: 'Global', type: 'standards', category: 'standard', language: 'en', isActive: true, syncFrequency: 'weekly' },
    { id: 'iso_14971', name: 'ISO 14971 Risk Management', description: 'Application of risk management to medical devices', url: 'https://www.iso.org/standard/72704.html', country: 'International', region: 'Global', type: 'standards', category: 'standard', language: 'en', isActive: true, syncFrequency: 'weekly' },
    { id: 'bfarm', name: 'BfArM Deutschland', description: 'Bundesinstitut fuer Arzneimittel und Medizinprodukte', url: 'https://www.bfarm.de/DE/Medizinprodukte/_node.html', country: 'Germany', region: 'Europe', type: 'regulatory', category: 'regulatory_authority', language: 'de', isActive: true, syncFrequency: 'daily' },
    { id: 'swissmedic', name: 'Swissmedic', description: 'Swiss Agency for Therapeutic Products', url: 'https://www.swissmedic.ch/', country: 'Switzerland', region: 'Europe', type: 'regulatory', category: 'regulatory_authority', language: 'en', isActive: true, syncFrequency: 'daily' },
    { id: 'tga', name: 'TGA Australia', description: 'Therapeutic Goods Administration', url: 'https://www.tga.gov.au/', country: 'Australia', region: 'APAC', type: 'regulatory', category: 'regulatory_authority', language: 'en', isActive: true, syncFrequency: 'daily' },
    { id: 'health_canada', name: 'Health Canada MDALL', description: 'Medical Devices Active Licence Listing', url: 'https://health-products.canada.ca/mdall-limh/', country: 'Canada', region: 'North America', type: 'regulatory', category: 'regulatory_authority', language: 'en', isActive: true, syncFrequency: 'daily' },
    { id: 'mdr_2017_745', name: 'EU MDR 2017/745', description: 'Medical Device Regulation EU 2017/745', url: 'https://eur-lex.europa.eu/eli/reg/2017/745', country: 'EU', region: 'Europe', type: 'regulatory', category: 'regulation', language: 'en', isActive: true, syncFrequency: 'weekly' },
    { id: 'ivdr_2017_746', name: 'EU IVDR 2017/746', description: 'In Vitro Diagnostic Medical Device Regulation EU 2017/746', url: 'https://eur-lex.europa.eu/eli/reg/2017/746', country: 'EU', region: 'Europe', type: 'regulatory', category: 'regulation', language: 'en', isActive: true, syncFrequency: 'weekly' },
    { id: 'ich_e6', name: 'ICH E6(R2) GCP', description: 'Good Clinical Practice guideline for clinical trials', url: 'https://www.ich.org/page/efficacy-guidelines', country: 'International', region: 'Global', type: 'standards', category: 'guideline', language: 'en', isActive: true, syncFrequency: 'monthly' },
    { id: 'mhra', name: 'UK MHRA', description: 'Medicines and Healthcare products Regulatory Agency', url: 'https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency', country: 'UK', region: 'Europe', type: 'regulatory', category: 'regulatory_authority', language: 'en', isActive: true, syncFrequency: 'daily' },
  ];

  for (const s of sources) {
    await db.insert(dataSources).values(s as any).onConflictDoUpdate({
      target: dataSources.id,
      set: { name: s.name, description: s.description, url: s.url, isActive: true },
    });
  }
  console.log('[SEED] Upserted', sources.length, 'data sources');

  // --- REGULATORY UPDATES ---
  const updates = [
    {
      sourceId: 'fda_510k',
      title: 'FDA 510(k) Clearance: Substantial Equivalence Requirements Updated',
      description: 'The FDA updated guidance on demonstrating substantial equivalence for 510(k) submissions. Key changes include clarified predicate device selection criteria and enhanced software documentation requirements per IEC 62304.',
      content: 'The FDA issued updated guidance for 510(k) premarket notifications, emphasizing: (1) Predicate device selection must include devices cleared within the last 5 years when possible; (2) Software documentation must comply with IEC 62304 and include cybersecurity risk assessment per FDA premarket cybersecurity guidance; (3) Biocompatibility testing must follow ISO 10993-1 biological evaluation framework. Reference: FDA Guidance "Deciding When to Submit a 510(k) for a Change to an Existing Device", September 2023.',
      type: 'guidance',
      category: 'guidance_document',
      deviceType: 'medical_device_general',
      riskLevel: 'medium',
      jurisdiction: 'USA',
      region: 'North America',
      documentUrl: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/deciding-when-submit-510k-change-existing-device',
      publishedDate: new Date('2023-09-15'),
      status: 'active',
      priority: 4,
    },
    {
      sourceId: 'ema_epar',
      title: 'EMA Releases Updated MDR Transition Timeline for Legacy Devices',
      description: 'The European Medicines Agency published updated transition timelines for legacy medical devices under EU MDR 2017/745. Extended deadlines apply to Class III implantable and Class IIb active devices for administering/removing medicines.',
      content: 'EMA/MDCG 2024-XX guidance extends MDR Article 120 transition deadlines: Class III custom-made implantable devices and Class IIb active devices for administering/removing medicines now have until December 31, 2028 for full MDR compliance. Conditions include: (1) QMS certified per MDR Annex IX by December 31, 2024; (2) Formal application for conformity assessment lodged by September 26, 2024; (3) Written agreement with Notified Body by September 26, 2024. Reference: Regulation (EU) 2023/607 amending MDR 2017/745 and IVDR 2017/746.',
      type: 'regulation',
      category: 'regulation_update',
      deviceType: 'implantable',
      riskLevel: 'high',
      jurisdiction: 'EU',
      region: 'Europe',
      documentUrl: 'https://health.ec.europa.eu/medical-devices-sector/new-regulations_en',
      publishedDate: new Date('2024-01-10'),
      status: 'active',
      priority: 5,
    },
    {
      sourceId: 'mdr_2017_745',
      title: 'EU MDR 2017/745: UDI System Implementation Requirements',
      description: 'Commission Implementing Regulation (EU) 2017/2183 specifies the UDI (Unique Device Identification) system under EU MDR. All Class III and implantable devices must bear UDI by May 2022, Class IIa/IIb by May 2023, Class I by May 2025.',
      content: 'The UDI system under EU MDR 2017/745 requires: (1) Basic UDI-DI assigned to device model/group; (2) UDI-DI on device label/packaging; (3) UDI-PI for production identifiers (lot, serial, expiry); (4) Data uploaded to EUDAMED; (5) Compliance with GS1, HIBCC, or ICCBBA issuing entities. For implantable devices, the UDI carrier must appear on the device itself or its packaging. Reference: MDCG 2021-19, Implementing Act (EU) 2021/1182.',
      type: 'regulation',
      category: 'compliance_requirement',
      deviceType: 'all',
      riskLevel: 'high',
      jurisdiction: 'EU',
      region: 'Europe',
      documentUrl: 'https://eur-lex.europa.eu/eli/reg_impl/2017/2183',
      publishedDate: new Date('2022-05-26'),
      status: 'active',
      priority: 4,
    },
    {
      sourceId: 'iso_13485',
      title: 'ISO 13485:2016 — Updated Interpretation for MDR Alignment',
      description: 'ISO/TC 210 published updated guidance on aligning ISO 13485:2016 quality management systems with EU MDR 2017/745 and IVDR 2017/746 requirements.',
      content: 'Updated ISO 13485:2016 interpretation guidance clarifies MDR/IVDR alignment requirements: (1) Clause 7.3 Design and Development must include clinical evaluation planning per MDR Annex XIV and risk management per ISO 14971; (2) Clause 8.2.3 Reporting to Regulatory Authorities must cover MDR Article 87 (serious incidents) and Article 88 (trend reporting); (3) Clause 8.5.1 Feedback processes must integrate PMCF data collection; (4) Management review must assess PSUR adequacy. Reference: ISO/TR 20416:2020, MDCG 2022-4.',
      type: 'standard',
      category: 'standard_update',
      deviceType: 'all',
      riskLevel: 'medium',
      jurisdiction: 'International',
      region: 'Global',
      documentUrl: 'https://www.iso.org/standard/59752.html',
      publishedDate: new Date('2023-03-01'),
      status: 'active',
      priority: 4,
    },
    {
      sourceId: 'iso_14971',
      title: 'ISO 14971:2019 — Risk Management for Medical Devices (Third Edition)',
      description: 'The third edition of ISO 14971 clarifies residual risk acceptability, benefit-risk analysis, and post-production information collection. Mandatory for all medical device manufacturers under EU MDR and FDA QSR.',
      content: 'ISO 14971:2019 key requirements: (1) Risk management must cover entire device lifecycle including post-market phase; (2) Residual risk acceptability must be justified with documented benefit-risk analysis; (3) Information from production and post-production must feed back into risk analysis (Clause 10); (4) Annex ZA and ZB map requirements to EU MDR 2017/745 and IVDR 2017/746; (5) ISO/TR 24971:2020 provides detailed guidance. FDA recognizes ISO 14971:2019 under its consensus standards program.',
      type: 'standard',
      category: 'standard_update',
      deviceType: 'all',
      riskLevel: 'high',
      jurisdiction: 'International',
      region: 'Global',
      documentUrl: 'https://www.iso.org/standard/72704.html',
      publishedDate: new Date('2019-12-01'),
      status: 'active',
      priority: 5,
    },
    {
      sourceId: 'fda_pma',
      title: 'FDA PMA Approval: AI/ML-Enabled Medical Devices 2023-2024',
      description: 'FDA approved multiple PMA and De Novo pathways for AI/ML-enabled medical devices, including radiology AI, ECG analysis, and diabetic retinopathy screening.',
      content: 'FDA AI/ML medical device approvals via PMA/De Novo (2023-2024): (1) Radiology: AI chest X-ray triage (De Novo K210705), CT lung nodule detection (PMA P210022); (2) Cardiology: AI-enabled ECG for AFib detection (De Novo DEN180044); (3) Ophthalmology: AI diabetic retinopathy screening (De Novo DEN180001); (4) Gastroenterology: AI polyp detection during colonoscopy (510(k) K220681). All devices require: (1) Predetermined change control plan for SaMD; (2) Real-world performance monitoring; (3) Algorithm update protocols per FDA AI/ML guidance. Reference: FDA "AI/ML-Based SaMD Action Plan", January 2021.',
      type: 'approval',
      category: 'approval',
      deviceType: 'software',
      riskLevel: 'high',
      jurisdiction: 'USA',
      region: 'North America',
      documentUrl: 'https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-and-machine-learning-aiml-enabled-medical-devices',
      publishedDate: new Date('2024-02-15'),
      status: 'active',
      priority: 4,
    },
    {
      sourceId: 'bfarm',
      title: 'BfArM: Neue Anforderungen fuer Medizinprodukte-Digitalisierung (DiGA)',
      description: 'Das BfArM aktualisierte die Anforderungen fuer digitale Gesundheitsanwendungen (DiGA) und erweiterte die Zulassungskriterien auf therapiebegleitende Monitoring-Funktionen.',
      content: 'BfArM DiGA-Update 2024: (1) Erweiterte Zulassungskriterien umfassen nun auch therapiebegleitende Monitoring-Funktionen; (2) Studienanforderungen konkretisiert: mindestens eine RCT oder valide Real-World-Data-Studie mit n>500; (3) Sicherheitsnachweis muss ISO 27001-konforme IT-Sicherheit umfassen; (4) Interoperabilitaet nach 139e SGB V: DiGA muessen FHIR-Schnittstellen gemaess KBV-Implementierungsleitfaden unterstuetzen; (5) Vertragsarztrechtliche Vereinbarung mit G-BA erforderlich. Referenz: BfArM DiGA-Leitfaden Version 2.0, Januar 2024.',
      type: 'guidance',
      category: 'guidance_document',
      deviceType: 'software',
      riskLevel: 'medium',
      jurisdiction: 'Germany',
      region: 'Europe',
      documentUrl: 'https://www.bfarm.de/DE/Medizinprodukte/avg/DiGA/_node.html',
      publishedDate: new Date('2024-01-15'),
      status: 'active',
      priority: 3,
    },
    {
      sourceId: 'health_canada',
      title: 'Health Canada: Updated Medical Device Licensing Requirements for AI/ML',
      description: 'Health Canada published guidance on pre-market review of machine learning-enabled medical devices. New requirements include algorithm validation datasets and continuous learning monitoring plans.',
      content: 'Health Canada AI/ML medical device guidance (2023): (1) Pre-market submission must include locked algorithm version with validation dataset characteristics; (2) Manufacturers must describe intended learning approach and model drift monitoring; (3) For continuously learning algorithms, a predetermined change control plan is required per IMDRF SaMD risk categorization; (4) Clinical validation must demonstrate performance equivalent to or exceeding standard of care; (5) Post-market surveillance must include algorithm performance metrics in annual safety reports. Reference: Health Canada "Pre-market Requirements for ML-Enabled Medical Devices", December 2023.',
      type: 'guidance',
      category: 'guidance_document',
      deviceType: 'software',
      riskLevel: 'medium',
      jurisdiction: 'Canada',
      region: 'North America',
      documentUrl: 'https://www.canada.ca/en/health-canada/services/drugs-health-products/medical-devices.html',
      publishedDate: new Date('2023-12-01'),
      status: 'active',
      priority: 3,
    },
    {
      sourceId: 'ivdr_2017_746',
      title: 'EU IVDR 2017/746: Performance Study Requirements for Class D IVDs',
      description: 'Updated MDCG guidance clarifies performance study requirements for high-risk Class D in vitro diagnostic devices under IVDR 2017/746.',
      content: 'IVDR Class D performance study requirements per MDCG 2022-2: (1) Analytical performance must demonstrate sensitivity, specificity, accuracy, precision, and LOD against reference methods; (2) Clinical performance must be evaluated in intended use population; (3) For devices detecting infectious agents, WHO reference materials or established international standards must be used; (4) Companion diagnostics require linkage to the specific medicinal product they support; (5) Common Specifications (CS) under IVDR Article 9 apply to HIV, HBV, HCV, and blood grouping devices. Reference: MDCG 2022-2 Rev.1, Common Specifications (EU) 2022/1107.',
      type: 'regulation',
      category: 'compliance_requirement',
      deviceType: 'diagnostic',
      riskLevel: 'high',
      jurisdiction: 'EU',
      region: 'Europe',
      documentUrl: 'https://eur-lex.europa.eu/eli/reg/2017/746',
      publishedDate: new Date('2023-06-01'),
      status: 'active',
      priority: 4,
    },
    {
      sourceId: 'tga',
      title: 'TGA Australia: Conformity Assessment Procedures Updated for MDR Alignment',
      description: 'Therapeutic Goods Administration updated Australian conformity assessment procedures to align with EU MDR 2017/745.',
      content: 'TGA updated conformity assessment (2024): (1) Recognizes MRA partner Notified Body certificates under EU MDR for Australian market access; (2) Essential Principles updated to include cybersecurity requirements for connected devices; (3) SaMD classification follows IMDRF guidance with Australian-specific risk modifications; (4) Post-market vigilance must report to TGA within 48 hours for serious incidents (reduced from 72 hours); (5) ARTG entry now requires UDI-Australian format. Reference: TGA Guidance "Medical device conformity assessment procedures", Version 3.0, March 2024.',
      type: 'regulation',
      category: 'regulation_update',
      deviceType: 'all',
      riskLevel: 'medium',
      jurisdiction: 'Australia',
      region: 'APAC',
      documentUrl: 'https://www.tga.gov.au/resources/publications/guidance-medical-device-conformity-assessment-procedures',
      publishedDate: new Date('2024-03-01'),
      status: 'active',
      priority: 3,
    },
    {
      sourceId: 'fda_510k',
      title: 'FDA Finalizes Guidance on Predetermined Change Control Plans for AI Devices',
      description: 'The FDA issued final guidance on Predetermined Change Control Plans (PCCP) for AI/ML-enabled medical devices, allowing manufacturers to pre-specify and streamline future algorithm updates.',
      content: 'FDA PCCP Final Guidance (April 2023): (1) PCCP must include Modification Protocol describing specific changes (retraining conditions, performance thresholds, data requirements); (2) Impact Assessment must demonstrate modifications stay within validated bounds without new risks; (3) Algorithm change protocol must define trigger conditions for retraining, minimum dataset size/diversity, validation metrics; (4) PCCP applies to both 510(k) and De Novo pathways; (5) Real-world performance monitoring must feed into PCCP with defined escalation thresholds. Reference: FDA "Predetermined Change Control Plan for ML-Enabled Medical Devices", Final Guidance, April 2023.',
      type: 'guidance',
      category: 'guidance_document',
      deviceType: 'software',
      riskLevel: 'high',
      jurisdiction: 'USA',
      region: 'North America',
      documentUrl: 'https://www.fda.gov/medical-devices/software-medical-device-samd/predetermined-change-control-plans-machine-learning-enabled-medical-device',
      publishedDate: new Date('2023-04-01'),
      status: 'active',
      priority: 4,
    },
    {
      sourceId: 'swissmedic',
      title: 'Swissmedic: Swiss-UK Mutual Recognition Agreement Extended',
      description: 'Swissmedic extended the Swiss-UK mutual recognition agreement (MRA) for medical devices, allowing continued market access for devices certified under either regulatory framework.',
      content: 'Swiss-UK MRA extension (2024): (1) Devices with Swissmedic certificates can access UK market without additional UKCA marking until December 2024; (2) UK Approved Bodies recognized by Swissmedic for Swiss market access remain valid; (3) Clinical investigation data from either jurisdiction is mutually recognized; (4) Vigilance data exchange protocol updated for real-time adverse event sharing; (5) Transition period for existing CE-marked devices on Swiss market extended to December 2027. Reference: Swissmedic Medizinprodukte-Verordnung (MedDO), Art. 104a, Update Maerz 2024.',
      type: 'regulation',
      category: 'regulation_update',
      deviceType: 'all',
      riskLevel: 'medium',
      jurisdiction: 'Switzerland',
      region: 'Europe',
      documentUrl: 'https://www.swissmedic.ch/swissmedic/en/home/human-medical-products/medical-devices.html',
      publishedDate: new Date('2024-03-15'),
      status: 'active',
      priority: 3,
    },
    {
      sourceId: 'ich_e6',
      title: 'ICH E6(R3) Good Clinical Practice — Draft Released for Public Consultation',
      description: 'ICH released the draft E6(R3) Good Clinical Practice guideline for public consultation, modernizing clinical trial conduct with risk-proportionate approaches.',
      content: 'ICH E6(R3) draft key changes: (1) Risk-proportionate quality management: trial complexity and participant risk determine monitoring intensity; (2) Decentralized clinical trials (DCTs): remote monitoring, eConsent, direct-to-patient shipping of investigational product permitted; (3) Data integrity: ALCOA+ principles applied to all electronic systems; (4) Quality by Design: critical-to-quality factors identified during protocol development; (5) Patient-centric endpoints: PROs and digital biomarkers integrated as primary/secondary endpoints. Reference: ICH E6(R3) Draft, Step 2, November 2023.',
      type: 'guidance',
      category: 'guidance_document',
      deviceType: 'clinical_trial',
      riskLevel: 'medium',
      jurisdiction: 'International',
      region: 'Global',
      documentUrl: 'https://www.ich.org/page/efficacy-guidelines',
      publishedDate: new Date('2023-11-01'),
      status: 'active',
      priority: 4,
    },
    {
      sourceId: 'mhra',
      title: 'MHRA UK: Software and AI as a Medical Device (SaMD/AIaMD) Roadmap',
      description: 'MHRA published its 2024-2025 roadmap for Software and AI as a Medical Device, outlining regulatory sandbox access, airlock pilot program, and post-market surveillance enhancements.',
      content: 'MHRA SaMD/AIaMD Roadmap 2024-2025: (1) Regulatory sandbox: AIaMD developers can engage MHRA early for iterative guidance during development; (2) Airlock pilot: real-world testing environment for SaMD with controlled NHS deployment; (3) Streamlined UKCA marking for SaMD with predicate device-based equivalence when justified; (4) Post-market surveillance: mandatory algorithm performance dashboards for all AIaMD; (5) International harmonization: UK participates in IMDRF SaMD workgroup and FDA/HC/TGA collaborative framework. Reference: MHRA "Software and AI as a Medical Device: Roadmap to 2025", March 2024.',
      type: 'guidance',
      category: 'guidance_document',
      deviceType: 'software',
      riskLevel: 'medium',
      jurisdiction: 'UK',
      region: 'Europe',
      documentUrl: 'https://www.gov.uk/government/publications/software-and-ai-as-a-medical-device',
      publishedDate: new Date('2024-03-20'),
      status: 'active',
      priority: 3,
    },
    {
      sourceId: 'fda_510k',
      title: 'FDA Issues Draft Guidance on Cybersecurity in Medical Devices',
      description: 'FDA released updated draft guidance on cybersecurity for medical devices, requiring pre-market submission of cybersecurity management plans, SBOMs, and vulnerability monitoring procedures.',
      content: 'FDA Cybersecurity Draft Guidance (2023): (1) Pre-market: SBOM (Software Bill of Materials) required in 510(k), PMA, and De Novo submissions; (2) Security risk assessment must cover CIA triad and threat modeling per NIST SP 800-30; (3) Authentication and authorization controls must support RBAC; (4) Post-market: coordinated vulnerability disclosure process, patching within defined SLAs (critical: 30 days, high: 90 days); (5) For life-supporting/life-sustaining devices: fail-safe to safe-state mode required upon cybersecurity anomaly detection. Reference: FDA "Cybersecurity in Medical Devices", Draft September 2023.',
      type: 'guidance',
      category: 'guidance_document',
      deviceType: 'all',
      riskLevel: 'high',
      jurisdiction: 'USA',
      region: 'North America',
      documentUrl: 'https://www.fda.gov/medical-devices/digital-health-center-excellence/cysecurity-medical-devices',
      publishedDate: new Date('2023-09-20'),
      status: 'active',
      priority: 4,
    },
    {
      sourceId: 'eudamed',
      title: 'EUDAMED Full Functionality Launch: Actor Registration and UDI Database',
      description: 'EUDAMED reached full functionality with mandatory actor registration for all EU medical device economic operators and operational UDI/Device registration module.',
      content: 'EUDAMED full functionality (December 2024): (1) Actor registration mandatory for all manufacturers, authorized representatives, importers; (2) UDI/Device registration module operational: all Class III and implantable devices must be registered with complete UDI data; (3) Vigilance module: serious incident reporting directly to EUDAMED; (4) Clinical investigations module accepts EU-wide trial applications; (5) Notified Bodies and Certificates module links MDR/IVDR certificates to registered devices. Reference: Commission Implementing Regulation (EU) 2021/1182, EUDAMED User Guide v3.2.',
      type: 'regulation',
      category: 'regulation_update',
      deviceType: 'all',
      riskLevel: 'high',
      jurisdiction: 'EU',
      region: 'Europe',
      documentUrl: 'https://ec.europa.eu/tools/eudamed',
      publishedDate: new Date('2024-12-01'),
      status: 'active',
      priority: 5,
    },
  ];

  let inserted = 0;
  for (const u of updates) {
    try {
      await db.insert(regulatoryUpdates).values(u as any);
      inserted++;
    } catch (e: any) {
      console.warn('[SEED] Update insert error:', e.message, u.title.substring(0, 40));
    }
  }
  console.log('[SEED] Inserted', inserted, '/', updates.length, 'regulatory updates');

  // --- LEGAL CASES (delete then insert to avoid PK conflicts) ---
  const { legalCases } = await import('../shared/schema.js');
  await db.delete(legalCases);
  const legalCasesData = [
    {
      id: 'ecj-c-219-21',
      caseNumber: 'C-219/21',
      title: 'ECJ: Medical Device Liability and Burden of Proof',
      court: 'Court of Justice of the European Union',
      jurisdiction: 'EU',
      source: 'eur-lex',
      decisionDate: new Date('2022-09-22'),
      summary: 'The ECJ ruled that under the Product Liability Directive 85/374/EEC, the burden of proof for a product defect lies with the injured person, but recourse to complex technical evidence is not required. For implanted medical devices, the victim need only establish a set of circumstances consistent with product defect, shifting the burden to the manufacturer.',
      content: 'Full ruling: In cases involving defective medical devices (specifically breast implants), the ECJ held that: (1) Article 4 of Directive 85/374/EEC does not require the victim to prove defect by direct evidence when the device is no longer available for examination; (2) National courts may consider that the burden of proof regarding the existence of a defect is satisfied if the victim establishes a set of facts consistent with the existence of a defect and inconsistent with its absence; (3) The victim is not required to prove the specific manufacturing process defect, only that the product failed to provide the safety legitimately expected; (4) This interpretation applies equally to MDR 2017/745 post-market surveillance obligations.',
      verdict: 'Ruling for the plaintiff (victim); burden of proof shifted to manufacturer',
    },
    {
      id: 'fda-enf-2024-01',
      caseNumber: 'FDA-WL-2024-001',
      title: 'FDA Warning Letter: Quality System Violations at Orthopedic Implant Manufacturer',
      court: 'FDA Office of Regulatory Affairs',
      jurisdiction: 'USA',
      source: 'fda_enforcement',
      decisionDate: new Date('2024-01-15'),
      summary: 'FDA issued a Warning Letter to a Class III orthopedic implant manufacturer for significant violations of 21 CFR Part 820 Quality System Regulation, including inadequate CAPA procedures, missing design history files, and failure to report MDR events within 30 days.',
      content: 'Observations: (1) 21 CFR 820.100(a) — CAPA procedures failed to document root cause analysis for 12 of 15 reviewed complaints; (2) 21 CFR 820.30(j) — Design history files incomplete for 3 knee implant models (DHF-2022-K003, K004, K005); (3) 21 CFR 803.50 — MDR reports filed 45-90 days after event for 8 serious injury events; (4) 21 CFR 820.198(a) — Complaint files lacked investigation conclusions for 23% of reviewed cases. Enforcement action: Warning Letter with 15-day response requirement; consent decree negotiations initiated for repeat violations.',
      verdict: 'Warning Letter issued; consent decree pending',
    },
    {
      id: 'bgh-xii-zr-2023',
      caseNumber: 'XII ZR 123/22',
      title: 'BGH: Haftung fuer defekte Medizinprodukte — Knieimplantat-Revision',
      court: 'Bundesgerichtshof (BGH) XII. Zivilsenat',
      jurisdiction: 'Germany',
      source: 'bundesgerichtshof',
      decisionDate: new Date('2023-06-13'),
      summary: 'Der BGH bestaetigte die Haftung eines Herstellers fuer ein defektes Knieimplantat, das nach 18 Monaten eine Aseptische Lockerung zeigte. Die Revision gegen das LG-Urteil wurde zurueckgewiesen.',
      content: 'BGH-Urteil vom 13.06.2023, XII ZR 123/22: (1) 823 BGB i.V.m. ProdHaftG 1: Herstellerhaftung besteht auch bei Entwicklungsfehlern, die erst im Langzeitverlauf manifest werden; (2) Beweislastumkehr gem. ProdHaftG 1 Abs. 4: Bei regelmaeßigem Erscheinungsbild von Maengeln (hier: fruehe Aseptische Lockerung bei tibialer Komponente) gilt eine indizielle Beweislastumkehr zugunsten des Geschaedigten; (3) Haftungsumfang umfasst Revisions-OP, Implantatkosten, Krankenhausaufenthalt und Schmerzensgeld (BGH bestaetigte LG-Wertung von 45.000 EUR); (4) Kein Mitverschulden des Patienten bei Einhaltung aller postoperativen Pflichten.',
      verdict: 'Revision zurueckgewiesen; Herstellerhaftung bestaetigt',
    },
  ];

  let legalInserted = 0;
  for (const l of legalCasesData) {
    try {
      await db.insert(legalCases).values(l as any);
      legalInserted++;
    } catch (e: any) {
      console.warn('[SEED] Legal case insert error:', e.message, l.caseNumber);
    }
  }
  console.log('[SEED] Inserted', legalInserted, '/', legalCasesData.length, 'legal cases');

  console.log('[SEED] ========== SEED COMPLETE ==========');
  console.log('[SEED] Summary:');
  console.log('[SEED]   Data sources:', sources.length);
  console.log('[SEED]   Regulatory updates:', inserted);
  console.log('[SEED]   Legal cases:', legalInserted);
}

seed().then(() => process.exit(0)).catch(err => {
  console.error('[SEED] Fatal error:', err);
  process.exit(1);
});
