import { Logger } from "./logger.service.js";
import { agentRegistry20, type AgentDefinition, type RingNumber } from "./agentRegistry20.js";


const logger = new Logger("ThreeRingMediator");

// ============================================================
// THREE-RING MEDIATOR
// Orchestrates the 20-agent review process with:
//   Ring 1 (Agents 1-5): Automated Pre-Check — ALL must pass
//   Ring 2 (Agents 6-15): Domain Expert Review — Consensus-based
//   Ring 3 (Agents 16-20): Authoritative Validation — CCO signs
// ============================================================

export type VerdictValue = "go" | "no_go" | "pass" | "fail" | "abstain";
export type AgentStatus = "pending" | "processing" | "completed" | "escalated";

export interface AgentReviewResult {
  agentNumber: number;
  agentName: string;
  ring: RingNumber;
  verdict: VerdictValue;
  confidenceOverride?: number;
  comment?: string;
  evidenceUrls?: string[];
  processingTimeMs: number;
  status: AgentStatus;
  automated: boolean;
}

export interface RingResult {
  ring: RingNumber;
  agents: AgentReviewResult[];
  passed: boolean;
  escalated: boolean;
  escalatedToRing?: RingNumber;
  summary: string;
  processingTimeMs: number;
}

export interface ThreeRingReport {
  outputId: string;
  outputType: string;
  rings: RingResult[];
  overallPassed: boolean;
  signedByCCO: boolean;
  vetoActive: boolean;
  vetoOverridden: boolean;
  totalProcessingTimeMs: number;
  completedAt: string;
}

export interface ThreeRingConfig {
  requireAllRing1Pass: boolean;
  ring2ConsensusThreshold: number; // percentage (0-100)
  ring2DissentLimit: number;       // max disagreements before escalate
  requireCCOSignature: boolean;
  allowVetoOverride: boolean;
}

const DEFAULT_CONFIG: ThreeRingConfig = {
  requireAllRing1Pass: true,
  ring2ConsensusThreshold: 80,
  ring2DissentLimit: 2,
  requireCCOSignature: true,
  allowVetoOverride: false,
};

export class ThreeRingMediator {
  private config: ThreeRingConfig;
  private agents: Map<number, AgentDefinition>;

  constructor(config: Partial<ThreeRingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.agents = new Map();
    for (const agent of agentRegistry20.getAllAgents()) {
      this.agents.set(agent.number, agent);
    }
  }

  /**
   * Get the agent definitions for a given ring
   */
  private getRingAgents(ring: RingNumber): AgentDefinition[] {
    return agentRegistry20.getAgentsByRing(ring);
  }

  /**
   * Run Ring 1: Automated Pre-Check
   * ALL agents must pass — single No-Go stops and escalates
   */
  async runRing1(
    outputId: string,
    data: { content: string; sources: string[]; jurisdiction: string }
  ): Promise<RingResult> {
    const startTime = Date.now();
    const agents = this.getRingAgents(1);
    const results: AgentReviewResult[] = [];
    let allPassed = true;
    let escalated = false;

    logger.info(`Ring 1: Starting automated pre-check for ${outputId}`);

    for (const agent of agents) {
      const agentStart = Date.now();
      let verdict: VerdictValue = "go";
      let comment: string | undefined;

      try {
        // Automated checks based on agent role
        verdict = await this.executeAutomatedCheck(agent, data);
      } catch (error: any) {
        verdict = "no_go";
        comment = `Automated check failed: ${error.message}`;
      }

      const result: AgentReviewResult = {
        agentNumber: agent.number,
        agentName: agent.name,
        ring: 1,
        verdict,
        comment,
        processingTimeMs: Date.now() - agentStart,
        status: "completed",
        automated: true,
      };

      results.push(result);

      if (verdict === "no_go") {
        allPassed = false;
        escalated = true;
        logger.warn(`Ring 1: Agent ${agent.number} (${agent.name}) issued No-Go`, {
          comment,
        });
        break; // Stop on first No-Go (spec: gateway logic)
      }
    }

    const ringResult: RingResult = {
      ring: 1,
      agents: results,
      passed: allPassed,
      escalated: escalated && !allPassed,
      escalatedToRing: escalated ? 2 : undefined,
      summary: allPassed
        ? `Alle ${results.length} Ring-1-Prüfungen bestanden`
        : `Ring 1 blockiert: Agent ${results.find(r => r.verdict === "no_go")?.agentName} hat No-Go`,
      processingTimeMs: Date.now() - startTime,
    };

    logger.info(`Ring 1 completed: ${allPassed ? "PASSED" : "ESCALATED to Ring 2"}`, {
      processingTime: `${ringResult.processingTimeMs}ms`,
    });

    return ringResult;
  }

  /**
   * Run Ring 2: Domain Expert Review
   * Consensus-based — dissent escalates to Ring 3
   */
  async runRing2(
    outputId: string,
    data: { content: string; sources: string[]; jurisdiction: string; query: string }
  ): Promise<RingResult> {
    const startTime = Date.now();
    const agents = this.getRingAgents(2);
    const results: AgentReviewResult[] = [];
    let escalated = false;

    logger.info(`Ring 2: Starting domain expert review for ${outputId}`);

    for (const agent of agents) {
      const agentStart = Date.now();
      let verdict: VerdictValue = "go";
      let comment: string | undefined;

      try {
        verdict = await this.executeDomainReview(agent, data);
      } catch (error: any) {
        verdict = "abstain";
        comment = `Domain review failed: ${error.message}`;
      }

      const result: AgentReviewResult = {
        agentNumber: agent.number,
        agentName: agent.name,
        ring: 2,
        verdict: verdict === "no_go" ? "fail" : verdict,
        comment,
        processingTimeMs: Date.now() - agentStart,
        status: "completed",
        automated: agent.automationLevel >= 50,
      };

      results.push(result);
    }

    // Consensus check
    const nonAbstain = results.filter((r) => r.verdict !== "abstain");
    const passCount = nonAbstain.filter((r) => r.verdict === "go" || r.verdict === "pass").length;
    const failCount = nonAbstain.filter((r) => r.verdict === "fail" || r.verdict === "no_go").length;

    const consensusRatio = nonAbstain.length > 0
      ? (passCount / nonAbstain.length) * 100
      : 0;

    const passed = consensusRatio >= this.config.ring2ConsensusThreshold &&
      failCount <= this.config.ring2DissentLimit;

    if (!passed) {
      escalated = true;
      logger.warn(`Ring 2: Consensus check failed`, {
        passCount,
        failCount,
        consensusRatio: `${consensusRatio.toFixed(0)}%`,
        threshold: `${this.config.ring2ConsensusThreshold}%`,
      });
    }

    const ringResult: RingResult = {
      ring: 2,
      agents: results,
      passed,
      escalated,
      escalatedToRing: escalated ? 3 : undefined,
      summary: passed
        ? `Konsens erreicht (${consensusRatio.toFixed(0)}% Zustimmung, ${passCount}/${nonAbstain.length})`
        : `Kein Konsens (${consensusRatio.toFixed(0)}% < ${this.config.ring2ConsensusThreshold}%) — eskaliert an Ring 3`,
      processingTimeMs: Date.now() - startTime,
    };

    logger.info(`Ring 2 completed: ${passed ? "CONSENSUS" : "ESCALATED to Ring 3"}`, {
      processingTime: `${ringResult.processingTimeMs}ms`,
    });

    return ringResult;
  }

  /**
   * Run Ring 3: Authoritative Validation
   * CCO must sign. Independent Auditor can veto.
   */
  async runRing3(
    outputId: string,
    data: { content: string; sources: string[]; jurisdiction: string; query: string },
    ring2Results: AgentReviewResult[]
  ): Promise<RingResult> {
    const startTime = Date.now();
    const agents = this.getRingAgents(3);
    const results: AgentReviewResult[] = [];
    let vetoActive = false;
    let ccoSigned = false;

    logger.info(`Ring 3: Starting authoritative validation for ${outputId}`);

    for (const agent of agents) {
      const agentStart = Date.now();
      let verdict: VerdictValue = "go";
      let comment: string | undefined;

      try {
        verdict = await this.executeAuthoritativeReview(agent, data, ring2Results);
      } catch (error: any) {
        verdict = "abstain";
        comment = `Review failed: ${error.message}`;
      }

      // Agent 17 (CCO) must sign
      if (agent.number === 17 && verdict === "go") {
        ccoSigned = true;
      }

      // Agent 20 (Auditor) can veto
      if (agent.number === 20 && verdict === "no_go") {
        vetoActive = true;
      }

      const result: AgentReviewResult = {
        agentNumber: agent.number,
        agentName: agent.name,
        ring: 3,
        verdict,
        comment,
        processingTimeMs: Date.now() - agentStart,
        status: "completed",
        automated: false,
      };

      results.push(result);
    }

    const passed = ccoSigned && (!vetoActive || this.config.allowVetoOverride);

    const ringResult: RingResult = {
      ring: 3,
      agents: results,
      passed,
      escalated: false,
      summary: passed
        ? `Autoritative Freigabe erteilt (CCO: ${ccoSigned ? "✅" : "❌"}, Veto: ${vetoActive ? "⚠️" : "✅"})`
        : `Freigabe verweigert (CCO: ${ccoSigned ? "✅" : "❌"}, Veto: ${vetoActive ? "⚠️" : "✅"})`,
      processingTimeMs: Date.now() - startTime,
    };

    logger.info(`Ring 3 completed: ${passed ? "APPROVED" : "REJECTED"}`, {
      ccoSigned,
      vetoActive,
    });

    return ringResult;
  }

  /**
   * Full three-ring review pipeline
   */
  async runFullReview(
    outputId: string,
    outputType: string,
    data: {
      content: string;
      sources: string[];
      jurisdiction: string;
      query: string;
    }
  ): Promise<ThreeRingReport> {
    const totalStart = Date.now();

    logger.info(`Starting full 3-ring review for ${outputId}`);

    // Ring 1: Automated Pre-Check
    const ring1 = await this.runRing1(outputId, data);

    // Ring 1 must pass, otherwise escalate to Ring 2 for resolution
    if (!ring1.passed) {
      // Ring 2 reviews the No-Go
      const ring2 = await this.runRing2(outputId, data);
      const ring2Results = ring2.agents;

      // If Ring 2 also fails, escalate to Ring 3
      if (!ring2.passed) {
        const ring3 = await this.runRing3(outputId, data, ring2Results);

        return {
          outputId,
          outputType,
          rings: [ring1, ring2, ring3],
          overallPassed: ring3.passed,
          signedByCCO: ring3.agents.some((a) => a.agentNumber === 17 && a.verdict === "go"),
          vetoActive: ring3.agents.some((a) => a.agentNumber === 20 && a.verdict === "no_go"),
          vetoOverridden: false,
          totalProcessingTimeMs: Date.now() - totalStart,
          completedAt: new Date().toISOString(),
        };
      }

      return {
        outputId,
        outputType,
        rings: [ring1, ring2],
        overallPassed: ring2.passed,
        signedByCCO: false,
        vetoActive: false,
        vetoOverridden: false,
        totalProcessingTimeMs: Date.now() - totalStart,
        completedAt: new Date().toISOString(),
      };
    }

    // Ring 1 passed: continue with Ring 2 (domain expert review)
    const ring2 = await this.runRing2(outputId, data);

    if (!ring2.passed) {
      const ring3 = await this.runRing3(outputId, data, ring2.agents);

      return {
        outputId,
        outputType,
        rings: [ring1, ring2, ring3],
        overallPassed: ring3.passed,
        signedByCCO: ring3.agents.some((a) => a.agentNumber === 17 && a.verdict === "go"),
        vetoActive: ring3.agents.some((a) => a.agentNumber === 20 && a.verdict === "no_go"),
        vetoOverridden: false,
        totalProcessingTimeMs: Date.now() - totalStart,
        completedAt: new Date().toISOString(),
      };
    }

    // Ring 1 + Ring 2 passed: final report
    return {
      outputId,
      outputType,
      rings: [ring1, ring2],
      overallPassed: true,
      signedByCCO: false,
      vetoActive: false,
      vetoOverridden: false,
      totalProcessingTimeMs: Date.now() - totalStart,
      completedAt: new Date().toISOString(),
    };
  }

  // ============================================================
  // EXECUTION ENGINES
  // NOTE: These are structural framework stubs. In production,
  // agents would be integrated with LLM-based validation via
  // tenAgentOrchestrator.ts for Ring 2+3 reviews.
  // Ring 1 checks are rule-based and suitable for automation.
  // ============================================================

  /**
   * Execute automated check for Ring 1 agents.
   * These are rule-based structural checks, not LLM-based.
   * For full LLM-based review, use tenAgentOrchestrator.ts.
   */
  private async executeAutomatedCheck(
    agent: AgentDefinition,
    data: { content: string; sources: string[]; jurisdiction: string }
  ): Promise<VerdictValue> {
    switch (agent.number) {
      case 1: // Format Validator
        return data.content.length > 0 ? "go" : "no_go";
      case 2: // Source Verifier
        return data.sources.length > 0 ? "go" : "no_go";
      case 3: // Plausibility Checker
        return data.content.length >= 50 ? "go" : "no_go";
      case 4: // Jurisdiction Consistency Checker
        return ["US", "EU", "CN", "JP", "Global", "UK"].includes(data.jurisdiction)
          ? "go"
          : "no_go";
      case 5: // ALCOA+ Scanner
        return data.content.length > 20 ? "go" : "no_go";
      default:
        return "go";
    }
  }

  /**
   * Execute domain review for Ring 2 agents
   */
  private async executeDomainReview(
    agent: AgentDefinition,
    data: { content: string; sources: string[]; jurisdiction: string; query: string }
  ): Promise<VerdictValue> {
    // Domain match: check if query/content matches agent's jurisdiction/domain
    const queryLower = data.query.toLowerCase();
    const contentLower = data.content.toLowerCase();

    // Check jurisdiction match
    const jurisdictionMatch = agent.jurisdiction === "Global" ||
      data.jurisdiction === agent.jurisdiction;

    // Check domain relevance
    const domainTerms = agent.domain.toLowerCase().split(/[\s,/]+/);
    const domainRelevant = domainTerms.some(
      (term) => queryLower.includes(term) || contentLower.includes(term)
    );

    if (!jurisdictionMatch && !domainRelevant) {
      return "abstain"; // Agent not relevant to this query
    }

    return "go"; // Default: approve (would call actual LLM in production)
  }

  /**
   * Execute authoritative review for Ring 3 agents
   */
  private async executeAuthoritativeReview(
    agent: AgentDefinition,
    data: { content: string; sources: string[]; jurisdiction: string; query: string },
    ring2Results: AgentReviewResult[]
  ): Promise<VerdictValue> {
    // Agent 17 (CCO): always reviews
    if (agent.number === 17) {
      return ring2Results.some((r) => r.verdict === "fail") ? "no_go" : "go";
    }

    // Agent 20 (Auditor): samples random reviews
    if (agent.number === 20) {
      return "go"; // Would perform independent audit in production
    }

    return "go";
  }

  /**
   * Update config at runtime
   */
  updateConfig(config: Partial<ThreeRingConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info("ThreeRingMediator config updated", { config: JSON.stringify(this.config) });
  }

  /**
   * Get current config
   */
  getConfig(): ThreeRingConfig {
    return { ...this.config };
  }
}

export const threeRingMediator = new ThreeRingMediator();
