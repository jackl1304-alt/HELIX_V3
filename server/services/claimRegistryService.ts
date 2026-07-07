import { db } from "../db.js";
import { claims, claimVerifications, outputClaims, type InsertClaim, type Claim, type InsertClaimVerification, type ClaimVerification, type InsertOutputClaim } from "../../shared/schema.js";
import { eq, and, inArray, sql, desc, or, ilike } from "drizzle-orm";
import { Logger } from "./logger.service.js";
import { createHash } from "node:crypto";

const logger = new Logger("ClaimRegistry");

// Reviewer weight mapping for mediator
const REVIEWER_WEIGHTS: Record<string, number> = {
  fda_expert: 1.5,
  eu_legal: 1.5,
  notified_body: 1.4,
  clinical_expert: 1.3,
  compliance_officer: 1.2,
  quality_auditor: 1.2,
  regulatory_strategist: 1.1,
  patent_examiner: 1.1,
  customer_auditor: 1.0,
  data_scientist: 1.0,
};

export class ClaimRegistryService {
  /**
   * Create a new claim with deduplication
   */
  async createClaim(input: InsertClaim): Promise<Claim> {
    // Generate claimHash for dedup
    const claimHash = createHash("sha256")
      .update(input.claimText.toLowerCase().trim())
      .digest("hex")
      .substring(0, 32);

    // Check for existing claim with same hash
    const existing = await db
      .select()
      .from(claims)
      .where(and(
        eq(claims.claimHash, claimHash),
        eq(claims.sourceId, input.sourceId || ""),
        eq(claims.tenantId, input.tenantId || ""),
      ))
      .limit(1);

    if (existing.length > 0) {
      logger.info("Duplicate claim detected, returning existing", { claimHash });
      return existing[0];
    }

    const [claim] = await db
      .insert(claims)
      .values({ ...input, claimHash })
      .returning();

    logger.info("Claim created", { claimId: claim.id, claimType: claim.claimType });
    return claim;
  }

  /**
   * Bulk create claims from extraction results
   */
  async bulkCreateClaims(inputs: InsertClaim[]): Promise<Claim[]> {
    const results: Claim[] = [];
    for (const input of inputs) {
      try {
        const claim = await this.createClaim(input);
        results.push(claim);
      } catch (error: any) {
        logger.error("Failed to create claim in bulk", { error: error.message, claimText: input.claimText?.substring(0, 80) });
      }
    }
    return results;
  }

  /**
   * Get claim by ID with full provenance
   */
  async getClaimWithProvenance(claimId: string) {
    const claim = await db
      .select()
      .from(claims)
      .where(eq(claims.id, claimId))
      .limit(1);

    if (claim.length === 0) return null;

    const verifications = await db
      .select()
      .from(claimVerifications)
      .where(eq(claimVerifications.claimId, claimId))
      .orderBy(desc(claimVerifications.reviewedAt));

    const outputs = await db
      .select()
      .from(outputClaims)
      .where(eq(outputClaims.claimId, claimId))
      .orderBy(desc(outputClaims.createdAt));

    return {
      claim: claim[0],
      verifications,
      outputs,
      verificationCount: verifications.length,
      outputCount: outputs.length,
    };
  }

  /**
   * Search claims with filters
   */
  async searchClaims(params: {
    search?: string;
    status?: string;
    claimType?: string;
    jurisdiction?: string;
    regulatoryUpdateIds?: string[];
    limit?: number;
    offset?: number;
  }) {
    const { search, status, claimType, jurisdiction, regulatoryUpdateIds, limit = 50, offset = 0 } = params;
    const conditions: any[] = [];

    if (search) {
      const term = `%${search}%`;
      conditions.push(
        or(
          ilike(claims.claimText, term),
          ilike(claims.sourceCitation, term),
          sql`array_to_string(${claims.tags}, ' ') ILIKE ${term}`,
        )
      );
    }
    if (status) conditions.push(eq(claims.status, status as any));
    if (claimType) conditions.push(eq(claims.claimType, claimType as any));
    if (jurisdiction) conditions.push(eq(claims.jurisdiction, jurisdiction));
    if (regulatoryUpdateIds && regulatoryUpdateIds.length > 0) {
      conditions.push(inArray(claims.regulatoryUpdateId, regulatoryUpdateIds));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [result, totalResult] = await Promise.all([
      db
        .select()
        .from(claims)
        .where(where)
        .orderBy(desc(claims.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(claims)
        .where(where),
    ]);

    return {
      claims: result,
      total: Number(totalResult[0]?.count || 0),
      limit,
      offset,
    };
  }

  /**
   * Verify a claim – add a verification record and update claim status
   */
  async verifyClaim(input: InsertClaimVerification): Promise<{ verification: ClaimVerification; claim: Claim }> {
    const [verification] = await db
      .insert(claimVerifications)
      .values(input)
      .returning();

    // Update claim status via mediator
    const claim = await this.runMediator(input.claimId);

    logger.info("Claim verified", {
      claimId: input.claimId,
      reviewerRole: input.reviewerRole,
      verdict: input.verdict,
    });

    return { verification, claim };
  }

  /**
   * MEDIATOR: Aggregate all verifications and determine claim status & confidence
   */
  async runMediator(claimId: string): Promise<Claim> {
    const verifications = await db
      .select()
      .from(claimVerifications)
      .where(eq(claimVerifications.claimId, claimId));

    if (verifications.length === 0) {
      const [claim] = await db
        .update(claims)
        .set({ status: "draft", confidenceScore: 0 })
        .where(eq(claims.id, claimId))
        .returning();
      return claim;
    }

    // Weighted confidence score
    let weightedSum = 0;
    let totalWeight = 0;
    let hasDisputed = false;
    let allConfirmed = true;

    for (const v of verifications) {
      const weight = REVIEWER_WEIGHTS[v.reviewerRole] || 1.0;
      weightedSum += (v.confidenceOverride || 50) * weight;
      totalWeight += weight;
      if (v.verdict === "disputed" || v.verdict === "needs_correction") {
        hasDisputed = true;
        allConfirmed = false;
      }
      if (v.verdict !== "confirmed") {
        allConfirmed = false;
      }
    }

    const confidenceScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 50;

    // Determine status
    let status: string;
    if (allConfirmed) {
      status = "verified";
    } else if (hasDisputed) {
      status = "contested";
    } else {
      status = "draft";
    }

    const [claim] = await db
      .update(claims)
      .set({ status: status as any, confidenceScore, updatedAt: new Date() })
      .where(eq(claims.id, claimId))
      .returning();

    return claim;
  }

  /**
   * Link output to claims
   */
  async linkOutputToClaims(input: InsertOutputClaim[]): Promise<void> {
    if (input.length === 0) return;
    await db.insert(outputClaims).values(input);
    logger.info("Output linked to claims", { count: input.length });
  }

  /**
   * Dashboard – aggregated statistics
   */
  async getDashboard() {
    const [totalResult, byStatusResult, byTypeResult, byReviewerResult, recentResult, verificationsResult] =
      await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(claims),
        db
          .select({
            status: claims.status,
            count: sql<number>`count(*)`,
          })
          .from(claims)
          .groupBy(claims.status),
        db
          .select({
            claimType: claims.claimType,
            count: sql<number>`count(*)`,
          })
          .from(claims)
          .groupBy(claims.claimType),
        db
          .select({
            reviewerRole: claimVerifications.reviewerRole,
            verdict: claimVerifications.verdict,
            count: sql<number>`count(*)`,
          })
          .from(claimVerifications)
          .groupBy(claimVerifications.reviewerRole, claimVerifications.verdict),
        db
          .select()
          .from(claims)
          .orderBy(desc(claims.createdAt))
          .limit(10),
        db
          .select({ count: sql<number>`count(*)` })
          .from(claimVerifications),
      ]);

    return {
      total: Number(totalResult[0]?.count || 0),
      byStatus: Object.fromEntries(
        byStatusResult.map((r: any) => [r.status, Number(r.count)])
      ),
      byType: Object.fromEntries(
        byTypeResult.map((r: any) => [r.claimType, Number(r.count)])
      ),
      byReviewer: byReviewerResult.reduce((acc: any, r: any) => {
        if (!acc[r.reviewerRole]) acc[r.reviewerRole] = {};
        acc[r.reviewerRole][r.verdict] = Number(r.count);
        return acc;
      }, {} as Record<string, Record<string, number>>),
      recentClaims: recentResult,
      verificationRate: typeof totalResult[0]?.count !== 'undefined'
        ? Math.round((verificationsResult?.[0]?.count || 0) / Math.max(1, Number(totalResult[0]?.count || 0)) * 100)
        : 0,
    };
  }
}

export const claimRegistryService = new ClaimRegistryService();
