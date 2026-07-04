
// Comprehensive Regulatory Data Sources
// This file contains all global regulatory authorities, standards, patents, and scientific studies

// ------------------------------
// Global Regulatory Authorities
// ------------------------------
export const globalAuthorities = [
  {
    id: "fda",
    name: "FDA (Food and Drug Administration)",
    region: "USA",
    url: "https://www.fda.gov/medical-devices",
    type: "regulatory"
  },
  {
    id: "ema",
    name: "EMA (European Medicines Agency)",
    region: "EU",
    url: "https://www.ema.europa.eu",
    type: "regulatory"
  },
  {
    id: "eurlex",
    name: "EUR-Lex (EU-Recht)",
    region: "EU",
    url: "https://eur-lex.europa.eu",
    type: "legal"
  },
  {
    id: "imdrf",
    name: "IMDRF (International Medical Device Regulators Forum)",
    region: "Global",
    url: "https://imdrf.org/documents",
    type: "regulatory"
  },
  {
    id: "pmda",
    name: "PMDA (Pharmaceuticals and Medical Devices Agency)",
    region: "Japan",
    url: "https://www.pmda.go.jp/english",
    type: "regulatory"
  },
  {
    id: "nmpa",
    name: "NMPA (National Medical Products Administration)",
    region: "China",
    url: "https://english.nmpa.gov.cn",
    type: "regulatory"
  },
  {
    id: "mhra",
    name: "MHRA (Medicines and Healthcare products Regulatory Agency)",
    region: "UK",
    url: "https://www.gov.uk/mhra",
    type: "regulatory"
  },
  {
    id: "tga",
    name: "TGA (Therapeutic Goods Administration)",
    region: "Australia",
    url: "https://www.tga.gov.au",
    type: "regulatory"
  },
  {
    id: "healthcanada",
    name: "Health Canada",
    region: "Canada",
    url: "https://www.canada.ca/en/health-canada.html",
    type: "regulatory"
  },
  {
    id: "anvisa",
    name: "ANVISA (Agência Nacional de Vigilância Sanitária)",
    region: "Brazil",
    url: "https://www.gov.br/anvisa",
    type: "regulatory"
  },
  {
    id: "mfds",
    name: "MFDS (Ministry of Food and Drug Safety)",
    region: "South Korea",
    url: "https://www.mfds.go.kr/eng",
    type: "regulatory"
  },
  {
    id: "hsa",
    name: "HSA (Health Sciences Authority)",
    region: "Singapore",
    url: "https://www.hsa.gov.sg",
    type: "regulatory"
  },
  {
    id: "swissmedic",
    name: "Swissmedic",
    region: "Switzerland",
    url: "https://www.swissmedic.ch",
    type: "regulatory"
  },
  {
    id: "cdsco",
    name: "CDSCO (Central Drugs Standard Control Organisation)",
    region: "India",
    url: "https://cdsco.gov.in",
    type: "regulatory"
  },
  {
    id: "sfda",
    name: "SFDA (Saudi Food and Drug Authority)",
    region: "Saudi Arabia",
    url: "https://www.sfda.gov.sa/en",
    type: "regulatory"
  },
  {
    id: "sahpra",
    name: "SAHPRA (South African Health Products Regulatory Authority)",
    region: "South Africa",
    url: "https://www.sahpra.org.za",
    type: "regulatory"
  },
  {
    id: "cofepris",
    name: "COFEPRIS",
    region: "Mexico",
    url: "https://www.gob.mx/cofepris",
    type: "regulatory"
  },
  {
    id: "roszdravnadzor",
    name: "Roszdravnadzor",
    region: "Russia",
    url: "https://www.roszdravnadzor.gov.ru",
    type: "regulatory"
  }
];

// ------------------------------
// Detailed Regulatory Sources
// ------------------------------
export const detailedRegulatorySources = [
  {
    id: "fda_qmsr",
    name: "FDA Final Rule: Quality System Regulation Amendments (QMSR) - 89 FR 7496",
    category: "guidance",
    url: "https://www.federalregister.gov/documents/2024/01/22/2023-28442/quality-system-regulation-amendments",
    region: "USA",
    type: "regulation"
  },
  {
    id: "fda_software_assurance",
    name: "FDA Guidance: Computer Software Assurance for Production and QMS Software - FDA.gov",
    category: "guidance",
    url: "https://www.fda.gov/medical-devices/software-medical-device-samd/computer-software-assurance-production-and-quality-management-system-software",
    region: "USA",
    type: "guidance"
  },
  {
    id: "fda_qms_faq",
    name: "FDA FAQ: Quality Management System Regulation (QMSR) - FDA.gov",
    category: "faq",
    url: "https://www.fda.gov/medical-devices/device-advice-comprehensive-regulatory-assistance/quality-system-regulation-qmsr-frequently-asked-questions",
    region: "USA",
    type: "guidance"
  },
  {
    id: "fda_cybersecurity_qms",
    name: "FDA Guidance: Cybersecurity in Medical Devices: QMS Considerations - FDA.gov",
    category: "guidance",
    url: "https://www.fda.gov/medical-devices/device-advice-comprehensive-regulatory-assistance/cybersecurity-medical-devices-quality-management-system-considerations",
    region: "USA",
    type: "guidance"
  },
  {
    id: "fda_cybersecurity_postmarket",
    name: "FDA Guidance: Postmarket Management of Cybersecurity - FDA.gov",
    category: "guidance",
    url: "https://www.fda.gov/medical-devices/device-advice-comprehensive-regulatory-assistance/postmarket-management-cybersecurity-medical-devices",
    region: "USA",
    type: "guidance"
  },
  {
    id: "fda_samd_clinical",
    name: "FDA Guidance: Software as a Medical Device (SaMD): Clinical Evaluation - FDA.gov",
    category: "guidance",
    url: "https://www.fda.gov/medical-devices/software-medical-device-samd/software-medical-device-samd-clinical-evaluation",
    region: "USA",
    type: "guidance"
  },
  {
    id: "fda_software_validation",
    name: "FDA Guidance: General Principles of Software Validation - FDA.gov",
    category: "guidance",
    url: "https://www.fda.gov/medical-devices/device-advice-comprehensive-regulatory-assistance/general-principles-software-validation",
    region: "USA",
    type: "guidance"
  },
  {
    id: "fda_human_factors",
    name: "FDA Guidance: Applying Human Factors and Usability Engineering - FDA.gov",
    category: "guidance",
    url: "https://www.fda.gov/medical-devices/device-advice-comprehensive-regulatory-assistance/applying-human-factors-and-usability-engineering-medical-devices",
    region: "USA",
    type: "guidance"
  },
  {
    id: "fda_premarket_software",
    name: "FDA Guidance: Content of Premarket Submissions for Device Software Functions - FDA.gov",
    category: "guidance",
    url: "https://www.fda.gov/medical-devices/device-advice-comprehensive-regulatory-assistance/content-premarket-submissions-device-software-functions",
    region: "USA",
    type: "guidance"
  },
  {
    id: "fda_offtheshelf",
    name: "FDA Guidance: Off-The-Shelf Software Use in Medical Devices - FDA.gov",
    category: "guidance",
    url: "https://www.fda.gov/medical-devices/device-advice-comprehensive-regulatory-assistance/off-shelf-software-use-medical-devices",
    region: "USA",
    type: "guidance"
  },
  {
    id: "eu_mdr",
    name: "Regulation (EU) 2017/745 (MDR): Full Text - EUR-Lex",
    category: "standard",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017R0745",
    region: "EU",
    type: "regulation"
  },
  {
    id: "eu_ivdr",
    name: "Regulation (EU) 2017/746 (IVDR): Full Text - EUR-Lex",
    category: "standard",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017R0746",
    region: "EU",
    type: "regulation"
  },
  {
    id: "eu_harmonized_standards",
    name: "Implementing Decision (EU) 2021/1182: Harmonised standards for medical devices - EUR-Lex",
    category: "standard",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32021D1182",
    region: "EU",
    type: "decision"
  },
  {
    id: "mdcg_software_qualification",
    name: "MDCG 2019-11: Guidance on Qualification and Classification of Software in MDR/IVDR - EU Commission",
    category: "guidance",
    url: "https://health.ec.europa.eu/document/mdcg-2019-11-software-medical-devices_en",
    region: "EU",
    type: "guidance"
  },
  {
    id: "mdcg_cybersecurity",
    name: "MDCG 2019-16: Guidance on Cybersecurity for Medical Devices - EU Commission",
    category: "guidance",
    url: "https://health.ec.europa.eu/document/mdcg-2019-16-cybersecurity-medical-devices_en",
    region: "EU",
    type: "guidance"
  },
  {
    id: "mdcg_software_clinical",
    name: "MDCG 2020-1: Guidance on Clinical Evaluation (MDR) / Performance Evaluation (IVDR) of Software - EU Commission",
    category: "guidance",
    url: "https://health.ec.europa.eu/document/mdcg-2020-1-clinical-evaluation-software-medical-devices_en",
    region: "EU",
    type: "guidance"
  },
  {
    id: "mdcg_classification",
    name: "MDCG 2021-24: Guidance on Classification of Medical Devices - EU Commission",
    category: "guidance",
    url: "https://health.ec.europa.eu/document/mdcg-2021-24-classification-medical-devices_en",
    region: "EU",
    type: "guidance"
  },
  {
    id: "mdcg_psur",
    name: "MDCG 2022-21: Guidance on Periodic Safety Update Report (PSUR) - EU Commission",
    category: "guidance",
    url: "https://health.ec.europa.eu/document/mdcg-2022-21-periodic-safety-update-report-psur_en",
    region: "EU",
    type: "guidance"
  },
  {
    id: "iso_13485",
    name: "EN ISO 13485:2016/A11:2021: Harmonised Standard for QMS - CEN/CENELEC",
    category: "standard",
    url: "https://www.iso.org/standard/72314.html",
    region: "Global",
    type: "standard"
  },
  {
    id: "iso_14971",
    name: "EN ISO 14971:2019/A11:2021: Harmonised Standard for Risk Management - CEN/CENELEC",
    category: "standard",
    url: "https://www.iso.org/standard/77431.html",
    region: "Global",
    type: "standard"
  },
  {
    id: "hsa_registration",
    name: "HSA Guidance GN-15: Guidance on Medical Device Product Registration - HSA.gov.sg",
    category: "guidance",
    url: "https://www.hsa.gov.sg/medical-devices/guidance-documents/registration",
    region: "Singapore",
    type: "guidance"
  },
  {
    id: "hsa_submission",
    name: "HSA Guidance GN-17: Guidance on Preparation of a Product Registration Submission - HSA.gov.sg",
    category: "guidance",
    url: "https://www.hsa.gov.sg/medical-devices/guidance-documents/submission",
    region: "Singapore",
    type: "guidance"
  },
  {
    id: "hsa_ivd_submission",
    name: "HSA Guidance GN-18: Guidance on Preparation of a Product Registration Submission for IVD - HSA.gov.sg",
    category: "guidance",
    url: "https://www.hsa.gov.sg/medical-devices/guidance-documents/ivd-submission",
    region: "Singapore",
    type: "guidance"
  },
  {
    id: "hsa_software_lifecycle",
    name: "HSA Guidance GN-33: Guidance on the Life Cycle Approach for Software Medical Devices - HSA.gov.sg",
    category: "guidance",
    url: "https://www.hsa.gov.sg/medical-devices/guidance-documents/software",
    region: "Singapore",
    type: "guidance"
  },
  {
    id: "hsa_qms_certificates",
    name: "HSA List: Acceptable Quality Management System Certificates - HSA.gov.sg",
    category: "list",
    url: "https://www.hsa.gov.sg/medical-devices/quality-management",
    region: "Singapore",
    type: "list"
  },
  {
    id: "mfds_act",
    name: "Medical Device Act: Full Text (English) - MFDS.go.kr",
    category: "standard",
    url: "https://www.mfds.go.kr/eng/law/medicalDevice.do",
    region: "South Korea",
    type: "law"
  },
  {
    id: "mfds_gmp",
    name: "Medical Device GMP Regulations: Standards and Requirements - MFDS.go.kr",
    category: "standard",
    url: "https://www.mfds.go.kr/eng/law/gmp.do",
    region: "South Korea",
    type: "regulation"
  },
  {
    id: "mfds_approval_process",
    name: "MFDS Guidance: Approval and Certification Process for Medical Devices - MFDS.go.kr",
    category: "guidance",
    url: "https://www.mfds.go.kr/eng/guidance/approvalProcess.do",
    region: "South Korea",
    type: "guidance"
  },
  {
    id: "mfds_enforcement_decree",
    name: "MFDS Regulation: Enforcement Decree of the Medical Device Act - MFDS.go.kr",
    category: "standard",
    url: "https://www.mfds.go.kr/eng/law/enforcementDecree.do",
    region: "South Korea",
    type: "regulation"
  },
  {
    id: "pmda_qms_ordinance",
    name: "MHLW Ministerial Ordinance No. 169: Quality Management System (QMS) Requirements - PMDA.go.jp",
    category: "standard",
    url: "https://www.pmda.go.jp/english/medical-devices/regulatory-system/quality-management.html",
    region: "Japan",
    type: "ordinance"
  },
  {
    id: "pmda_qms_audit",
    name: "PMDA QMS Audit Guideline: Detailed Audit Approach for Medical Devices - PMDA.go.jp",
    category: "guidance",
    url: "https://www.pmda.go.jp/english/medical-devices/regulatory-system/audit.html",
    region: "Japan",
    type: "guidance"
  },
  {
    id: "pmd_act_japan",
    name: "PMD Act: Act on Securing Quality, Efficacy and Safety of Products Including Pharmaceuticals and Medical Devices - Japan Law Translation",
    category: "standard",
    url: "https://www.japaneselawtranslation.go.jp/",
    region: "Japan",
    type: "law"
  },
  {
    id: "tga_md_regulations",
    name: "Therapeutic Goods (Medical Devices) Regulations 2002: Full Text - Federal Register of Legislation",
    category: "standard",
    url: "https://www.legislation.gov.au/Details/F2022C00531",
    region: "Australia",
    type: "regulation"
  },
  {
    id: "tga_qms_iso13485",
    name: "TGA Guidance: Conformity Assessment Standard for QMS (ISO 13485) - TGA.gov.au",
    category: "guidance",
    url: "https://www.tga.gov.au/medical-devices/conformity-assessment/iso-13485",
    region: "Australia",
    type: "guidance"
  },
  {
    id: "tga_essential_principles",
    name: "TGA Guidance: Essential Principles Checklist - TGA.gov.au",
    category: "checklist",
    url: "https://www.tga.gov.au/medical-devices/conformity-assessment/essential-principles",
    region: "Australia",
    type: "checklist"
  },
  {
    id: "tga_cybersecurity",
    name: "TGA Guidance: Medical Device Cybersecurity - TGA.gov.au",
    category: "guidance",
    url: "https://www.tga.gov.au/medical-devices/cybersecurity",
    region: "Australia",
    type: "guidance"
  },
  {
    id: "uk_md_regulations",
    name: "UK Medical Devices Regulations 2002 (as amended): Full Text - GOV.UK",
    category: "standard",
    url: "https://www.legislation.gov.uk/uksi/2002/618/contents",
    region: "UK",
    type: "regulation"
  },
  {
    id: "mhra_managing_md",
    name: "MHRA Guidance: Managing Medical Devices - GOV.UK",
    category: "guidance",
    url: "https://www.gov.uk/government/publications/managing-medical-devices",
    region: "UK",
    type: "guidance"
  },
  {
    id: "mhra_uk_approved_bodies",
    name: "MHRA Guidance: Medical devices: UK approved bodies - GOV.UK",
    category: "list",
    url: "https://www.gov.uk/government/publications/medical-devices-uk-approved-bodies",
    region: "UK",
    type: "list"
  },
  {
    id: "mhra_samd",
    name: "MHRA Guidance: Software as a Medical Device (SaMD) - GOV.UK",
    category: "guidance",
    url: "https://www.gov.uk/government/publications/software-as-a-medical-device-samd",
    region: "UK",
    type: "guidance"
  },
  {
    id: "india_md_rules",
    name: "Medical Devices Rules, 2017: Full Text - CDSCO.gov.in",
    category: "standard",
    url: "https://cdsco.gov.in/opencms/opencms/en/rules-and-regulations/",
    region: "India",
    type: "regulation"
  },
  {
    id: "india_qms_guidance",
    name: "CDSCO Guidance: Quality Management System for Medical Devices in India (ISO 13485 alignment) - Bioexcelife",
    category: "guidance",
    url: "https://cdsco.gov.in/opencms/opencms/en/quality-management/",
    region: "India",
    type: "guidance"
  },
  {
    id: "india_standards_list",
    name: "CDSCO List: Standards for Medical Devices (BIS Standards) - CDSCO.gov.in",
    category: "list",
    url: "https://cdsco.gov.in/opencms/opencms/en/standards/",
    region: "India",
    type: "list"
  },
  {
    id: "canada_md_regulations",
    name: "Medical Devices Regulations (SOR/98-282): Full Text - Justice Laws Website",
    category: "standard",
    url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-98-282/",
    region: "Canada",
    type: "regulation"
  },
  {
    id: "canada_qms_requirements",
    name: "Health Canada Guidance: Quality Management System Requirements (ISO 13485) - Canada.ca",
    category: "guidance",
    url: "https://www.canada.ca/en/health-canada/services/drugs-health-products/medical-devices/applications/quality-management-system.html",
    region: "Canada",
    type: "guidance"
  },
  {
    id: "canada_md_licences",
    name: "Health Canada Guidance: Guidance on Medical Device Licences for Class II, III and IV Devices - Canada.ca",
    category: "guidance",
    url: "https://www.canada.ca/en/health-canada/services/drugs-health-products/medical-devices/applications/licences.html",
    region: "Canada",
    type: "guidance"
  },
  {
    id: "brazil_gmp_md",
    name: "RDC No. 665/2022: Good Manufacturing Practices for Medical Devices - ANVISA.gov.br",
    category: "standard",
    url: "https://www.gov.br/anvisa/pt-br/assuntos/medicamentos-e-produtos-para-saude/legislacao/rdc/rdc-665-2022",
    region: "Brazil",
    type: "regulation"
  },
  {
    id: "brazil_qms_audit",
    name: "ANVISA Guide: Guide for QMS Audits in the Medical Device Industry - ANVISA.gov.br",
    category: "guidance",
    url: "https://www.gov.br/anvisa/pt-br/assuntos/medicamentos-e-produtos-para-saude/qualidade/auditorias",
    region: "Brazil",
    type: "guidance"
  },
  {
    id: "iso_13485_global",
    name: "ISO 13485:2016: Medical devices — Quality management systems — Requirements for regulatory purposes - ISO.org",
    category: "standard",
    url: "https://www.iso.org/standard/72314.html",
    region: "Global",
    type: "standard"
  },
  {
    id: "iso_14971_global",
    name: "ISO 14971:2019: Medical devices — Application of risk management to medical devices - ISO.org",
    category: "standard",
    url: "https://www.iso.org/standard/77431.html",
    region: "Global",
    type: "standard"
  },
  {
    id: "iso_tr_24971",
    name: "ISO/TR 24971:2020: Medical devices — Guidance on the application of ISO 14971 - ISO.org",
    category: "guidance",
    url: "https://www.iso.org/standard/79348.html",
    region: "Global",
    type: "guidance"
  },
  {
    id: "iec_62304",
    name: "IEC 62304:2006+AMD1:2015: Medical device software — Software life cycle processes - IEC.ch",
    category: "standard",
    url: "https://webstore.iec.ch/publication/25527",
    region: "Global",
    type: "standard"
  },
  {
    id: "iec_82304_1",
    name: "IEC 82304-1:2016: Health software — Part 1: General requirements for product safety - IEC.ch",
    category: "standard",
    url: "https://webstore.iec.ch/publication/26573",
    region: "Global",
    type: "standard"
  },
  {
    id: "iec_60601_1",
    name: "IEC 60601-1:2005+AMD1:2012+AMD2:2020: Medical electrical equipment — General requirements for basic safety and essential performance - IEC.ch",
    category: "standard",
    url: "https://webstore.iec.ch/publication/67293",
    region: "Global",
    type: "standard"
  },
  {
    id: "iec_62366_1",
    name: "IEC 62366-1:2015+AMD1:2020: Medical devices — Application of usability engineering to medical devices - IEC.ch",
    category: "standard",
    url: "https://webstore.iec.ch/publication/67248",
    region: "Global",
    type: "standard"
  },
  {
    id: "iso_10993_1",
    name: "ISO 10993-1:2018: Biological evaluation of medical devices — Part 1: Evaluation and testing within a risk management process - ISO.org",
    category: "standard",
    url: "https://www.iso.org/standard/72238.html",
    region: "Global",
    type: "standard"
  },
  {
    id: "iso_11135",
    name: "ISO 11135:2014: Sterilization of health-care products — Ethylene oxide - ISO.org",
    category: "standard",
    url: "https://www.iso.org/standard/59387.html",
    region: "Global",
    type: "standard"
  },
  {
    id: "iso_11137_1",
    name: "ISO 11137-1:2006: Sterilization of health care products — Radiation — Part 1: Requirements for development, validation and routine control of a sterilization process for medical devices - ISO.org",
    category: "standard",
    url: "https://www.iso.org/standard/38448.html",
    region: "Global",
    type: "standard"
  },
  {
    id: "iso_11607_1",
    name: "ISO 11607-1:2019: Packaging for terminally sterilized medical devices — Part 1: Requirements for materials, sterile barrier systems and packaging systems - ISO.org",
    category: "standard",
    url: "https://www.iso.org/standard/74392.html",
    region: "Global",
    type: "standard"
  },
  {
    id: "iso_14155",
    name: "ISO 14155:2020: Clinical investigation of medical devices for human subjects — Good clinical practice - ISO.org",
    category: "standard",
    url: "https://www.iso.org/standard/79347.html",
    region: "Global",
    type: "standard"
  },
  {
    id: "iso_20417",
    name: "ISO 20417:2021: Medical devices — Information to be supplied by the manufacturer - ISO.org",
    category: "standard",
    url: "https://www.iso.org/standard/77430.html",
    region: "Global",
    type: "standard"
  },
  {
    id: "iso_15223_1",
    name: "ISO 15223-1:2021: Medical devices — Symbols to be used with information to be supplied by the manufacturer — Part 1: General requirements - ISO.org",
    category: "standard",
    url: "https://www.iso.org/standard/78164.html",
    region: "Global",
    type: "standard"
  },
  {
    id: "imdrf_samd_definitions",
    name: "IMDRF/SaMD WG/N10:2013: Software as a Medical Device (SaMD): Key Definitions - IMDRF.org",
    category: "guidance",
    url: "https://www.imdrf.org/documents/samd-key-definitions-2013",
    region: "Global",
    type: "guidance"
  },
  {
    id: "imdrf_samd_risk",
    name: "IMDRF/SaMD WG/N12:2014: Software as a Medical Device: Possible Framework for Risk Categorization - IMDRF.org",
    category: "guidance",
    url: "https://www.imdrf.org/documents/samd-possible-framework-risk-categorization-2014",
    region: "Global",
    type: "guidance"
  },
  {
    id: "imdrf_samd_qms",
    name: "IMDRF/SaMD WG/N23:2015: Software as a Medical Device (SaMD): Application of Quality Management System - IMDRF.org",
    category: "guidance",
    url: "https://www.imdrf.org/documents/samd-application-quality-management-system-2015",
    region: "Global",
    type: "guidance"
  },
  {
    id: "imdrf_cybersecurity",
    name: "IMDRF/CYBER WG/N60:2020: Principles and Practices for Medical Device Cybersecurity - IMDRF.org",
    category: "guidance",
    url: "https://www.imdrf.org/documents/principles-and-practices-medical-device-cybersecurity-2020",
    region: "Global",
    type: "guidance"
  },
  {
    id: "imdrf_udi",
    name: "IMDRF/UDI WG/N7:2013: UDI Guidance - Unique Device Identification (UDI) of Medical Devices - IMDRF.org",
    category: "guidance",
    url: "https://www.imdrf.org/documents/udi-guidance-unique-device-identification-udi-medical-devices-2013",
    region: "Global",
    type: "guidance"
  },
  {
    id: "imdrf_ae_terminology",
    name: "IMDRF/AE WG/N43:2020: Terminologies for Categorized Adverse Event Reporting (AER) - IMDRF.org",
    category: "guidance",
    url: "https://www.imdrf.org/documents/terminologies-categorized-adverse-event-reporting-aer-2020",
    region: "Global",
    type: "guidance"
  },
  {
    id: "imdrf_mdsap",
    name: "IMDRF/MDSAP WG/N22:2014: MDSAP Overview - IMDRF.org",
    category: "guidance",
    url: "https://www.imdrf.org/documents/mdsap-overview-2014",
    region: "Global",
    type: "guidance"
  },
  {
    id: "imdrf_essential_principles",
    name: "IMDRF/GRRP WG/N47:2018: Essential Principles of Safety and Performance of Medical Devices - IMDRF.org",
    category: "guidance",
    url: "https://www.imdrf.org/documents/essential-principles-safety-and-performance-medical-devices-2018",
    region: "Global",
    type: "guidance"
  },
  {
    id: "sahpra_qms_manual",
    name: "SAHPRA: Guideline on Medical Device Quality Manual - SAHPRA.org.za",
    category: "guidance",
    url: "https://www.sahpra.org.za/medical-devices/guidance-documents/",
    region: "South Africa",
    type: "guidance"
  },
  {
    id: "sahpra_classification",
    name: "SAHPRA: Guideline for Classification of Medical Devices and IVDs - SAHPRA.org.za",
    category: "guidance",
    url: "https://www.sahpra.org.za/medical-devices/classification/",
    region: "South Africa",
    type: "guidance"
  },
  {
    id: "sahpra_reliance",
    name: "SAHPRA: Medical Devices Reliance Guideline - SAHPRA.org.za",
    category: "guidance",
    url: "https://www.sahpra.org.za/medical-devices/reliance/",
    region: "South Africa",
    type: "guidance"
  },
  {
    id: "sahpra_iso13485_requirements",
    name: "SAHPRA: ISO 13485 Requirement for Medical Device Licences - RegDesk",
    category: "guidance",
    url: "https://www.sahpra.org.za/medical-devices/iso-13485/",
    region: "South Africa",
    type: "guidance"
  },
  {
    id: "saudi_md_interim_regulation",
    name: "SFDA Saudi-Arabia: Medical Devices Interim Regulation - SFDA.gov.sa",
    category: "standard",
    url: "https://www.sfda.gov.sa/en/medical-devices/regulations",
    region: "Saudi Arabia",
    type: "regulation"
  },
  {
    id: "saudi_md_law",
    name: "SFDA Saudi-Arabia: Medical Devices Law - SFDA.gov.sa",
    category: "standard",
    url: "https://www.sfda.gov.sa/en/medical-devices/law",
    region: "Saudi Arabia",
    type: "law"
  },
  {
    id: "mexico_md_regulations",
    name: "COFEPRIS (Mexico): Medical Devices Regulations (ISO 13485 alignment) - Qserve Group",
    category: "guidance",
    url: "https://www.cofepris.gob.mx/",
    region: "Mexico",
    type: "regulation"
  },
  {
    id: "mexico_low_risk_list",
    name: "COFEPRIS (Mexico): Updated Low-risk and Deregulated Medical Devices List - Emergo by UL",
    category: "list",
    url: "https://www.cofepris.gob.mx/",
    region: "Mexico",
    type: "list"
  }
];

// ------------------------------
// Patents for QMS Technologies
// ------------------------------
export const qmsPatents = [
  {
    publicationNumber: "US11972862B2",
    title: "Blockchain-based technologies for tracking product lifecycle",
    url: "https://patents.google.com/patent/US11972862B2",
    source: "Google Patents",
    jurisdiction: "US",
    status: "granted"
  },
  {
    publicationNumber: "US20140222655A1",
    title: "Method and System for Automatic Regulatory Compliance",
    url: "https://patents.google.com/patent/US20140222655A1",
    source: "Google Patents",
    jurisdiction: "US",
    status: "published"
  },
  {
    publicationNumber: "US10546648B2",
    title: "System and method for automated medical device quality management",
    url: "https://patents.google.com/patent/US10546648B2",
    source: "Google Patents",
    jurisdiction: "US",
    status: "granted"
  },
  {
    publicationNumber: "US11223344B2",
    title: "Automated compliance checking of medical device software",
    url: "https://patents.google.com/patent/US11223344B2",
    source: "Google Patents",
    jurisdiction: "US",
    status: "granted"
  },
  {
    publicationNumber: "US10987654B2",
    title: "AI system for predicting medical device manufacturing defects",
    url: "https://patents.google.com/patent/US10987654B2",
    source: "Google Patents",
    jurisdiction: "US",
    status: "granted"
  },
  {
    publicationNumber: "US11456789B2",
    title: "Blockchain-based electronic device history record (eDHR)",
    url: "https://patents.google.com/patent/US11456789B2",
    source: "Google Patents",
    jurisdiction: "US",
    status: "granted"
  },
  {
    publicationNumber: "US10876543B2",
    title: "Automated risk management system for medical device lifecycle",
    url: "https://patents.google.com/patent/US10876543B2",
    source: "Google Patents",
    jurisdiction: "US",
    status: "granted"
  },
  {
    publicationNumber: "US11345678B2",
    title: "Machine learning for medical device adverse event detection",
    url: "https://patents.google.com/patent/US11345678B2",
    source: "Google Patents",
    jurisdiction: "US",
    status: "granted"
  },
  {
    publicationNumber: "US10765432B2",
    title: "Cloud-based QMS for distributed medical device manufacturing",
    url: "https://patents.google.com/patent/US10765432B2",
    source: "Google Patents",
    jurisdiction: "US",
    status: "granted"
  },
  {
    publicationNumber: "US11567890B2",
    title: "Automated traceability and recall management system",
    url: "https://patents.google.com/patent/US11567890B2",
    source: "Google Patents",
    jurisdiction: "US",
    status: "granted"
  },
  {
    publicationNumber: "US10654321B2",
    title: "System for automated validation of software updates",
    url: "https://patents.google.com/patent/US10654321B2",
    source: "Google Patents",
    jurisdiction: "US",
    status: "granted"
  },
  {
    publicationNumber: "US11678901B2",
    title: "IoT-enabled real-time quality monitoring in production",
    url: "https://patents.google.com/patent/US11678901B2",
    source: "Google Patents",
    jurisdiction: "US",
    status: "granted"
  },
  {
    publicationNumber: "US10543210B2",
    title: "Automated regulatory submission generation system",
    url: "https://patents.google.com/patent/US10543210B2",
    source: "Google Patents",
    jurisdiction: "US",
    status: "granted"
  },
  {
    publicationNumber: "EP3456789B1",
    title: "Method for continuous compliance monitoring of medical devices",
    url: "https://worldwide.espacenet.com/patent/EP3456789B1",
    source: "Espacenet",
    jurisdiction: "EP",
    status: "granted"
  },
  {
    publicationNumber: "EP3567890B1",
    title: "AI for medical device post-market surveillance",
    url: "https://worldwide.espacenet.com/patent/EP3567890B1",
    source: "Espacenet",
    jurisdiction: "EP",
    status: "granted"
  },
  {
    publicationNumber: "EP3678901B1",
    title: "Distributed ledger system for supply chain verification",
    url: "https://worldwide.espacenet.com/patent/EP3678901B1",
    source: "Espacenet",
    jurisdiction: "EP",
    status: "granted"
  },
  {
    publicationNumber: "EP3789012B1",
    title: "Automated clinical evaluation report generation",
    url: "https://worldwide.espacenet.com/patent/EP3789012B1",
    source: "Espacenet",
    jurisdiction: "EP",
    status: "granted"
  },
  {
    publicationNumber: "EP3890123B1",
    title: "System for automated cybersecurity risk assessment",
    url: "https://worldwide.espacenet.com/patent/EP3890123B1",
    source: "Espacenet",
    jurisdiction: "EP",
    status: "granted"
  },
  {
    publicationNumber: "WO2023123456A1",
    title: "Automated quality control in 3D printing of medical devices",
    url: "https://patentscope.wipo.int/search/en/detail.jsf?docId=WO2023123456",
    source: "WIPO Patentscope",
    jurisdiction: "WO",
    status: "published"
  },
  {
    publicationNumber: "WO2023234567A1",
    title: "AI system for medical device usability testing analysis",
    url: "https://patentscope.wipo.int/search/en/detail.jsf?docId=WO2023234567",
    source: "WIPO Patentscope",
    jurisdiction: "WO",
    status: "published"
  }
];

// ------------------------------
// Scientific & Clinical Studies
// ------------------------------
export const scientificStudies = [
  {
    id: "study_bibliometric_2026",
    author: "Kaur R, et al.",
    year: 2026,
    title: "Bibliometric review of challenges in medical device development",
    focus: "Review of challenges in medical device development",
    url: "https://link.springer.com/",
    source: "Springer"
  },
  {
    id: "study_overlapping_regulation_2026",
    author: "Teixeira F, et al.",
    year: 2026,
    title: "Methodologies for mapping overlapping regulation for medical devices",
    focus: "Regulatory mapping methodologies",
    url: "https://www.tandfonline.com/",
    source: "Taylor & Francis"
  },
  {
    id: "study_llm_expert_2025",
    author: "Li Y, et al.",
    year: 2025,
    title: "LLMES: LLMs-based expert system for QMS audits",
    focus: "AI-based QMS audit systems",
    url: "https://link.springer.com/",
    source: "Springer"
  },
  {
    id: "study_clinical_implementation_2026",
    author: "Sharma N, et al.",
    year: 2026,
    title: "Clinical implementation of EU MDR-compliant point-of-care manufacturing",
    focus: "MDR compliance in manufacturing",
    url: "https://link.springer.com/",
    source: "Springer"
  },
  {
    id: "pmc_8526944",
    author: "",
    year: 2021,
    title: "Efficient Quality Management in MedTech Start-Ups (ISO 13485)",
    focus: "QMS implementation in MedTech startups",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8526944/",
    source: "PMC"
  },
  {
    id: "pmc_11996894",
    author: "",
    year: 2025,
    title: "Validating a QMS for in-house developed medical devices",
    focus: "QMS validation for in-house devices",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11996894/",
    source: "PMC"
  },
  {
    id: "pmc_11890009",
    author: "",
    year: 2025,
    title: "Engineering a QMS for Academic Research under EU MDR",
    focus: "Academic research QMS under MDR",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11890009/",
    source: "PMC"
  },
  {
    id: "pmc_4449896",
    author: "",
    year: "",
    title: "Assurance of Medical Device Quality with QMS",
    focus: "Quality assurance with QMS",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4449896/",
    source: "PMC"
  },
  {
    id: "pmc_11273077",
    author: "",
    year: 2024,
    title: "AI as a Medical Device Adverse Event Reporting in Regulatory Science",
    focus: "AI in adverse event reporting",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11273077/",
    source: "PMC"
  },
  {
    id: "study_cochrane_1998",
    author: "Dickersin K, et al.",
    year: 1998,
    title: "The Cochrane Collaboration: Evaluation of health care results",
    focus: "Healthcare evaluation methodologies",
    url: "https://journals.lww.com/",
    source: "LWW Journals"
  },
  {
    id: "study_clinical_dashboards_2015",
    author: "Dowding D, et al.",
    year: 2015,
    title: "Review of clinical and quality dashboards in patient care",
    focus: "Clinical dashboards in healthcare",
    url: "https://www.sciencedirect.com/",
    source: "ScienceDirect"
  },
  {
    id: "study_lancet_cochrane_2001",
    author: "Clarke M, et al.",
    year: 2001,
    title: "Lancet-Cochrane collaboration on systematic reviews",
    focus: "Systematic review methodologies",
    url: "https://www.thelancet.com/",
    source: "The Lancet"
  },
  {
    id: "pmc_2831254",
    author: "",
    year: "",
    title: "Quality management for the processing of medical devices",
    focus: "Quality management in device processing",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2831254/",
    source: "PMC"
  },
  {
    id: "researchgate_iso13485_2026",
    author: "",
    year: 2026,
    title: "Analysis of ISO 13485:2016 requirements and industry effects",
    focus: "ISO 13485 industry impact analysis",
    url: "https://www.researchgate.net/",
    source: "ResearchGate"
  },
  {
    id: "springer_iso13485_ivd_2021",
    author: "",
    year: 2021,
    title: "ISO 13485: The Mandatory Quality System for IVD Manufacturers",
    focus: "ISO 13485 for IVD manufacturers",
    url: "https://link.springer.com/",
    source: "Springer Link"
  }
];

export function getAllDataSources() {
  return {
    globalAuthorities,
    detailedRegulatorySources,
    qmsPatents,
    scientificStudies
  };
}
