import { db } from "../db.js";
import { aiTransparencyLog as aiTransparencyLogTable } from "../../shared/schema.js";
import { desc, sql } from "drizzle-orm";
import { Logger } from "./logger.service.js";
import { createHash } from "node:crypto";

const logger = new Logger("AITransparency");

/**
 * AI/ML-Transparenzlogging nach AI Act Art. 13 + FDA PCCP Guidance.
 *
 * Jeder AI-gestützte Output protokolliert:
 * - Verwendetes Modell (Name, Version, Trainingsdatum)
 * - Prompt (vollständig, nicht getruncated)
 * - Temperature, Top-P, Seed
 * - Kontextfenster (welche Primärquellen einbezogen wurden)
 * - Konfidenz-Score und Unsicherheits-Quantifizierung
 * - Token-Verbrauch (Input/Output)
 * - Latenz
 */

export interface ModelInfo {
  name: string;             // z.B. "poolside/laguna-m.1"
  version?: string;         // z.B. "1.0.0"
  trainingDate?: string;    // ISO-Datum des Trainings-Cutoffs
  provider: string;         // z.B. "OpenRouter", "Groq", "Azure OpenAI"
}

export interface InferenceParams {
  temperature: number;
  topP: number;
  seed?: number;
  maxTokens: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface SourceContext {
  sourceIds: string[];
  regulatoryUpdateIds: string[];
  claimIds: string[];
  totalDocuments: number;
}

export interface AITransparencyRecord {
  id: string;
  outputId: string;

  // Modell-Informationen
  modelName: string;
  modelVersion?: string;
  provider: string;

  // Prompt (vollständig)
  systemPrompt: string;
  userPrompt: string;
  fullPrompt: string;

  // Parameter
  temperature: number;
  topP: number;
  seed: number | null;
  maxTokens: number;

  // Kontext
  sourceIds: string[];
  regulatoryUpdateIds: string[];
  claimIds: string[];
  totalSourceDocuments: number;

  // Ergebnisse
  responseContent: string;
  responseLength: number;

  // Token-Verbrauch
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;

  // Confidence
  confidenceScore: number;
  confidenceExplanation?: string;
  uncertaintyFlags: string[];

  // Metadaten
  latencyMs: number;
  agentName: string;
  jurisdiction?: string;
  createdAt: Date;
}

export class AITransparencyService {
  private readonly TRANSPARENCY_TABLE = "ai_transparency_log";

  /**
   * Log a complete AI inference with full transparency data.
   */
  async logInference(params: {
    outputId: string;
    modelInfo: ModelInfo;
    inferenceParams: InferenceParams;
    prompts: { system: string; user: string; full: string };
    sourceContext: SourceContext;
    response: { content: string; inputTokens: number; outputTokens: number };
    latencyMs: number;
    agentName: string;
    jurisdiction?: string;
  }): Promise<void> {
    const record = {
      outputId: params.outputId,
      modelName: params.modelInfo.name,
      modelVersion: params.modelInfo.version || null,
      provider: params.modelInfo.provider,
      systemPrompt: params.prompts.system,
      userPrompt: params.prompts.user,
      fullPrompt: params.prompts.full,
      temperature: params.inferenceParams.temperature,
      topP: params.inferenceParams.topP,
      seed: params.inferenceParams.seed || null,
      maxTokens: params.inferenceParams.maxTokens,
      sourceIds: params.sourceContext.sourceIds,
      regulatoryUpdateIds: params.sourceContext.regulatoryUpdateIds,
      claimIds: params.sourceContext.claimIds,
      totalSourceDocuments: params.sourceContext.totalDocuments,
      responseContent: params.response.content,
      responseLength: params.response.content.length,
      inputTokens: params.response.inputTokens,
      outputTokens: params.response.outputTokens,
      totalTokens: params.response.inputTokens + params.response.outputTokens,
      confidenceScore: this.calculateConfidence(
        params.response,
        params.inferenceParams
      ),
      uncertaintyFlags: this.detectUncertainty(params.response.content),
      latencyMs: params.latencyMs,
      agentName: params.agentName,
      jurisdiction: params.jurisdiction || null,
      createdAt: new Date(),
    };

    // Store in the audit trail for immutability
    try {
      const { immutableAuditService } = await import("./immutableAuditService.js");
      await immutableAuditService.append({
        eventType: "agent.model_invoked",
        entityType: "output",
        entityId: params.outputId,
        performedBy: params.agentName,
        performedRole: "ai_agent",
        jurisdiction: params.jurisdiction,
        payload: {
          modelName: params.modelInfo.name,
          modelVersion: params.modelInfo.version,
          provider: params.modelInfo.provider,
          temperature: params.inferenceParams.temperature,
          topP: params.inferenceParams.topP,
          inputTokens: params.response.inputTokens,
          outputTokens: params.response.outputTokens,
          confidenceScore: record.confidenceScore,
          sourceCount: params.sourceContext.totalDocuments,
          latencyMs: params.latencyMs,
        },
        description: `AI inference by ${params.agentName} using ${params.modelInfo.name}`,
      });
    } catch (error: any) {
      logger.warn("Failed to append transparency to audit trail", {
        error: error.message,
      });
    }

    // Store full transparency record in database using Drizzle ORM
    try {
      await db.insert(aiTransparencyLogTable).values({
        outputId: record.outputId,
        modelName: record.modelName,
        modelVersion: record.modelVersion,
        provider: record.provider,
        systemPrompt: record.systemPrompt,
        userPrompt: record.userPrompt,
        fullPrompt: record.fullPrompt,
        temperature: record.temperature,
        topP: record.topP,
        seed: record.seed,
        maxTokens: record.maxTokens,
        sourceIds: record.sourceIds,
        regulatoryUpdateIds: record.regulatoryUpdateIds,
        claimIds: record.claimIds,
        totalSourceDocuments: record.totalSourceDocuments,
        responseContent: record.responseContent,
        responseLength: record.responseLength,
        inputTokens: record.inputTokens,
        outputTokens: record.outputTokens,
        totalTokens: record.totalTokens,
        confidenceScore: record.confidenceScore,
        uncertaintyFlags: record.uncertaintyFlags,
        latencyMs: record.latencyMs,
        agentName: record.agentName,
        jurisdiction: record.jurisdiction,
      });
    } catch (error: any) {
      // Fallback: log to console if DB table doesn't exist
      logger.warn("Failed to store AI transparency record (table may not exist yet)", {
        error: error.message,
        outputId: params.outputId,
      });
    }

    logger.info("AI transparency logged", {
      outputId: params.outputId,
      model: params.modelInfo.name,
      tokens: record.totalTokens,
      latency: `${params.latencyMs}ms`,
    });
  }

  /**
   * Calculate confidence score based on inference characteristics
   */
  private calculateConfidence(
    response: { content: string; inputTokens: number; outputTokens: number },
    params: InferenceParams
  ): number {
    let score = 75; // Baseline

    // Higher temperature = lower confidence
    if (params.temperature > 0.7) score -= 10;
    if (params.temperature > 1.0) score -= 15;
    if (params.temperature < 0.3) score += 5;

    // Very long responses may have lower confidence
    if (response.content.length > 4000) score -= 5;
    if (response.content.length < 100) score -= 10;

    // Uncertainty markers
    const uncertaintyWords = [
      "maybe", "perhaps", "possibly", "might", "could be",
      "vielleicht", "möglicherweise", "könnte", "eventuell",
      "unklar", "nicht sicher", "keine information",
    ];
    const lowerContent = response.content.toLowerCase();
    const uncertaintyCount = uncertaintyWords.filter((w) =>
      lowerContent.includes(w)
    ).length;
    score -= uncertaintyCount * 3;

    return Math.max(10, Math.min(100, score));
  }

  /**
   * Detect uncertainty flags in response text
   */
  private detectUncertainty(content: string): string[] {
    const flags: string[] = [];
    const lower = content.toLowerCase();

    const patterns: [RegExp, string][] = [
      [/maybe|perhaps|possibly/i, "HEDGING_LANGUAGE"],
      [/i'm not sure|i am not sure|unsure/i, "EXPRESSED_UNCERTAINTY"],
      [/vielleicht|möglicherweise|eventuell/i, "HEDGING_LANGUAGE_DE"],
      [/nicht sicher|unklar|keine garantie/i, "EXPRESSED_UNCERTAINTY_DE"],
      [/könnte|könnten/i, "SPECULATIVE_LANGUAGE_DE"],
      [/further research|more research needed/i, "NEEDS_RESEARCH"],
      [/cannot confirm|cannot verify/i, "CANNOT_VERIFY"],
      [/no data available|no information|not found/i, "NO_DATA"],
      [/keine daten|keine information|nicht gefunden/i, "NO_DATA_DE"],
      [/§|article \d+|art\. \d+/i, "CITES_SPECIFIC_REGULATION"],
      [/stand: |stichtag:|gültig bis/i, "TIME_BOUNDED_CLAIM"],
    ];

    for (const [pattern, flag] of patterns) {
      if (pattern.test(lower)) {
        flags.push(flag);
      }
    }

    return [...new Set(flags)];
  }

  /**
   * Get transparency log for a specific output
   */
  async getOutputTransparency(outputId: string): Promise<AITransparencyRecord | null> {
    try {
      const result = await db
        .select()
        .from(aiTransparencyLogTable)
        .where(sql`${aiTransparencyLogTable.outputId} = ${outputId}`)
        .limit(1);
      if (result.length > 0) {
        return result[0] as unknown as AITransparencyRecord;
      }
    } catch {
      // Table may not exist
    }
    return null;
  }

  /**
   * Get recent transparency records
   */
  async getRecentLogs(limit = 50) {
    try {
      const result = await db
        .select()
        .from(aiTransparencyLogTable)
        .orderBy(desc(aiTransparencyLogTable.createdAt))
        .limit(limit);
      return result || [];
    } catch {
      return [];
    }
  }

  /**
   * Get transparency statistics
   */
  async getStats() {
    try {
      const result = await db
        .select({
          total: sql<number>`COUNT(*)::int`,
          avgConfidence: sql<number>`AVG(confidence_score)::int`,
          avgTokens: sql<number>`AVG(total_tokens)::int`,
          avgLatency: sql<number>`AVG(latency_ms)::int`,
          modelsUsed: sql<number>`COUNT(DISTINCT model_name)::int`,
          agentsActive: sql<number>`COUNT(DISTINCT agent_name)::int`,
        })
        .from(aiTransparencyLogTable);
      const row = result[0];
      return {
        totalInferences: Number(row?.total || 0),
        averageConfidence: Math.round(Number(row?.avgConfidence || 0)),
        averageTokens: Math.round(Number(row?.avgTokens || 0)),
        averageLatencyMs: Math.round(Number(row?.avgLatency || 0)),
        modelsUsed: Number(row?.modelsUsed || 0),
        agentsActive: Number(row?.agentsActive || 0),
      };
    } catch {
      return {
        totalInferences: 0,
        averageConfidence: 0,
        averageTokens: 0,
        averageLatencyMs: 0,
        modelsUsed: 0,
        agentsActive: 0,
      };
    }
  }
}

export const aiTransparencyService = new AITransparencyService();
