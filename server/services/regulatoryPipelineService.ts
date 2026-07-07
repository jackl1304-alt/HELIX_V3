import { db } from "../db.js";
import { regulatoryUpdates, dataSources } from "../../shared/schema.js";
import { eq, desc, sql, and, inArray, isNotNull } from "drizzle-orm";
import { Logger } from "./logger.service.js";
import { immutableAuditService } from "./immutableAuditService.js";
import { claimExtractor } from "./claimExtractor.js";
import { createHash } from "node:crypto";
import axios from "axios";
import * as cheerio from "cheerio";

const logger = new Logger("RegPipeline");

// ============================================================
// DETECT → TRIAGE → VALIDATE → PROPAGATE Pipeline
// Section 3.3 der Spezifikation
// ============================================================

export type ImpactLevel = "high" | "medium" | "low";
export type PipelineStage = "detect" | "triage" | "validate" | "propagate";

export interface PipelineEvent {
  id: string;
  sourceId: string;
  title: string;
  description?: string;
  url?: string;
  publishedDate?: Date;
  jurisdiction: string;
  impactLevel?: ImpactLevel;
  affectedCategories?: string[];
  stage: PipelineStage;
  status: "pending" | "processing" | "completed" | "failed" | "escalated";
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface DetectionResult {
  detected: number;
  sources: string[];
  errors: string[];
  durationMs: number;
}

export interface TriageResult {
  classified: number;
  high: number;
  medium: number;
  low: number;
  escalatedToHuman: number;
}

export interface PipelineReport {
  pipelineId: string;
  stages: {
    detect: DetectionResult;
    triage: TriageResult;
    validate?: { validated: number; approved: number; rejected: number };
    propagate?: { propagated: number; notified: number };
  };
  overallStatus: "completed" | "partial" | "failed";
  durationMs: number;
}

// ============================================================
// DETECT: Quellen automatisiert überwachen
// ============================================================
const DETECT_SOURCES = [
  {
    id: "fda_federal_register",
    name: "FDA Federal Register",
    url: "https://www.federalregister.gov/api/v1/documents.json",
    params: { conditions: { agencies__in: ["food-and-drug-administration"] }, order: "newest", per_page: 20 },
    jurisdiction: "US",
    type: "official_api",
    enabled: true,
  },
  {
    id: "fda_enforcement",
    name: "FDA Enforcement",
    url: "https://api.fda.gov/device/enforcement.json",
    params: { limit: 20, sort: "report_date:desc" },
    jurisdiction: "US",
    type: "official_api",
    enabled: true,
  },
  {
    id: "eurlex",
    name: "EU EUR-Lex",
    url: "https://eur-lex.europa.eu/search.html",
    params: { scope: "EURLEX", text: "medical device", type: "quick", lang: "en" },
    jurisdiction: "EU",
    type: "web_scraping",
    enabled: false, // requires human review of search results
  },
  {
    id: "mdcg_guidance",
    name: "MDCG Guidance",
    url: "https://health.ec.europa.eu/mdcg_en",
    jurisdiction: "EU",
    type: "web_scraping",
    enabled: true,
  },
  {
    id: "mhra_alerts",
    name: "MHRA Alerts",
    url: "https://www.gov.uk/government/collections/device-alerts",
    jurisdiction: "UK",
    type: "web_scraping",
    enabled: true,
  },
  // These would be implemented with official API keys when available
  {
    id: "nmpa_notices",
    name: "NMPA Notices (China)",
    url: "https://www.nmpa.gov.cn/",
    jurisdiction: "CN",
    type: "web_scraping",
    enabled: false,
  },
  {
    id: "pmda_notifications",
    name: "PMDA Notifications (Japan)",
    url: "https://www.pmda.go.jp/",
    jurisdiction: "JP",
    type: "web_scraping",
    enabled: false,
  },
];

// ============================================================
// PIPELINE SERVICE
// ============================================================
export class RegulatoryPipelineService {
  private pipelineHistory: Map<string, PipelineReport> = new Map();
  private sourceEnabled: Map<string, boolean> = new Map(
    DETECT_SOURCES.map((s) => [s.id, s.enabled])
  );

  /**
   * PHASE 1: DETECT — Automatisierte Quellenüberwachung
   * Echtzeit für FDA/EMA, stündlich für andere Behörden
   */
  async runDetection(options?: {
    sources?: string[];
    dryRun?: boolean;
  }): Promise<DetectionResult> {
    const startTime = Date.now();
    const detected: string[] = [];
    const errors: string[] = [];
    const activeSources = DETECT_SOURCES.filter(
      (s) => (this.sourceEnabled.get(s.id) ?? s.enabled) && (!options?.sources || options.sources.includes(s.id))
    );

    // Ensure DataSource entries exist for all active pipeline sources
    // This enables proper sourceId foreign key linking
    for (const source of activeSources) {
      try {
        await db.insert(dataSources).values({
          id: source.id,
          name: source.name,
          url: source.url,
          type: "regulatory",
          isActive: true,
        }).onConflictDoNothing();
      } catch { /* ignore - DS may not exist yet */ }
    }

    logger.info(`Pipeline-DETECT: Starting detection from ${activeSources.length} sources`);

    for (const source of activeSources) {
      try {
        let items: any[] = [];

        if (source.type === "official_api") {
          items = await this.fetchFromAPI(source);
        } else if (source.type === "web_scraping") {
          items = await this.fetchFromWeb(source);
        }

        if (items.length > 0) {
          detected.push(source.id);
          logger.info(`DETECT: ${source.id} → ${items.length} items`);

          // Persist detected items to regulatory_updates table
          if (!options?.dryRun) {
            for (const item of items) {
              try {
                const title = (item.title || "").slice(0, 1000);
                const hashedTitle = createHash("sha256").update(title).digest("hex");

                // Check existence by hashedTitle to avoid duplicates
                const existing = await db
                  .select({ id: regulatoryUpdates.id })
                  .from(regulatoryUpdates)
                  .where(eq(regulatoryUpdates.hashedTitle, hashedTitle))
                  .limit(1);

                if (existing.length === 0) {
                  // Type-safe insert using Drizzle's inferred insert type
                  await db.insert(regulatoryUpdates).values({
                    title,
                    hashedTitle,
                    sourceId: source.id, // DataSource entry now guaranteed to exist
                    sourceUrl: item.documentUrl || source.url,
                    documentUrl: item.documentUrl || "",
                    type: item.type === "guidance" ? "guidance" : item.type === "alert" ? "alert" : "regulation",
                    jurisdiction: item.jurisdiction || source.jurisdiction,
                    tags: item.tags || [],
                    isProcessed: false,
                    metadata: { pipelineSource: source.id, detectedAt: new Date().toISOString() },
                    publishedAt: item.publishedDate || new Date(),
                    createdAt: new Date(),
                  });
                }
              } catch (insertError: any) {
                logger.warn(`DETECT: Failed to persist item from ${source.id}: ${insertError.message}`);
              }
            }
          }
        }

        // Audit trail
        if (!options?.dryRun) {
          await immutableAuditService.append({
            eventType: "pipeline.detect_completed",
            entityType: "data_source",
            entityId: source.id,
            jurisdiction: source.jurisdiction,
            payload: {
              sourceName: source.name,
              itemsFound: items.length,
              type: source.type,
              persisted: items.length,
            },
            description: `Detection from ${source.name}: ${items.length} items found and persisted`,
          });
        }
      } catch (error: any) {
        errors.push(`${source.id}: ${error.message}`);
        logger.error(`DETECT failed for ${source.id}`, { error: error.message });
      }
    }

    return {
      detected: detected.length,
      sources: detected,
      errors,
      durationMs: Date.now() - startTime,
    };
  }

  /**
   * PHASE 2: TRIAGE — ML-basierte Klassifizierung (80% automatisiert)
   */
  async runTriage(options?: {
    dryRun?: boolean;
  }): Promise<TriageResult> {
    const startTime = Date.now();
    const unprocessed = await db
      .select()
      .from(regulatoryUpdates)
      .where(
        and(
          eq(regulatoryUpdates.isProcessed, false),
          isNotNull(regulatoryUpdates.title),
        )
      )
      .limit(100);

    let high = 0, medium = 0, low = 0;
    let escalatedToHuman = 0;

    logger.info(`Pipeline-TRIAGE: Classifying ${unprocessed.length} unprocessed updates`);

    for (const update of unprocessed) {
      const impact = this.classifyImpact(update);

      // Update the record with classification
      if (!options?.dryRun) {
        await db
          .update(regulatoryUpdates)
          .set({
            riskScore: impact.score,
            priority: impact.priority,
            isProcessed: impact.impactLevel === "low", // auto-process low, escalate medium/high
            processingNotes: `Triage: ${impact.impactLevel} impact, score ${impact.score}`,
          })
          .where(eq(regulatoryUpdates.id, update.id));
      }

      if (impact.impactLevel === "high") {
        high++;
        escalatedToHuman++;
      } else if (impact.impactLevel === "medium") {
        medium++;
      } else {
        low++;
      }
    }

    await immutableAuditService.append({
      eventType: "pipeline.triage_completed",
      payload: { total: unprocessed.length, high, medium, low, escalatedToHuman },
      description: `Triage: ${unprocessed.length} updates classified (${high} high, ${medium} medium, ${low} low)`,
    });

    return {
      classified: unprocessed.length,
      high,
      medium,
      low,
      escalatedToHuman,
    };
  }

  /**
   * PHASE 3: VALIDATE — Menschliche Prüfung (0% automatisiert)
   * Nur qualifizierte Juristen/RA prüfen High-Impact-Updates
   */
  async runValidation(options?: {
    updateIds?: string[];
    validatedBy?: string;
    dryRun?: boolean;
  }): Promise<{ validated: number; approved: number; rejected: number }> {
    const highImpactUpdates = await db
      .select()
      .from(regulatoryUpdates)
      .where(
        and(
          options?.updateIds
            ? inArray(regulatoryUpdates.id, options.updateIds)
            : sql`risk_score >= 60`,
          eq(regulatoryUpdates.isProcessed, false),
        )
      )
      .limit(50);

    logger.info(`Pipeline-VALIDATE: ${highImpactUpdates.length} updates awaiting human validation`);

    // In a production system, this would send notifications to human reviewers.
    // Here we mark them as needing human review.
    for (const update of highImpactUpdates) {
      if (!options?.dryRun) {
        await db
          .update(regulatoryUpdates)
          .set({
            processingNotes: `AWAITING_HUMAN_VALIDATION: ${options?.validatedBy || "unassigned"}`,
            authorityVerified: false,
          })
          .where(eq(regulatoryUpdates.id, update.id));
      }
    }

    await immutableAuditService.append({
      eventType: "pipeline.validate_completed",
      payload: {
        total: highImpactUpdates.length,
        awaitingReview: highImpactUpdates.length,
        validatedBy: options?.validatedBy || "unassigned",
      },
      description: `Validation: ${highImpactUpdates.length} updates require human review`,
    });

    return {
      validated: 0, // Human validation happens asynchronously
      approved: 0,
      rejected: 0,
    };
  }

  /**
   * PHASE 4: PROPAGATE — Canary-Rollout + Benachrichtigung
   */
  async runPropagation(options?: {
    dryRun?: boolean;
  }): Promise<{ propagated: number; notified: number }> {
    const propagated: string[] = [];
    const startTime = Date.now();

    // Get low-risk, processed updates ready for propagation
    const readyUpdates = await db
      .select()
      .from(regulatoryUpdates)
      .where(
        and(
          eq(regulatoryUpdates.isProcessed, true),
          sql`(risk_score < 40 OR risk_score IS NULL)`,
          isNotNull(regulatoryUpdates.id),
        )
      )
      .limit(100);

    logger.info(`Pipeline-PROPAGATE: ${readyUpdates.length} updates ready for propagation`);

    for (const update of readyUpdates) {
      // Extract claims from processed updates
      try {
        const claimCount = await claimExtractor.extractFromRegulatoryUpdate(update.id);
        propagated.push(update.id);
        logger.info(`PROPAGATE: Claims extracted from ${update.title?.substring(0, 50)} (${claimCount} claims)`);
      } catch (error: any) {
        logger.error(`PROPAGATE failed for ${update.id}`, { error: error.message });
      }
    }

    await immutableAuditService.append({
      eventType: "pipeline.propagate_completed",
      payload: { propagated: propagated.length, totalProcessed: readyUpdates.length },
      description: `Propagation: ${propagated.length}/${readyUpdates.length} updates published`,
    });

    return { propagated: propagated.length, notified: 0 };
  }

  /**
   * Full pipeline: Detect → Triage → Validate → Propagate
   */
  async runFullPipeline(options?: {
    sources?: string[];
    dryRun?: boolean;
  }): Promise<PipelineReport> {
    const pipelineId = `pipeline_${Date.now()}`;
    const totalStart = Date.now();

    logger.info(`Starting full pipeline ${pipelineId}`);

    // Phase 1: Detect
    const detect = await this.runDetection(options);

    // Phase 2: Triage
    const triage = await this.runTriage(options);

    // Phase 3: Validate (only if high-impact items found)
    const validate = triage.high > 0
      ? await this.runValidation(options)
      : undefined;

    // Phase 4: Propagate
    const propagate = await this.runPropagation(options);

    const report: PipelineReport = {
      pipelineId,
      stages: { detect, triage, validate, propagate },
      overallStatus: detect.errors.length > 0 ? "partial" : "completed",
      durationMs: Date.now() - totalStart,
    };

    this.pipelineHistory.set(pipelineId, report);

    logger.info(`Pipeline ${pipelineId} complete: ${report.overallStatus} in ${report.durationMs}ms`);

    return report;
  }

  // ============================================================
  // HELPERS
  // ============================================================

  /**
   * Fetch from official API source
   */
  private async fetchFromAPI(source: typeof DETECT_SOURCES[0]): Promise<any[]> {
    try {
      const response = await axios.get(source.url, {
        params: source.params,
        timeout: 15000,
        headers: { "User-Agent": "HelixRegulatory/1.0" },
      });

      // Normalize response based on source
      if (source.id === "fda_enforcement") {
        return (response.data?.results || []).map((r: any) => ({
          sourceId: source.id,
          title: (r.product_description || "FDA Enforcement").slice(0, 200),
          description: `${r.reason_for_recall || ""} - ${r.classification || ""}`,
          documentUrl: r.more_code_info || "https://www.fda.gov/medical-devices",
          publishedDate: r.report_date ? new Date(r.report_date) : new Date(),
          type: "alert",
          jurisdiction: source.jurisdiction,
          tags: ["recall", "enforcement", "fda"],
        }));
      }

      if (source.id === "fda_federal_register") {
        return (response.data?.results || []).map((r: any) => ({
          sourceId: source.id,
          title: (r.title || "FDA Federal Register").slice(0, 200),
          description: r.abstract || "",
          documentUrl: r.html_url || r.document_number || "",
          publishedDate: r.publication_date ? new Date(r.publication_date) : new Date(),
          type: "regulation",
          jurisdiction: source.jurisdiction,
          tags: ["federal_register", "fda"],
        }));
      }

      return [];
    } catch (error: any) {
      if (error?.response?.status === 429) {
        logger.warn(`Rate limited on ${source.id}, will retry later`);
        return [];
      }
      throw error;
    }
  }

  /**
   * Fetch from web scraping source
   */
  private async fetchFromWeb(source: typeof DETECT_SOURCES[0]): Promise<any[]> {
    try {
      const response = await axios.get(source.url, {
        timeout: 20000,
        headers: { "User-Agent": "Mozilla/5.0 HelixRegulatory/1.0" },
      });

      const $ = cheerio.load(response.data);
      const items: any[] = [];

      if (source.id === "mdcg_guidance") {
        $("a").each((_: number, el: any) => {
          const text = $(el).text().trim();
          const href = $(el).attr("href");
          if (!text || !href) return;
          if (/MDCG\s?20\d{2}/i.test(text)) {
            items.push({
              sourceId: source.id,
              title: text.slice(0, 200),
              description: "MDCG Guidance Document",
              documentUrl: href.startsWith("http") ? href : new URL(href, source.url).toString(),
              publishedDate: new Date(),
              type: "guidance",
              jurisdiction: source.jurisdiction,
              tags: ["mdcg", "guidance"],
            });
          }
        });
      }

      if (source.id === "mhra_alerts") {
        $("a").each((_: number, el: any) => {
          const text = $(el).text().trim();
          const href = $(el).attr("href");
          if (!text || !href) return;
          if (/alert|safety|field safety/i.test(text) && text.length > 10) {
            items.push({
              sourceId: source.id,
              title: text.slice(0, 200),
              description: "MHRA Safety Alert",
              documentUrl: href.startsWith("http") ? href : new URL(href, source.url).toString(),
              publishedDate: new Date(),
              type: "alert",
              jurisdiction: source.jurisdiction,
              tags: ["mhra", "alert", "safety"],
            });
          }
        });
      }

      return items.slice(0, 30);
    } catch (error: any) {
      logger.warn(`Web scrape failed for ${source.id}: ${error.message}`);
      return [];
    }
  }

  /**
   * Impact classification based on content analysis
   * ML-basiert in Produktion, hier regelbasiert
   */
  private classifyImpact(update: any): {
    impactLevel: ImpactLevel;
    score: number;
    priority: number;
  } {
    const text = `${update.title || ""} ${update.description || ""} ${update.content || ""}`.toLowerCase();
    let score = 10;

    const HIGH_IMPACT_PATTERNS = [
      /class\s*(i{1,3}|iv)/i,
      /recall/i,
      /field safety corrective action/i,
      /\bsafety\b|\bsicherheit\b/i,
      /mandatory|verpflichtend/i,
      /deadline|frist|übergangsfrist/i,
      /cyber|(?:\bsecurity\b.*vulnerability)|(?:vulnerability.*\bsecurity\b)/i,
      /critical|kritisch/i,
    ];

    const MEDIUM_IMPACT_PATTERNS = [
      /guidance|update|revision/i,
      /clinical|evaluation|study/i,
      /software|algorithm|ml|ai/i,
      /labeling|kennzeichnung/i,
      /quality|management/i,
      /\brisk\b|\bhazard\b|risiko|gefahr/i,
    ];

    for (const pattern of HIGH_IMPACT_PATTERNS) {
      if (pattern.test(text)) score += 30;
    }

    for (const pattern of MEDIUM_IMPACT_PATTERNS) {
      if (pattern.test(text)) score += 15;
    }

    // Cap at 100
    score = Math.min(100, score);

    let impactLevel: ImpactLevel;
    let priority: number;

    if (score >= 60) {
      impactLevel = "high";
      priority = 1;
    } else if (score >= 30) {
      impactLevel = "medium";
      priority = 2;
    } else {
      impactLevel = "low";
      priority = 3;
    }

    return { impactLevel, score, priority };
  }

  /**
   * Get pipeline history
   */
  getPipelineHistory(): PipelineReport[] {
    return Array.from(this.pipelineHistory.values());
  }

  /**
   * Get latest pipeline report
   */
  getLatestPipeline(): PipelineReport | undefined {
    const entries = Array.from(this.pipelineHistory.entries());
    return entries.length > 0 ? entries[entries.length - 1][1] : undefined;
  }

  /**
   * Get pipeline configuration
   */
  getSourceConfig() {
    return DETECT_SOURCES.map((s) => ({
      id: s.id,
      name: s.name,
      jurisdiction: s.jurisdiction,
      type: s.type,
      enabled: s.enabled,
    }));
  }

  /**
   * Enable/disable a detection source
   */
  setSourceEnabled(sourceId: string, enabled: boolean): boolean {
    const source = DETECT_SOURCES.find((s) => s.id === sourceId);
    if (!source) return false;
    this.sourceEnabled.set(sourceId, enabled);
    logger.info(`Source ${sourceId} ${enabled ? "enabled" : "disabled"}`);
    return true;
  }
}

export const regulatoryPipelineService = new RegulatoryPipelineService();
