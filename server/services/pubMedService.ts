import axios from 'axios';
import { db } from '../db';
import { regulatoryUpdates } from '../../shared/schema';
import crypto from 'crypto';

/**
 * PubMed Central API Integration
 * 35 Million+ Research Papers
 * Free API: Unlimited requests
 */
export class PubMedService {
  private static readonly ESEARCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
  private static readonly EFETCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';
  private static readonly BATCH_SIZE = 100;
  private static readonly EMAIL = 'research@helix.local'; // Required by NCBI

  /**
   * Search PubMed
   */
  static async searchPubMed(
    query: string = 'medical device',
    retStart: number = 0,
    retMax: number = 100
  ): Promise<{ pmids: string[]; total: number }> {
    try {
      const response = await axios.get(this.ESEARCH_URL, {
        params: {
          db: 'pmc',
          term: query,
          rettype: 'json',
          retmode: 'json',
          retstart: retStart,
          retmax: retMax,
          tool: 'helix_research',
          email: this.EMAIL,
        },
        timeout: 30000,
      });

      const pmids = response.data?.esearchresult?.idlist || [];
      const total = parseInt(response.data?.esearchresult?.count || '0');

      console.log(`[PUBMED] Found ${pmids.length} papers (total: ${total})`);

      return { pmids, total };
    } catch (error) {
      console.error('[PUBMED] Search error:', error);
      throw error;
    }
  }

  /**
   * Fetch paper details
   */
  static async fetchPaperDetails(pmids: string[]): Promise<any[]> {
    try {
      const response = await axios.get(this.EFETCH_URL, {
        params: {
          db: 'pmc',
          id: pmids.join(','),
          rettype: 'json',
          retmode: 'json',
          tool: 'helix_research',
          email: this.EMAIL,
        },
        timeout: 60000,
      });

      const articles = response.data?.result?.articles || [];
      return articles;
    } catch (error) {
      console.error('[PUBMED] Fetch error:', error);
      throw error;
    }
  }

  /**
   * Convert paper to update
   */
  private static convertToUpdate(paper: any, tenantId: string = 'default') {
    const title = paper?.title_display || paper?.title || 'Unknown Paper';
    const hashedTitle = this.hashTitle(title);

    const authors = paper?.author?.map((a: any) => a.name || a).join('; ') || 'Unknown';
    const abstract = paper?.abstract || paper?.summary || 'Not available';
    const pubDate = paper?.publication_date || paper?.pub_date || new Date();
    const journal = paper?.journal || paper?.source || 'Unknown Journal';
    const pmid = paper?.uid || 'Unknown';

    return {
      tenantId,
      title,
      category: 'knowledge' as const,
      content: this.buildPaperContent(title, authors, abstract, journal),
      source: 'PubMed Central',
      sourceUrl: `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${pmid}/`,
      date: new Date(pubDate),
      status: 'published' as const,
      jurisdiction: 'International',
      confidenceScore: 0.9,
      dataType: 'research_paper',
      hashedTitle,
      metadata: {
        pmid,
        authors,
        journal,
        publication_date: pubDate,
        paper_type: 'research',
      },
    };
  }

  /**
   * Build content
   */
  private static buildPaperContent(
    title: string,
    authors: string,
    abstract: string,
    journal: string
  ): string {
    return `
Title: ${title}

Journal: ${journal}
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
   * Batch sync papers
   */
  static async syncPapers(
    query: string = 'medical device regulatory approval',
    maxPages: number = 50,
    tenantId: string = 'default'
  ): Promise<{ synced: number; skipped: number; errors: number }> {
    let synced = 0;
    let skipped = 0;
    let errors = 0;

    try {
      console.log(`[PUBMED] Starting sync with query: ${query}`);

      for (let page = 0; page < maxPages; page++) {
        try {
          const { pmids, total } = await this.searchPubMed(
            query,
            page * this.BATCH_SIZE,
            this.BATCH_SIZE
          );

          if (pmids.length === 0) {
            console.log(`[PUBMED] Reached end at page ${page}`);
            break;
          }

          // Fetch details for this batch
          const papers = await this.fetchPaperDetails(pmids);

          for (const paper of papers) {
            try {
              const updateData = this.convertToUpdate(paper, tenantId);

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

              if (synced % 100 === 0) {
                console.log(`[PUBMED] Progress: ${synced} synced, ${skipped} skipped`);
              }
            } catch (err) {
              console.error(`[PUBMED] Error processing paper:`, err);
              errors++;
            }
          }

          console.log(`[PUBMED] Page ${page + 1}/${maxPages} - ${synced} synced`);

          // NCBI requires 1/3 second between requests
          await new Promise((resolve) => setTimeout(resolve, 333));
        } catch (err) {
          console.error(`[PUBMED] Error on page ${page}:`, err);
          errors++;
        }
      }

      console.log(`[PUBMED] Sync complete: ${synced} synced, ${skipped} skipped, ${errors} errors`);
      return { synced, skipped, errors };
    } catch (error) {
      console.error('[PUBMED] Fatal error:', error);
      throw error;
    }
  }

  /**
   * Get stats
   */
  static async getStats(tenantId: string = 'default'): Promise<any> {
    const papers = await db.query.regulatoryUpdates.findMany({
      where: (t, { eq, and }) =>
        and(
          eq(t.tenantId, tenantId),
          eq(t.dataType, 'research_paper')
        ),
    });

    return {
      total: papers.length,
      source: 'PubMed Central',
      lastUpdated: papers.length > 0 ? papers[papers.length - 1].date : null,
    };
  }
}

export default PubMedService;
