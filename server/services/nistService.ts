import axios from 'axios';
import { db } from '../db';
import { regulatoryUpdates } from '../../shared/schema';
import crypto from 'crypto';

/**
 * NIST Publications API
 * 6000+ Cybersecurity Standards (SP 800 series)
 * Free API: Unlimited requests
 */
export class NISTService {
  private static readonly API_BASE = 'https://csrc.nist.gov/publications/api/publications';
  private static readonly BATCH_SIZE = 100;

  /**
   * Fetch NIST publications
   */
  static async fetchPublications(
    pageNum: number = 1,
    pageSize: number = 100,
    searchText: string = 'cybersecurity'
  ): Promise<{ publications: any[]; totalItems: number }> {
    try {
      const response = await axios.get(this.API_BASE, {
        params: {
          pageNum,
          pageSize,
          searchText,
        },
        timeout: 30000,
      });

      const publications = response.data?.publications || [];
      const totalItems = response.data?.totalItems || 0;

      console.log(`[NIST] Fetched ${publications.length} publications (total: ${totalItems})`);

      return { publications, totalItems };
    } catch (error) {
      console.error('[NIST] Fetch error:', error);
      throw error;
    }
  }

  /**
   * Convert NIST publication to update
   */
  private static convertToUpdate(pub: any, tenantId: string = 'default') {
    const title = pub?.title || 'Unknown Standard';
    const hashedTitle = this.hashTitle(title);

    const pubDate = pub?.pubDate || new Date();
    const pubSeries = pub?.seriesTitle || 'NIST SP';
    const volNum = pub?.volNum || '';
    const issNum = pub?.issNum || '';
    const standardCode = `${pubSeries} ${volNum || issNum || ''}`.trim();

    const abstract = pub?.abstract || pub?.keywords?.join('; ') || 'Not available';
    const authors = pub?.authors?.map((a: any) => a?.name || a).join('; ') || 'NIST';

    return {
      tenantId,
      title,
      category: 'standard' as const,
      content: this.buildStandardContent(title, abstract, authors, standardCode),
      source: 'NIST',
      sourceUrl: pub?.pubLink || `https://csrc.nist.gov/publications/detail/${pub?.pubId || ''}`,
      date: new Date(pubDate),
      status: 'published' as const,
      jurisdiction: 'USA',
      confidenceScore: 0.99,
      hashedTitle,
      metadata: {
        standard_code: standardCode,
        standard_type: 'NIST SP',
        organization: 'NIST',
        publication_date: pubDate,
        authors,
        keywords: pub?.keywords || [],
      },
    };
  }

  /**
   * Build content
   */
  private static buildStandardContent(
    title: string,
    abstract: string,
    authors: string,
    code: string
  ): string {
    return `
Standard: ${code}
Title: ${title}

Authors: ${authors}

Abstract:
${abstract}
    `.trim();
  }

  /**
   * Hash title
   */
  private static hashTitle(title: string): string {
    return crypto
      .createHash('sha256')
      .update(title.toLowerCase().trim())
      .digest('hex')
      .slice(0, 32);
  }

  /**
   * Batch sync standards
   */
  static async syncStandards(
    searchText: string = 'cybersecurity',
    maxPages: number = 50,
    tenantId: string = 'default'
  ): Promise<{ synced: number; skipped: number; errors: number }> {
    let synced = 0;
    let skipped = 0;
    let errors = 0;

    try {
      console.log(`[NIST] Starting sync with search: ${searchText}`);

      for (let page = 1; page <= maxPages; page++) {
        try {
          const { publications, totalItems } = await this.fetchPublications(
            page,
            this.BATCH_SIZE,
            searchText
          );

          if (publications.length === 0) {
            console.log(`[NIST] Reached end at page ${page}`);
            break;
          }

          for (const pub of publications) {
            try {
              const updateData = this.convertToUpdate(pub, tenantId);

              // Check if exists
              const existing = await db.query.regulatoryUpdates.findFirst({
                where: (t, { eq, and }) =>
                  and(
                    eq(t.tenantId, tenantId),
                    eq(t.hashedTitle, updateData.hashedTitle)
                  ),
              });

              if (existing) {
                skipped++;
                continue;
              }

              // Insert
              await db.insert(regulatoryUpdates).values(updateData);
              synced++;

              if (synced % 50 === 0) {
                console.log(`[NIST] Progress: ${synced} synced, ${skipped} skipped`);
              }
            } catch (err) {
              console.error(`[NIST] Error processing publication:`, err);
              errors++;
            }
          }

          console.log(`[NIST] Page ${page}/${maxPages} - ${synced} synced`);

          // Rate limiting
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (err) {
          console.error(`[NIST] Error on page ${page}:`, err);
          errors++;
        }
      }

      console.log(`[NIST] Sync complete: ${synced} synced, ${skipped} skipped, ${errors} errors`);
      return { synced, skipped, errors };
    } catch (error) {
      console.error('[NIST] Fatal error:', error);
      throw error;
    }
  }

  /**
   * Get NIST standards statistics with series breakdown
   */
  static async getStandardsStats(tenantId: string = 'default'): Promise<any> {
    const standards = await db.query.regulatoryUpdates.findMany({
      where: (t, { eq, and }) =>
        and(
          eq(t.tenantId, tenantId),
          eq(t.category, 'standard'),
          eq(t.source, 'NIST')
        ),
    });

    const bySeries: Record<string, number> = {};
    const byTopic: Record<string, number> = {};
    
    standards.forEach((standard) => {
      // Extract series (e.g., "SP 800-53" → "SP 800")
      const title = standard.title || '';
      const seriesMatch = title.match(/SP\s*(\d+)/);
      const series = seriesMatch ? `SP ${seriesMatch[1]}` : 'Other';
      bySeries[series] = (bySeries[series] || 0) + 1;
      
      // Group by topic
      const topic = standard.metadata?.topic || 'General';
      byTopic[topic] = (byTopic[topic] || 0) + 1;
    });

    // Standards updated in last 2 years considered "active"
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const active = standards.filter(
      (s) => s.date && new Date(s.date) > twoYearsAgo
    ).length;

    return {
      total: standards.length,
      active,
      source: 'NIST',
      category: 'Standards',
      bySeries,
      byTopic,
      lastUpdated: standards.length > 0 ? standards[standards.length - 1].date : null,
    };
  }
}

export default NISTService;
