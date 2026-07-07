import OpenAI from "openai";
import { Logger } from "./logger.service.js";
import { immutableAuditService } from "./immutableAuditService.js";
import { aiTransparencyService } from "./aiTransparencyService.js";
import { provenanceChainService } from "./provenanceChainService.js";
import { randomBytes } from "node:crypto";

const logger = new Logger("TenAgentOrchestrator");

// ============================================================
// SELECTED 10 AGENTS — Best mix across all 3 rings
// Ring 1 (Automated): #1 Format Validator, #3 Plausibility, #5 ALCOA+
// Ring 2 (Domain): #7 EU MedDev, #8 FDA, #9 Patent, #10 Clinical, #14 AI Governance
// Ring 3 (Authoritative): #17 CCO, #20 Independent Auditor
// ============================================================

export type Verdict = "pass" | "fail" | "conditional" | "abstain";

export interface AgentReviewResult {
  agentNumber: number;
  agentName: string;
  ring: 1 | 2 | 3;
  verdict: Verdict;
  confidence: number; // 0-100
  comment: string;
  evidenceUrls: string[];
  processingTimeMs: number;
}

export interface TenAgentReport {
  reportId: string;
  query: string;
  inputContent: string;
  agents: AgentReviewResult[];
  overallVerdict: "approved" | "conditional" | "rejected" | "pending";
  overallConfidence: number;
  ring1Passed: boolean;
  ring2Consensus: number; // percentage
  ring3SignedByCCO: boolean;
  ring3VetoActive: boolean;
  totalProcessingTimeMs: number;
  completedAt: string;
  auditChainHash?: string;
}

// ============================================================
// AGENT DEFINITIONS — The 10 selected
// ============================================================

const SELECTED_AGENTS = [
  // Ring 1 — Automated
  { number: 1, name: "Format Validator", ring: 1 as const, systemPrompt: `Du bist ein Format-Validierungs-Agent für regulatorische Ausgaben.
Prüfe ob die Ausgabe dem korrekten Format entspricht:
- Enthält die Ausgabe klare Struktur (Überschriften, Absätze)?
- Sind regulatorische Referenzen korrekt formatiert (z.B. "MDR Art. 10", "ISO 13485:2016")?
- Sind Quellenangaben vorhanden?
- Ist die Sprache angemessen (formell, regulatorisch)?
Antworte NUR mit einem JSON: {"verdict": "pass"|"fail"|"conditional", "confidence": 0-100, "comment": "...", "issues": ["..."]}` },

  { number: 3, name: "Plausibility Checker", ring: 1 as const, systemPrompt: `Du bist ein statistischer Plausibilitäts-Checker für regulatorische Aussagen.
Prüfe die Plausibilität der gemachten Aussagen:
- Sind Datenplausibel (keine offensichtlichen Ausreißer)?
- Sind Zeitangaben logisch und aktuell?
- Stimmen die regulatorischen Klassifizierungen?
- Gibt es widersprüchliche Informationen?
Antworte NUR mit einem JSON: {"verdict": "pass"|"fail"|"conditional", "confidence": 0-100, "comment": "...", "inconsistencies": ["..."]}` },

  { number: 5, name: "ALCOA+ Scanner", ring: 1 as const, systemPrompt: `Du bist ein ALCOA+-Compliance-Scanner für regulatorische Datenintegrität.
Prüfe gegen ALCOA+-Kriterien (FDA 21 CFR Part 11, EU Annex 11):
- Attributable: Sind Quellen klar zugeordnet?
- Legible: Ist der Inhalt lesbar und verständlich?
- Contemporaneous: Sind Zeitstempel vorhanden und plausibel?
- Original: Wurden Originalquellen referenziert?
- Accurate: Sind die Informationen fehlerfrei?
- +Complete, +Consistent, +Enduring, +Available
Antworte NUR mit einem JSON: {"verdict": "pass"|"fail"|"conditional", "confidence": 0-100, "comment": "...", "alcoaScore": {"A":bool,"L":bool,"C":bool,"O":bool,"A2":bool,"plus":{...}}}` },

  // Ring 2 — Domain Experts
  { number: 7, name: "EU MedDev Expert", ring: 2 as const, systemPrompt: `Du bist ein EU-Medizinprodukterecht-Experte mit Notified Body-Erfahrung (MDR/IVDR).
Prüfe die regulatorische Aussage auf:
- MDR/IVDR-Konformität (EU 2017/745, EU 2017/746)
- CE-Kennzeichnungskorrektheit
- Benannte-Stellen-Anforderungen
- Klinische Bewertung (Art. 61 MDR)
- Post-Market Surveillance (Art. 83-86 MDR)
- Technische Dokumentation (Annex II/III MDR)
Jurisdiction: EU. Prüfe nur EU-relevante Aussagen.
Antworte NUR mit einem JSON: {"verdict": "pass"|"fail"|"conditional", "confidence": 0-100, "comment": "...", "regulatoryRefs": ["..."]}` },

  { number: 8, name: "FDA Expert", ring: 2 as const, systemPrompt: `Du bist ein FDA-Regulierungs-Experte (Ex-FDA oder RAC-zertifiziert).
Prüfe die regulatorische Aussage auf FDA-Konformität:
- 510(k)/PMA/De Novo/Klassifizierung korrekt?
- QMSR (21 CFR 820) Anforderungen erfüllt?
- FDA Guidance Dokumente korrekt referenziert?
- Pre-Submission/De Novo Prozesse korrekt beschrieben?
- FDA Enforcement/Recall korrekt eingeordnet?
Jurisdiction: US. Prüfe nur US-relevante Aussagen.
Antworte NUR mit einem JSON: {"verdict": "pass"|"fail"|"conditional", "confidence": 0-100, "comment": "...", "regulatoryRefs": ["..."]}` },

  { number: 9, name: "Patent Counsel", ring: 2 as const, systemPrompt: `Du bist ein Patentanwalt mit USPTO/EPA-Erfahrung.
Prüfe patentbezogene Aussagen:
- Sind Patentreferenzen korrekt (Nummern, Status)?
- Freedom-to-Operate-Aspekte korrekt dargestellt?
- Patentverletzungsrisiken korrekt identifiziert?
- Technische Claims korrekt beschrieben?
Antworte NUR mit einem JSON: {"verdict": "pass"|"fail"|"conditional", "confidence": 0-100, "comment": "...", "patentRefs": ["..."]}` },

  { number: 10, name: "Clinical Data Expert", ring: 2 as const, systemPrompt: `Du bist ein klinischer Daten-Experte (MD mit klinischer Erfahrung).
Prüfe klinische Daten und Studien:
- Sind Studiendaten korrekt zitiert?
- Evidenzniveau korrekt eingeordnet?
- ISO 14155-konforme klinische Prüfung?
- Klinische Bewertung korrekt beschrieben?
- Statistische Methoden angemessen?
Antworte NUR mit einem JSON: {"verdict": "pass"|"fail"|"conditional", "confidence": 0-100, "comment": "...", "clinicalRefs": ["..."]}` },

  { number: 14, name: "Data/AI Governance Expert", ring: 2 as const, systemPrompt: `Du bist ein Data/AI-Governance-Experte (CIPP/E + AI-Act-Expertise).
Prüfe AI/Daten-Governance-Aspekte:
- AI-Act Art. 13 Transparenzanforderungen erfüllt?
- GDPR-Konformität der Datenverarbeitung?
- Risikobewertung nach AI-Act Annex III korrekt?
- Datenschutz-Grundsätze (Art. 5 DSGVO) eingehalten?
- Pseudonymisierung/Datenminimierung korrekt umgesetzt?
Antworte NUR mit einem JSON: {"verdict": "pass"|"fail"|"conditional", "confidence": 0-100, "comment": "...", "governanceRefs": ["..."]}` },

  // Ring 3 — Authoritative
  { number: 17, name: "Chief Compliance Officer", ring: 3 as const, systemPrompt: `Du bist der Chief Compliance Officer (CCO) mit Haftungsübernahme.
Du hast finale Signatur für alle regulatorischen Ausgaben.
Prüfe das GESAMTBILD:
- Sind alle wesentlichen regulatorischen Anforderungen adressiert?
- Gibt es offene Risiken die eine Freigabe verhindern?
- Ist die Compliance-Gesamtbewertung positiv?
- Übernimmst du Haftung für diese Ausgabe?
Antworte NUR mit einem JSON: {"verdict": "pass"|"fail"|"conditional", "confidence": 0-100, "comment": "...", "signsOff": true|false, "residualRisks": ["..."]}` },

  { number: 20, name: "Independent Auditor", ring: 3 as const, systemPrompt: `Du bist ein unabhängiger externer Auditor (ISO 13485/27001-zertifiziert).
Du hast Veto-Recht (eskalierend an Aufsichtsrat).
Führe eine unabhängige Stichprobenprüfung durch:
- Prüfe 2-3 zufällige Aussagen gegen Primärquellen
- Bewerte die Gesamtmethodik
- Identifiziere systematische Fehler
- Entscheide: Go oder Veto (mit Begründung)
Antworte NUR mit einem JSON: {"verdict": "pass"|"fail"|"conditional", "confidence": 0-100, "comment": "...", "vetoActive": true|false, "vetoReason": "...", "sampleChecked": ["..."]}` },
];

// ============================================================
// LLM CLIENT — OpenRouter or Groq fallback
// ============================================================

const MODEL =
  process.env.OPENROUTER_MODEL ||
  process.env.OPENAI_MODEL ||
  "openai/gpt-4o-mini";

let client: OpenAI | null = null;
let ENABLE_GROQ_FALLBACK = true;

if (process.env.OPENROUTER_API_KEY) {
  client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  });
  logger.info("OpenRouter client initialized", { model: MODEL });
} else if (process.env.OPENAI_API_KEY) {
  client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  logger.info("OpenAI client initialized", { model: MODEL });
} else {
  logger.warn("No LLM API key found — using Groq fallback only");
}

// ============================================================
// CORE ORCHESTRATOR
// ============================================================

export class TenAgentOrchestrator {

  /**
   * Run a single agent review via LLM
   */
  private async runSingleAgent(
    agent: typeof SELECTED_AGENTS[0],
    content: string,
    query: string,
    context: { sources: string[]; jurisdiction: string; claimIds?: string[] }
  ): Promise<AgentReviewResult> {
    const startTime = Date.now();

    const userPrompt = `## Zu prüfende Ausgabe
${content.substring(0, 3000)}

## Ursprüngliche Anfrage
${query}

## Kontext
- Jurisdiktion: ${context.jurisdiction}
- Quellen: ${context.sources.join(", ") || "keine angegeben"}
- Verknüpfte Claims: ${context.claimIds?.join(", ") || "keine"}

Prüfe die Ausgabe aus deiner Expertenperspektive und antworte NUR mit validem JSON.`;

    try {
      let responseText = "";

      if (client) {
        const response = await client.chat.completions.create({
          model: MODEL,
          max_tokens: 1024,
          temperature: 0.3,
          top_p: 0.9,
          messages: [
            { role: "system", content: agent.systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });
        responseText = response.choices[0]?.message?.content || "";
      } else if (ENABLE_GROQ_FALLBACK) {
        const { callGroqChatStreaming } = await import("./groqService.js");
        responseText = await callGroqChatStreaming(userPrompt, agent.systemPrompt);
      }

      // Parse JSON response
      const parsed = this.parseAgentResponse(responseText);

      // Log transparency
      const outputId = `agent_${agent.number}_${Date.now()}`;
      await aiTransparencyService.logInference({
        outputId,
        modelInfo: { name: MODEL, provider: client ? "OpenRouter" : "Groq" },
        inferenceParams: { temperature: 0.3, topP: 0.9, maxTokens: 1024 },
        prompts: { system: agent.systemPrompt, user: userPrompt, full: userPrompt },
        sourceContext: {
          sourceIds: context.sources,
          regulatoryUpdateIds: [],
          claimIds: context.claimIds || [],
          totalDocuments: context.sources.length,
        },
        response: { content: responseText, inputTokens: 0, outputTokens: 0 },
        latencyMs: Date.now() - startTime,
        agentName: agent.name,
        jurisdiction: context.jurisdiction,
      });

      return {
        agentNumber: agent.number,
        agentName: agent.name,
        ring: agent.ring,
        verdict: parsed.verdict || "conditional",
        confidence: Math.min(100, Math.max(0, parsed.confidence || 50)),
        comment: parsed.comment || "Kein Kommentar",
        evidenceUrls: parsed.regulatoryRefs || parsed.clinicalRefs || parsed.patentRefs || [],
        processingTimeMs: Date.now() - startTime,
      };
    } catch (error: any) {
      logger.error(`Agent ${agent.number} (${agent.name}) failed`, { error: error.message });
      return {
        agentNumber: agent.number,
        agentName: agent.name,
        ring: agent.ring,
        verdict: "conditional",
        confidence: 30,
        comment: `Prüfung fehlgeschlagen: ${error.message}`,
        evidenceUrls: [],
        processingTimeMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Parse agent LLM response to extract structured verdict
   */
  private parseAgentResponse(text: string): {
    verdict?: Verdict;
    confidence?: number;
    comment?: string;
    [key: string]: any;
  } {
    try {
      // Try to extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Normalize verdict
        const verdictMap: Record<string, Verdict> = {
          pass: "pass",
          fail: "fail",
          conditional: "conditional",
          go: "pass",
          no_go: "fail",
          abstain: "abstain",
        };
        return {
          ...parsed,
          verdict: verdictMap[parsed.verdict?.toLowerCase()] || "conditional",
          confidence: typeof parsed.confidence === "number" ? parsed.confidence : 50,
        };
      }
    } catch {
      // Fall through
    }

    // Fallback: analyze text for sentiment
    const lower = text.toLowerCase();
    if (lower.includes("fail") || lower.includes("no_go") || lower.includes("abgelehnt")) {
      return { verdict: "fail", confidence: 60, comment: text.substring(0, 200) };
    }
    if (lower.includes("pass") || lower.includes("go") || lower.includes("bestanden")) {
      return { verdict: "pass", confidence: 70, comment: text.substring(0, 200) };
    }
    return { verdict: "conditional", confidence: 50, comment: text.substring(0, 200) };
  }

  /**
   * Run Ring 1 (Automated Pre-Check) — ALL must pass
   */
  private async runRing1(
    content: string,
    query: string,
    context: { sources: string[]; jurisdiction: string; claimIds?: string[] }
  ): Promise<{ results: AgentReviewResult[]; passed: boolean }> {
    const ring1Agents = SELECTED_AGENTS.filter((a) => a.ring === 1);
    const results: AgentReviewResult[] = [];

    for (const agent of ring1Agents) {
      const result = await this.runSingleAgent(agent, content, query, context);
      results.push(result);
      // Ring 1: First fail = stop
      if (result.verdict === "fail") {
        logger.warn(`Ring 1: Agent ${agent.number} (${agent.name}) FAILED — stopping`);
        break;
      }
    }

    const passed = results.every((r) => r.verdict !== "fail");
    return { results, passed };
  }

  /**
   * Run Ring 2 (Domain Expert Review) — Consensus-based
   */
  private async runRing2(
    content: string,
    query: string,
    context: { sources: string[]; jurisdiction: string; claimIds?: string[] }
  ): Promise<{ results: AgentReviewResult[]; consensus: number; passed: boolean }> {
    const ring2Agents = SELECTED_AGENTS.filter((a) => a.ring === 2);
    const results: AgentReviewResult[] = [];

    // Run all Ring 2 agents in parallel for speed
    const promises = ring2Agents.map((agent) =>
      this.runSingleAgent(agent, content, query, context)
    );
    const ring2Results = await Promise.all(promises);

    for (const result of ring2Results) {
      results.push(result);
    }

    // Calculate consensus
    const nonAbstain = results.filter((r) => r.verdict !== "abstain");
    const passCount = nonAbstain.filter((r) => r.verdict === "pass").length;
    const consensus = nonAbstain.length > 0 ? (passCount / nonAbstain.length) * 100 : 0;

    // Pass if >= 60% consensus and no more than 1 fail
    const failCount = nonAbstain.filter((r) => r.verdict === "fail").length;
    const passed = consensus >= 60 && failCount <= 1;

    return { results, consensus, passed };
  }

  /**
   * Run Ring 3 (Authoritative Validation) — CCO signs, Auditor can veto
   */
  private async runRing3(
    content: string,
    query: string,
    context: { sources: string[]; jurisdiction: string; claimIds?: string[] }
  ): Promise<{ results: AgentReviewResult[]; ccoSigned: boolean; vetoActive: boolean }> {
    const ring3Agents = SELECTED_AGENTS.filter((a) => a.ring === 3);
    const results: AgentReviewResult[] = [];

    for (const agent of ring3Agents) {
      const result = await this.runSingleAgent(agent, content, query, context);
      results.push(result);
    }

    const ccoSigned = results.some((r) => r.agentNumber === 17 && r.verdict === "pass");
    const vetoActive = results.some((r) => r.agentNumber === 20 && r.verdict === "fail");

    return { results, ccoSigned, vetoActive };
  }

  /**
   * FULL 10-AGENT REVIEW PIPELINE
   */
  async runFullReview(params: {
    content: string;
    query: string;
    sources?: string[];
    jurisdiction?: string;
    claimIds?: string[];
  }): Promise<TenAgentReport> {
    const reportId = `report_${Date.now()}_${randomBytes(4).toString('hex')}`;
    const totalStart = Date.now();

    const context = {
      sources: params.sources || [],
      jurisdiction: params.jurisdiction || "Global",
      claimIds: params.claimIds || [],
    };

    logger.info(`Starting 10-agent review: ${reportId}`);

    // ─── Ring 1: Automated Pre-Check ───
    const ring1 = await this.runRing1(params.content, params.query, context);
    logger.info(`Ring 1 ${ring1.passed ? "PASSED" : "FAILED"}`, {
      agentsRun: ring1.results.length,
    });

    // ─── Ring 2: Domain Expert Review ───
    const ring2 = await this.runRing2(params.content, params.query, context);
    logger.info(`Ring 2 ${ring2.passed ? "CONSENSUS" : "NO CONSENSUS"}`, {
      consensus: `${ring2.consensus.toFixed(0)}%`,
      agentsRun: ring2.results.length,
    });

    // ─── Ring 3: Authoritative Validation ───
    const ring3 = await this.runRing3(params.content, params.query, context);
    logger.info(`Ring 3 completed`, {
      ccoSigned: ring3.ccoSigned,
      vetoActive: ring3.vetoActive,
    });

    // ─── Determine Overall Verdict ───
    let overallVerdict: "approved" | "conditional" | "rejected" | "pending";
    if (ring1.passed && ring2.passed && ring3.ccoSigned && !ring3.vetoActive) {
      overallVerdict = "approved";
    } else if (ring3.vetoActive) {
      overallVerdict = "rejected";
    } else if (ring1.passed && ring2.consensus >= 40) {
      overallVerdict = "conditional";
    } else {
      overallVerdict = "rejected";
    }

    // ─── Calculate Overall Confidence ───
    const allResults = [...ring1.results, ...ring2.results, ...ring3.results];
    const overallConfidence =
      allResults.length > 0
        ? Math.round(
            allResults.reduce((sum, r) => sum + r.confidence, 0) / allResults.length
          )
        : 0;

    // ─── Audit Trail Entry ───
    let auditChainHash: string | undefined;
    try {
      const auditEvent = await immutableAuditService.append({
        eventType: "review.ring3_completed",
        entityType: "report",
        entityId: reportId,
        performedBy: "10-agent-orchestrator",
        performedRole: "system",
        jurisdiction: context.jurisdiction,
        payload: {
          reportId,
          overallVerdict,
          overallConfidence,
          ring1Passed: ring1.passed,
          ring2Consensus: ring2.consensus,
          ccoSigned: ring3.ccoSigned,
          vetoActive: ring3.vetoActive,
          agentsRun: allResults.length,
          totalProcessingMs: Date.now() - totalStart,
        },
        description: `10-Agent review completed: ${overallVerdict} (confidence: ${overallConfidence}%)`,
      });
      auditChainHash = auditEvent.chainHash;
    } catch (error: any) {
      logger.warn("Failed to append audit trail", { error: error.message });
    }

    // ─── Provenance Chain ───
    try {
      await provenanceChainService.createChainItem({
        chainId: `chain_${reportId}`,
        linkIndex: 0,
        linkType: "output",
        outputId: reportId,
        generator: "system:tenAgentOrchestrator",
        generatorVersion: "1.0.0",
        contentPayload: JSON.stringify({
          query: params.query,
          verdict: overallVerdict,
          confidence: overallConfidence,
          agentCount: allResults.length,
        }),
        tenantId: undefined,
      });
    } catch (error: any) {
      logger.warn("Failed to create provenance chain", { error: error.message });
    }

    const report: TenAgentReport = {
      reportId,
      query: params.query,
      inputContent: params.content.substring(0, 500),
      agents: allResults,
      overallVerdict,
      overallConfidence,
      ring1Passed: ring1.passed,
      ring2Consensus: ring2.consensus,
      ring3SignedByCCO: ring3.ccoSigned,
      ring3VetoActive: ring3.vetoActive,
      totalProcessingTimeMs: Date.now() - totalStart,
      completedAt: new Date().toISOString(),
      auditChainHash,
    };

    logger.info(`10-Agent review completed: ${reportId}`, {
      verdict: overallVerdict,
      confidence: overallConfidence,
      duration: `${report.totalProcessingTimeMs}ms`,
    });

    return report;
  }

  /**
   * Quick single-agent review (for on-demand checks)
   */
  async runSingleAgentReview(
    agentNumber: number,
    content: string,
    query: string,
    context: { sources?: string[]; jurisdiction?: string; claimIds?: string[] } = {}
  ): Promise<AgentReviewResult> {
    const agent = SELECTED_AGENTS.find((a) => a.number === agentNumber);
    if (!agent) {
      throw new Error(`Agent ${agentNumber} not found in selected 10 agents`);
    }
    return this.runSingleAgent(agent, content, query, {
      sources: context.sources || [],
      jurisdiction: context.jurisdiction || "Global",
      claimIds: context.claimIds,
    });
  }

  /**
   * Get list of selected agents
   */
  getSelectedAgents() {
    return SELECTED_AGENTS.map((a) => ({
      number: a.number,
      name: a.name,
      ring: a.ring,
    }));
  }

  /**
   * Get agent status from registry
   */
  getAgentStatus(agentNumber: number) {
    const agent = SELECTED_AGENTS.find((a) => a.number === agentNumber);
    if (!agent) return null;
    return {
      number: agent.number,
      name: agent.name,
      ring: agent.ring,
      systemPromptPreview: agent.systemPrompt.substring(0, 100) + "...",
    };
  }
}

export const tenAgentOrchestrator = new TenAgentOrchestrator();
