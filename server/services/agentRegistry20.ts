import { Logger } from "./logger.service.js";

const logger = new Logger("AgentRegistry20");

// ============================================================
// 20-AGENT ARCHITECTURE per spec (Section 3.2)
// ============================================================

export type RingNumber = 1 | 2 | 3;

export interface AgentDefinition {
  number: number;           // 1-20
  name: string;             // Display name
  role: string;             // Functional role
  ring: RingNumber;
  domain: string;           // Expertise domain
  jurisdiction: string;    // US, EU, CN, JP, Global
  automationLevel: number;  // 0-100 (% automated)
  qualification: string;    // Required qualification
  decisionAuthority: "go_nogo" | "consensus" | "authoritative" | "veto";
  description: string;
}

// ============================================================
// RING 1: Automated Pre-Check (Agents 1-5)
// ALL must pass — single No-Go stops and escalates to Ring 2
// ============================================================
const RING_1_AGENTS: AgentDefinition[] = [
  {
    number: 1,
    name: "Format Validator",
    role: "Format-Validierung",
    ring: 1,
    domain: "Datenformat-Standards",
    jurisdiction: "Global",
    automationLevel: 100,
    qualification: "Automatisiert (Schema-Validierung)",
    decisionAuthority: "go_nogo",
    description: "Prüft Ausgabe-Format gegen regulatorische Vorgaben (PDF/A, XML-Schemata, EDI-Nachrichtenformate)",
  },
  {
    number: 2,
    name: "Source Verifier",
    role: "Quellenverfügbarkeits-Check",
    ring: 1,
    domain: "Quellen-Integrität",
    jurisdiction: "Global",
    automationLevel: 100,
    qualification: "Automatisiert (HTTP-Status, DOI-Auflösung)",
    decisionAuthority: "go_nogo",
    description: "Verfügbarkeit und Erreichbarkeit aller referenzierten Primärquellen prüfen",
  },
  {
    number: 3,
    name: "Plausibility Checker",
    role: "Plausibilitätsprüfung (statistisch)",
    ring: 1,
    domain: "Statistische Datenqualität",
    jurisdiction: "Global",
    automationLevel: 95,
    qualification: "Statistische Outlier-Erkennung",
    decisionAuthority: "go_nogo",
    description: "Statistische Plausibilität der Daten prüfen (Ausreißer, Inkonsistenzen, Anomalien)",
  },
  {
    number: 4,
    name: "Jurisdiction Consistency Checker",
    role: "Jurisdiktions-Konsistenz-Check",
    ring: 1,
    domain: "Rechtsraum-Konformität",
    jurisdiction: "Global",
    automationLevel: 90,
    qualification: "Jurisdiktions-Matrix (EU/US/CN/JP)",
    decisionAuthority: "go_nogo",
    description: "Prüft konsistente Anwendung der richtigen Rechtsordnung pro Ausgabe",
  },
  {
    number: 5,
    name: "ALCOA+ Scanner",
    role: "ALCOA+-Compliance-Scanner",
    ring: 1,
    domain: "Datenintegrität (ALCOA+)",
    jurisdiction: "Global",
    automationLevel: 100,
    qualification: "ALCOA+-Regelwerk (Attributable, Legible, Contemporaneous, Original, Accurate)",
    decisionAuthority: "go_nogo",
    description: "Prüft Datenintegrität gegen ALCOA+-Kriterien (FDA 21 CFR Part 11, EU Annex 11)",
  },
];

// ============================================================
// RING 2: Domain Expert Review (Agents 6-15)
// Consensus-based — dissent escalates to Ring 3
// ============================================================
const RING_2_AGENTS: AgentDefinition[] = [
  {
    number: 6,
    name: "EU Pharma Expert",
    role: "Arzneimittelrecht (EU)",
    ring: 2,
    domain: "Pharma-Regularien",
    jurisdiction: "EU",
    automationLevel: 70,
    qualification: "RA-Manager mit EMA-Erfahrung",
    decisionAuthority: "consensus",
    description: "Prüft Aussagen zu EU-Arzneimittelrecht, EMA-Zulassungen, GMP/GCP-Compliance",
  },
  {
    number: 7,
    name: "EU MedDev Expert",
    role: "Medizinprodukterecht (EU)",
    ring: 2,
    domain: "Medizinprodukte-Regularien",
    jurisdiction: "EU",
    automationLevel: 70,
    qualification: "Notified Body-erfahren (MDR/IVDR)",
    decisionAuthority: "consensus",
    description: "Prüft MDR/IVDR-Konformität, CE-Kennzeichnung, Benannte-Stellen-Anforderungen",
  },
  {
    number: 8,
    name: "FDA Expert",
    role: "FDA-Regulation",
    ring: 2,
    domain: "FDA-Regularien",
    jurisdiction: "US",
    automationLevel: 65,
    qualification: "Ex-FDA oder RAC-zertifiziert",
    decisionAuthority: "consensus",
    description: "Prüft 510(k)/PMA-Aussagen, QMSR-Compliance, FDA-Guidance-Auslegungen",
  },
  {
    number: 9,
    name: "Patent Counsel",
    role: "Patentrecht (US/EU)",
    ring: 2,
    domain: "Patentrecht",
    jurisdiction: "Global",
    automationLevel: 50,
    qualification: "Patentanwalt (USPTO/EPA)",
    decisionAuthority: "consensus",
    description: "Prüft Patentaussagen, Freedom-to-Operate-Analysen, Patentverletzungsrisiken",
  },
  {
    number: 10,
    name: "Clinical Data Expert",
    role: "Klinische Daten/Studien",
    ring: 2,
    domain: "Klinische Prüfungen",
    jurisdiction: "Global",
    automationLevel: 60,
    qualification: "MD + klinische Erfahrung",
    decisionAuthority: "consensus",
    description: "Prüft klinische Studiendaten, Evidenzniveaus, ISO 14155-Konformität",
  },
  {
    number: 11,
    name: "Pharmacovigilance Expert",
    role: "Pharmakovigilanz",
    ring: 2,
    domain: "Pharmakovigilanz",
    jurisdiction: "Global",
    automationLevel: 55,
    qualification: "QPPV-Qualifikation oder Äquivalent",
    decisionAuthority: "consensus",
    description: "Prüft PV-Aussagen, Signal Detection, PSUR/DSUR-Anforderungen, RMP-Bewertungen",
  },
  {
    number: 12,
    name: "NMPA Expert",
    role: "NMPA-Regulation (China)",
    ring: 2,
    domain: "Chinesische Regularien",
    jurisdiction: "CN",
    automationLevel: 40,
    qualification: "NMPA-zertifiziert oder 5+ Jahre China-RA",
    decisionAuthority: "consensus",
    description: "Prüft NMPA-Konformität, chinesische GB-Standards, PIPL/CSL-Compliance",
  },
  {
    number: 13,
    name: "PMDA Expert",
    role: "PMDA/Japan-Regulation",
    ring: 2,
    domain: "Japanische Regularien",
    jurisdiction: "JP",
    automationLevel: 35,
    qualification: "PMDA-erfahren oder Japan-RA-Spezialist",
    decisionAuthority: "consensus",
    description: "Prüft PMDA-Konformität, japanische MHLW-Vorgaben, IEC 62304-JP-Anpassungen",
  },
  {
    number: 14,
    name: "Data/AI Governance Expert",
    role: "Daten-/AI-Governance",
    ring: 2,
    domain: "AI-Governance, Datenschutz",
    jurisdiction: "Global",
    automationLevel: 60,
    qualification: "CIPP/E + AI-Act-Expertise",
    decisionAuthority: "consensus",
    description: "Prüft AI-Act-Compliance, GDPR-Konformität, Datenverarbeitungsgrundsätze",
  },
  {
    number: 15,
    name: "Cross-Jurisdictional Harmonizer",
    role: "Cross-Jurisdictional Harmonization",
    ring: 2,
    domain: "Multi-Market-Regularien",
    jurisdiction: "Global",
    automationLevel: 40,
    qualification: "Min. 10 Jahre Multi-Market-RA-Erfahrung",
    decisionAuthority: "consensus",
    description: "Prüft länderübergreifende Konsistenz, identifiziert Harmonisierungskonflikte",
  },
];

// ============================================================
// RING 3: Authoritative Validation (Agents 16-20)
// Agent 17 (CCO) must sign. Agent 20 can veto.
// ============================================================
const RING_3_AGENTS: AgentDefinition[] = [
  {
    number: 16,
    name: "Senior Cross-Jurisdictional Reviewer",
    role: "Senior Cross-Jurisdictional Reviewer",
    ring: 3,
    domain: "Multi-Jurisdiktions-Konfliktlösung",
    jurisdiction: "Global",
    automationLevel: 20,
    qualification: "15+ Jahre internationale Regulierungserfahrung",
    decisionAuthority: "authoritative",
    description: "Entscheidet bei Ring-2-Dissens, löst jurisdiktionsübergreifende Konflikte",
  },
  {
    number: 17,
    name: "Chief Compliance Officer (CCO)",
    role: "Chief Compliance Officer",
    ring: 3,
    domain: "Compliance-Gesamtverantwortung",
    jurisdiction: "Global",
    automationLevel: 10,
    qualification: "CCO-Ernennung, Haftungsübernahme",
    decisionAuthority: "authoritative",
    description: "Finale Signatur für alle regulatorischen Ausgaben, übernimmt Haftung",
  },
  {
    number: 18,
    name: "External Regulatory Liaison",
    role: "External Regulatory Liaison",
    ring: 3,
    domain: "Behörden-Kommunikation",
    jurisdiction: "Global",
    automationLevel: 15,
    qualification: "Ehemaliger Behördenmitarbeiter (FDA/EMA/BfArM)",
    decisionAuthority: "consensus",
    description: "Behörden-Kommunikation, offizielle Stellungnahmen, Pre-Submission-Strategie",
  },
  {
    number: 19,
    name: "Customer Compliance Representative",
    role: "Customer Compliance Representative",
    ring: 3,
    domain: "Kunden-Compliance",
    jurisdiction: "Global",
    automationLevel: 20,
    qualification: "Kunden-ernannter Compliance-Beauftragter",
    decisionAuthority: "consensus",
    description: "Kunden-spezifische Compliance-Anforderungen, Validierung gegen Kunden-QMS",
  },
  {
    number: 20,
    name: "Independent Auditor",
    role: "Independent Auditor (extern)",
    ring: 3,
    domain: "Unabhängige Prüfung",
    jurisdiction: "Global",
    automationLevel: 5,
    qualification: "Externer, zugelassener ISO 13485/27001-Auditor",
    decisionAuthority: "veto",
    description: "Unabhängige Validierung, keine direkte Reporting-Line. Veto-Recht (eskalierend an Aufsichtsrat)",
  },
];

// ============================================================
// Complete Agent Registry
// ============================================================
export const ALL_AGENTS: AgentDefinition[] = [
  ...RING_1_AGENTS,
  ...RING_2_AGENTS,
  ...RING_3_AGENTS,
];

export const AGENTS_BY_RING: Record<RingNumber, AgentDefinition[]> = {
  1: RING_1_AGENTS,
  2: RING_2_AGENTS,
  3: RING_3_AGENTS,
};

export const AGENTS_BY_NUMBER: Record<number, AgentDefinition> = {};
for (const agent of ALL_AGENTS) {
  AGENTS_BY_NUMBER[agent.number] = agent;
}

export const AGENTS_BY_JURISDICTION: Record<string, AgentDefinition[]> = {};
for (const agent of ALL_AGENTS) {
  if (!AGENTS_BY_JURISDICTION[agent.jurisdiction]) {
    AGENTS_BY_JURISDICTION[agent.jurisdiction] = [];
  }
  AGENTS_BY_JURISDICTION[agent.jurisdiction].push(agent);
}

// ============================================================
// Agent Registry Service
// ============================================================
export class AgentRegistryService {
  /**
   * Get all agents
   */
  getAllAgents(): AgentDefinition[] {
    return ALL_AGENTS;
  }

  /**
   * Get agents by ring
   */
  getAgentsByRing(ring: RingNumber): AgentDefinition[] {
    return AGENTS_BY_RING[ring] || [];
  }

  /**
   * Get agent by number
   */
  getAgent(number: number): AgentDefinition | undefined {
    return AGENTS_BY_NUMBER[number];
  }

  /**
   * Get agents by jurisdiction
   */
  getAgentsByJurisdiction(jurisdiction: string): AgentDefinition[] {
    return AGENTS_BY_JURISDICTION[jurisdiction] || [];
  }

  /**
   * Get agents for a specific domain
   */
  getAgentsByDomain(domain: string): AgentDefinition[] {
    return ALL_AGENTS.filter(
      (a) => a.domain.toLowerCase().includes(domain.toLowerCase())
    );
  }

  /**
   * Get automated agents (automationLevel >= 80)
   */
  getAutomatedAgents(): AgentDefinition[] {
    return ALL_AGENTS.filter((a) => a.automationLevel >= 80);
  }

  /**
   * Get human-intensive agents (automationLevel < 30)
   */
  getHumanReviewAgents(): AgentDefinition[] {
    return ALL_AGENTS.filter((a) => a.automationLevel < 30);
  }

  /**
   * Get automated pre-checks for Ring 1
   */
  getRing1Checks(): AgentDefinition[] {
    return RING_1_AGENTS;
  }

  /**
   * Get domain experts for Ring 2
   */
  getRing2Experts(): AgentDefinition[] {
    return RING_2_AGENTS;
  }

  /**
   * Get authoritative reviewers for Ring 3
   */
  getRing3Authorities(): AgentDefinition[] {
    return RING_3_AGENTS;
  }

  /**
   * Requires ALL Ring 1 agents to pass
   */
  requiresAllRing1Pass(): boolean {
    return true; // ALL agents 1-5 must give "Go"
  }

  /**
   * Get agent routing configuration for the router
   */
  getRoutingConfig() {
    return {
      ring1: {
        agents: RING_1_AGENTS.map((a) => a.number),
        gateLogic: "ALL_MUST_PASS" as const,
        escalationTarget: 2,
      },
      ring2: {
        agents: RING_2_AGENTS.map((a) => a.number),
        gateLogic: "CONSENSUS" as const,
        escalationTarget: 3,
        dissentThreshold: 2, // 2+ disagreements escalate to Ring 3
      },
      ring3: {
        agents: RING_3_AGENTS.map((a) => a.number),
        gateLogic: "AUTHORITATIVE" as const,
        requiredSigner: 17, // CCO must sign
        vetoAgent: 20,      // Independent Auditor can veto
      },
    };
  }

  /**
   * Log registry status
   */
  logStatus(): void {
    logger.info("20-Agent Registry initialized", {
      total: ALL_AGENTS.length,
      ring1: RING_1_AGENTS.length,
      ring2: RING_2_AGENTS.length,
      ring3: RING_3_AGENTS.length,
      jurisdictions: Object.keys(AGENTS_BY_JURISDICTION),
      automatedCount: this.getAutomatedAgents().length,
      humanReviewCount: this.getHumanReviewAgents().length,
    });
  }
}

export const agentRegistry20 = new AgentRegistryService();
agentRegistry20.logStatus();
