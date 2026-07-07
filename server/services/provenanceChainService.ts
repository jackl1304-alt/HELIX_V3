import { db } from "../db.js";
import { provenanceChainItems, type InsertProvenanceChainItem, type ProvenanceChainItem } from "../../shared/schema.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { Logger } from "./logger.service.js";
import { createHash } from "node:crypto";

const logger = new Logger("ProvenanceChain");

export class ProvenanceChainService {
  /**
   * Compute SHA256 hash of content
   */
  private hash(content: string): string {
    return createHash("sha256").update(content).digest("hex");
  }

  /**
   * Create a new chain item, computing contentHash and chainHash
   */
  async createChainItem(input: {
    chainId: string;
    linkIndex: number;
    linkType: "ingestion" | "extraction" | "claim" | "verification" | "output";
    sourceId?: string;
    regulatoryUpdateId?: string;
    claimId?: string;
    verificationId?: string;
    outputId?: string;
    generator: string;
    generatorVersion?: string;
    contentPayload: string; // raw content to hash
    tenantId?: string;
  }): Promise<ProvenanceChainItem> {
    // Get previous hash
    const prevItems = await db
      .select()
      .from(provenanceChainItems)
      .where(and(
        eq(provenanceChainItems.chainId, input.chainId),
        eq(provenanceChainItems.linkIndex, input.linkIndex - 1),
      ))
      .limit(1);

    const previousHash = prevItems.length > 0 ? prevItems[0].chainHash : null;

    // Compute content hash
    const contentHash = this.hash(input.contentPayload);

    // Compute chain hash: SHA256(previousHash + contentHash + timestamp)
    const chainHash = this.hash(
      (previousHash || "") + contentHash + new Date().toISOString()
    );

    const [item] = await db
      .insert(provenanceChainItems)
      .values({
        chainId: input.chainId,
        linkIndex: input.linkIndex,
        linkType: input.linkType,
        previousHash,
        contentHash,
        chainHash,
        sourceId: input.sourceId,
        regulatoryUpdateId: input.regulatoryUpdateId,
        claimId: input.claimId,
        verificationId: input.verificationId,
        outputId: input.outputId,
        generator: input.generator,
        generatorVersion: input.generatorVersion,
        tenantId: input.tenantId,
        // Store the original content payload for validation
        contentPayload: input.contentPayload,
      })
      .returning();

    return item;
  }

  /**
   * Validate an entire chain – verify all hashes
   */
  async validateChain(chainId: string): Promise<{
    isValid: boolean;
    items: Array<{
      linkIndex: number;
      linkType: string;
      hashIntegrity: boolean;
      chainIntegrity: boolean;
      linkIntegrity: boolean;
      generator: string;
    }>;
  }> {
    const chain = await db
      .select()
      .from(provenanceChainItems)
      .where(eq(provenanceChainItems.chainId, chainId))
      .orderBy(provenanceChainItems.linkIndex);

    const results = [];
    let isChainValid = true;

    for (let i = 0; i < chain.length; i++) {
      const item = chain[i];
      const prev = i > 0 ? chain[i - 1] : null;

      // Recompute content hash from the stored contentPayload
      // If contentPayload is not available, reconstruct from chain metadata as fallback
      let rehashedContent: string;
      if (item.contentPayload) {
        rehashedContent = this.hash(item.contentPayload);
      } else {
        // Fallback: hash from entity references (legacy items without payload)
        rehashedContent = this.hash(
          `${item.chainId}:${item.linkIndex}:${item.linkType}:${item.regulatoryUpdateId || item.claimId || item.verificationId || item.outputId || ""}`
        );
      }
      const hashIntegrity = rehashedContent === item.contentHash;

      // Recompute chain hash
      const rehashedChain = this.hash(
        (item.previousHash || "") + item.contentHash + item.createdAt.toISOString()
      );
      const chainIntegrity = rehashedChain === item.chainHash;

      // Check link to previous
      const linkIntegrity = !prev || item.previousHash === prev.chainHash;

      if (!hashIntegrity || !chainIntegrity || !linkIntegrity) {
        isChainValid = false;
        // Update validity in DB
        await db
          .update(provenanceChainItems)
          .set({ isValid: false, validatedAt: new Date() })
          .where(eq(provenanceChainItems.id, item.id));
      }

      results.push({
        linkIndex: item.linkIndex,
        linkType: item.linkType,
        hashIntegrity,
        chainIntegrity,
        linkIntegrity,
        generator: item.generator,
      });
    }

    // If valid, mark all
    if (isChainValid) {
      await db
        .update(provenanceChainItems)
        .set({ isValid: true, validatedAt: new Date() })
        .where(eq(provenanceChainItems.chainId, chainId));
    }

    return { isValid: isChainValid, items: results };
  }

  /**
   * Get full chain by ID
   */
  async getChain(chainId: string): Promise<ProvenanceChainItem[]> {
    return db
      .select()
      .from(provenanceChainItems)
      .where(eq(provenanceChainItems.chainId, chainId))
      .orderBy(provenanceChainItems.linkIndex);
  }

  /**
   * Get chain by output ID
   */
  async getChainByOutput(outputId: string): Promise<ProvenanceChainItem[]> {
    return db
      .select()
      .from(provenanceChainItems)
      .where(eq(provenanceChainItems.outputId, outputId))
      .orderBy(provenanceChainItems.linkIndex);
  }
}

export const provenanceChainService = new ProvenanceChainService();
