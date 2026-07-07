import { db } from "../db.js";
import { claims, regulatoryUpdates, legalCases, dataSources, type InsertClaim } from "../../shared/schema.js";
import { eq, desc, sql, isNotNull, and, isNull } from "drizzle-orm";
import { Logger } from "./logger.service.js";
import { claimRegistryService } from "./claimRegistryService.js";
import { provenanceChainService } from "./provenanceChainService.js";

const logger = new Logger("ClaimExtractor");

/**
 * Rule-based patterns for extracting claims from regulatory text.
 * Each pattern maps to a claim type and extracts the core assertion.
 */
const CLAIM_PATTERNS: Array<{
  type: "normative" | "regulatory" | "interpretive" | "factual" | "deadline" | "obligation";
  patterns: RegExp[];
  extract: (match: RegExpMatchArray, fullText: string) => string;
}> = [
  {
    type: "regulatory",
    patterns: [
      /(Regulation\s*\(EU\)\s*\d{4}\/\d+)\s*.*?(Art(?:icle)?\.?\s*\d+[\w\(\)]*(?:Abs\.?\s*\d+)?)/gi,
      /(MDR|IVDR)\s*(Art(?:icle)?\.?\s*\d+[\w\(\)]*(?:\s*Abs\.?\s*\d+)?)/gi,
      /(FDA|21\s*CFR)\s*(Part\s*\d+[\w\.]*)/gi,
      /(ISO\s*\d+[\w:-]*)\s*(?:Clause|Section|clause|section)\s*([\d\.]+)/gi,
    ],
    extract: (match: RegExpMatchArray) => {
      const [, regulation, article] = match;
      return `${regulation || ""} ${article || ""}`.trim();
    },
  },
  {
    type: "obligation",
    patterns: [
      /(?:shall|must|is required to|muss|hat zu|ist verpflichtet)[^.]*\./gi,
      /(?:requirement|anforderung|pflicht)[^.]*\./gi,
    ],
    extract: (match: RegExpMatchArray) => match[0].trim(),
  },
  {
    type: "deadline",
    patterns: [
      /(?:by|until|before|bis zum|bis|ab)\s*(?:\d{1,2}\.\d{1,2}\.)?\s*\d{4}/gi,
      /(?:transitional period|übergangsfrist|transition)\s*[^.]*\./gi,
      /(?:deadline|frist|compliance date)[^.]*\./gi,
    ],
    extract: (match: RegExpMatchArray) => match[0].trim(),
  },
  {
    type: "normative",
    patterns: [
      /(ISO|IEC|EN)\s*\d+[\w:-]*\s*(?::\s*\d{4})?\s*[^.]*\./gi,
    ],
    extract: (match: RegExpMatchArray) => match[0].trim(),
  },
  {
    type: "factual",
    patterns: [
      /(?:FDA cleared|FDA approved|CE marked|CE certified|PMA granted|510\(k\) cleared)\s*[^.]*\./gi,
      /(?:zugelassen|zertifiziert|registriert|genehmigt)\s*[^.]*\./gi,
    ],
    extract: (match: RegExpMatchArray) => match[0].trim(),
  },
];

export class ClaimExtractor {
  /**
   * Extract claims from a single regulatory update using rule-based patterns
   */
  async extractFromRegulatoryUpdate(updateId: string): Promise<number> {
    const [update] = await db
      .select()
      .from(regulatoryUpdates)
      .where(eq(regulatoryUpdates.id, updateId))
      .limit(1);

    if (!update) {
      logger.warn("Update not found", { updateId });
      return 0;
    }

    const textToSearch = `${update.title} ${update.description || ""} ${update.content || ""}`;
    const extractedClaims: InsertClaim[] = [];
    const seenTexts = new Set<string>();

    // Rule-based extraction
    for (const patternDef of CLAIM_PATTERNS) {
      for (const regex of patternDef.patterns) {
        let match: RegExpMatchArray | null;
        while ((match = regex.exec(textToSearch)) !== null) {
          const claimText = patternDef.extract(match, textToSearch);
          if (claimText.length < 10) continue;

          // Dedup within this extraction
          const normalized = claimText.toLowerCase().trim();
          if (seenTexts.has(normalized)) continue;
          seenTexts.add(normalized);

          extractedClaims.push({
            claimText,
            claimType: patternDef.type,
            sourceId: update.sourceId || "",
            sourceCitation: match[1] || "",
            sourceDocumentUrl: update.documentUrl || update.sourceUrl || "",
            sourceAccessDate: update.publishedDate || new Date(),
            regulatoryUpdateId: update.id,
            extractionMethod: "rule_based",
            extractedBy: "system:claimExtractor",
            jurisdiction: update.jurisdiction || undefined,
            tags: [patternDef.type, update.jurisdiction || "global"].filter(Boolean),
            tenantId: update.tenantId,
          } as InsertClaim);
        }
      }
    }

    // Store claims
    const created = await claimRegistryService.bulkCreateClaims(extractedClaims);

    // Create provenance chain items for each claim
    for (const claim of created) {
      await provenanceChainService.createChainItem({
        chainId: `chain_${claim.id}`,
        linkIndex: 0,
        linkType: "claim",
        claimId: claim.id,
        regulatoryUpdateId: update.id,
        generator: "system:claimExtractor",
        contentPayload: claim.claimText,
        tenantId: update.tenantId || undefined,
      });
    }

    // Mark update as processed
    await db
      .update(regulatoryUpdates)
      .set({ isProcessed: true, processingNotes: `Extracted ${created.length} claims via rule-based patterns` })
      .where(eq(regulatoryUpdates.id, update.id));

    logger.info(`Extracted ${created.length} claims from update ${updateId}`);
    return created.length;
  }

  /**
   * Extract claims from a single legal case
   */
  async extractFromLegalCase(caseId: string): Promise<number> {
    const [legalCase] = await db
      .select()
      .from(legalCases)
      .where(eq(legalCases.id, caseId))
      .limit(1);

    if (!legalCase) return 0;

    const textToSearch = `${legalCase.title} ${legalCase.summary || ""} ${legalCase.content || ""} ${legalCase.verdict || ""}`;
    const extractedClaims: InsertClaim[] = [];
    const seenTexts = new Set<string>();

    // Same rule-based extraction for legal cases
    for (const patternDef of CLAIM_PATTERNS) {
      for (const regex of patternDef.patterns) {
        let match: RegExpMatchArray | null;
        while ((match = regex.exec(textToSearch)) !== null) {
          const claimText = patternDef.extract(match, textToSearch);
          if (claimText.length < 10) continue;

          const normalized = claimText.toLowerCase().trim();
          if (seenTexts.has(normalized)) continue;
          seenTexts.add(normalized);

          extractedClaims.push({
            claimText,
            claimType: patternDef.type,
            sourceCitation: `${legalCase.court} - ${legalCase.caseNumber || ""}`,
            legalCaseId: legalCase.id,
            extractionMethod: "rule_based",
            extractedBy: "system:claimExtractor",
            jurisdiction: legalCase.jurisdiction,
            tags: ["legal", legalCase.jurisdiction].filter(Boolean),
          } as InsertClaim);
        }
      }
    }

    const created = await claimRegistryService.bulkCreateClaims(extractedClaims);
    logger.info(`Extracted ${created.length} claims from legal case ${caseId}`);
    return created.length;
  }

  /**
   * Process all unprocessed regulatory updates
   */
  async processAllUnprocessedUpdates(): Promise<{ processed: number; claimsCreated: number }> {
    const unprocessed = await db
      .select()
      .from(regulatoryUpdates)
      .where(
        and(
          eq(regulatoryUpdates.isProcessed, false),
          isNotNull(regulatoryUpdates.content),
        )
      )
      .limit(100);

    let totalClaims = 0;
    for (const update of unprocessed) {
      const count = await this.extractFromRegulatoryUpdate(update.id);
      totalClaims += count;
    }

    logger.info(`Processed ${unprocessed.length} updates, created ${totalClaims} claims`);
    return { processed: unprocessed.length, claimsCreated: totalClaims };
  }
}

export const claimExtractor = new ClaimExtractor();
