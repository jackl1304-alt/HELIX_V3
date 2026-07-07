import { db } from "../db.js";
import { auditTrail } from "../../shared/schema.js";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { Logger } from "./logger.service.js";
import { createHash } from "node:crypto";

const logger = new Logger("ImmutableAudit");

/**
 * Event types for the immutable audit trail.
 * Every system action maps to exactly one event type.
 */
export type AuditEventType =
  // Source lifecycle
  | "source.ingested"
  | "source.updated"
  | "source.deactivated"
  // Regulatory update lifecycle
  | "regulatory_update.created"
  | "regulatory_update.classified"
  | "regulatory_update.evaluated"
  // Claim lifecycle
  | "claim.created"
  | "claim.verified"
  | "claim.status_changed"
  | "claim.superseded"
  | "claim.retracted"
  // Agent actions
  | "agent.query_routed"
  | "agent.response_generated"
  | "agent.model_invoked"
  // Review lifecycle
  | "review.ring1_completed"
  | "review.ring2_completed"
  | "review.ring3_completed"
  | "review.escalated"
  | "review.approved"
  | "review.rejected"
  // Output lifecycle
  | "output.generated"
  | "output.cited"
  // User actions
  | "user.login"
  | "user.action_performed"
  | "admin.config_changed"
  // Pipeline
  | "pipeline.detect_completed"
  | "pipeline.triage_completed"
  | "pipeline.validate_completed"
  | "pipeline.propagate_completed";

export interface AuditEventInput {
  eventType: AuditEventType;
  entityType?: string;
  entityId?: string;
  performedBy?: string;
  performedRole?: string;
  jurisdiction?: string;
  payload: Record<string, any>;
  description?: string;
  tenantId?: string;
}

export interface AuditEvent extends AuditEventInput {
  id: string;
  previousHash: string | null;
  eventHash: string;
  chainHash: string;
  timestamp: Date;
}

export class ImmutableAuditService {
  private readonly SALT = "helix-audit-v1";

  /**
   * Compute SHA-256 hash of event content
   */
  private hashContent(input: string): string {
    return createHash("sha256")
      .update(input + this.SALT)
      .digest("hex");
  }

  /**
   * Append an event to the immutable audit trail.
   * Throws if writing fails — audit trail must never silently fail.
   */
  async append(input: AuditEventInput): Promise<AuditEvent> {
    // Get the previous event hash for chaining
    const lastEvent = await db
      .select({ chainHash: auditTrail.chainHash })
      .from(auditTrail)
      .orderBy(desc(auditTrail.timestamp))
      .limit(1);

    const previousHash = lastEvent.length > 0 ? lastEvent[0].chainHash : null;

    // Create canonical event content for hashing
    const timestamp = new Date().toISOString();
    const canonicalContent = JSON.stringify({
      previousHash,
      eventType: input.eventType,
      entityType: input.entityType || null,
      entityId: input.entityId || null,
      performedBy: input.performedBy || null,
      performedRole: input.performedRole || null,
      jurisdiction: input.jurisdiction || null,
      payload: input.payload,
      description: input.description || null,
      tenantId: input.tenantId || null,
      timestamp,
    });

    const eventHash = this.hashContent(canonicalContent);
    const chainHash = this.hashContent(
      (previousHash || "") + eventHash + timestamp
    );

    const [record] = await db
      .insert(auditTrail)
      .values({
        eventType: input.eventType,
        entityType: input.entityType,
        entityId: input.entityId,
        performedBy: input.performedBy,
        performedRole: input.performedRole,
        jurisdiction: input.jurisdiction,
        payload: input.payload as any,
        description: input.description,
        tenantId: input.tenantId,
        previousHash,
        eventHash,
        chainHash,
        timestamp: new Date(timestamp),
      })
      .returning();

    logger.info("Audit event appended", {
      eventType: input.eventType,
      chainHash: chainHash.substring(0, 12) + "...",
    });

    return record as unknown as AuditEvent;
  }

  /**
   * Validate the integrity of the entire audit trail.
   * Recomputes all hashes and checks chain continuity.
   */
  async validateIntegrity(
    options?: { limit?: number; fromTimestamp?: Date }
  ): Promise<{
    isValid: boolean;
    totalEvents: number;
    validatedEvents: number;
    brokenLinks: number;
    firstBrokenAt?: string;
    details: Array<{
      id: string;
      eventType: string;
      hashIntegrity: boolean;
      chainIntegrity: boolean;
      timestamp: string;
    }>;
  }> {
    const events = await db
      .select()
      .from(auditTrail)
      .orderBy(auditTrail.timestamp)
      .limit(options?.limit || 1000);

    let previousChainHash: string | null = null;
    let isValid = true;
    let brokenLinks = 0;
    let firstBrokenAt: string | undefined;
    const details: Array<{
      id: string;
      eventType: string;
      hashIntegrity: boolean;
      chainIntegrity: boolean;
      timestamp: string;
    }> = [];

    for (const event of events) {
      // Recompute eventHash
      const canonicalContent = JSON.stringify({
        previousHash: event.previousHash,
        eventType: event.eventType,
        entityType: event.entityType || null,
        entityId: event.entityId || null,
        performedBy: event.performedBy || null,
        performedRole: event.performedRole || null,
        jurisdiction: event.jurisdiction || null,
        payload: event.payload || {},
        description: event.description || null,
        tenantId: event.tenantId || null,
        timestamp: event.timestamp.toISOString(),
      });
      const recomputedEventHash = this.hashContent(canonicalContent);
      const hashIntegrity = recomputedEventHash === event.eventHash;

      // Recompute chainHash
      const recomputedChainHash = this.hashContent(
        (event.previousHash || "") + event.eventHash + event.timestamp.toISOString()
      );
      const chainIntegrity = recomputedChainHash === event.chainHash;

      // Check chain continuity
      const linkIntegrity = !previousChainHash || event.previousHash === previousChainHash;

      if (!hashIntegrity || !chainIntegrity || !linkIntegrity) {
        isValid = false;
        brokenLinks++;
        if (!firstBrokenAt) {
          firstBrokenAt = event.timestamp.toISOString();
        }
      }

      details.push({
        id: event.id,
        eventType: event.eventType,
        hashIntegrity: hashIntegrity && linkIntegrity,
        chainIntegrity,
        timestamp: event.timestamp.toISOString(),
      });

      previousChainHash = event.chainHash;
    }

    return {
      isValid,
      totalEvents: events.length,
      validatedEvents: events.length,
      brokenLinks,
      firstBrokenAt,
      details,
    };
  }

  /**
   * Get events for a specific entity (e.g., all events for a claim)
   */
  async getEntityHistory(
    entityType: string,
    entityId: string,
    limit = 100
  ) {
    return db
      .select()
      .from(auditTrail)
      .where(
        and(
          eq(auditTrail.entityType, entityType),
          eq(auditTrail.entityId, entityId)
        )
      )
      .orderBy(desc(auditTrail.timestamp))
      .limit(limit);
  }

  /**
   * Get events by type
   */
  async getEventsByType(
    eventType: AuditEventType,
    limit = 100
  ) {
    return db
      .select()
      .from(auditTrail)
      .where(eq(auditTrail.eventType, eventType))
      .orderBy(desc(auditTrail.timestamp))
      .limit(limit);
  }

  /**
   * Get recent events across all types
   */
  async getRecentEvents(limit = 50) {
    return db
      .select()
      .from(auditTrail)
      .orderBy(desc(auditTrail.timestamp))
      .limit(limit);
  }

  /**
   * Verify a specific chain of events by chain hash
   */
  async verifyChain(chainHash: string): Promise<{
    exists: boolean;
    isValid: boolean;
    event?: any;
  }> {
    const events = await db
      .select()
      .from(auditTrail)
      .where(eq(auditTrail.chainHash, chainHash))
      .limit(1);

    if (events.length === 0) {
      return { exists: false, isValid: false };
    }

    const event = events[0];
    const canonicalContent = JSON.stringify({
      previousHash: event.previousHash,
      eventType: event.eventType,
      entityType: event.entityType || null,
      entityId: event.entityId || null,
      performedBy: event.performedBy || null,
      performedRole: event.performedRole || null,
      jurisdiction: event.jurisdiction || null,
      payload: event.payload || {},
      description: event.description || null,
      tenantId: event.tenantId || null,
      timestamp: event.timestamp.toISOString(),
    });
    const recomputedEventHash = this.hashContent(canonicalContent);
    const recomputedChainHash = this.hashContent(
      (event.previousHash || "") + event.eventHash + event.timestamp.toISOString()
    );

    const isValid =
      recomputedEventHash === event.eventHash &&
      recomputedChainHash === event.chainHash;

    return { exists: true, isValid, event };
  }

  /**
   * Get audit trail statistics
   */
  async getStats() {
    const [totalResult, byTypeResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(auditTrail),
      db
        .select({
          eventType: auditTrail.eventType,
          count: sql<number>`count(*)`,
        })
        .from(auditTrail)
        .groupBy(auditTrail.eventType)
        .orderBy(sql`count(*) DESC`)
        .limit(20),
    ]);

    return {
      totalEvents: Number(totalResult[0]?.count || 0),
      byType: Object.fromEntries(
        byTypeResult.map((r: any) => [r.eventType, Number(r.count)])
      ),
      integrityCheckable: true,
    };
  }
}

export const immutableAuditService = new ImmutableAuditService();
