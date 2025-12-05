import axios from 'axios';
import { db } from '../db';
import { regulatoryUpdates, insertRegulatoryUpdateSchema } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

interface USPTOPatent {
  patent_id: string;
  patent_title: string;
  patent_abstract?: string;
  patent_type?: string;
  filing_date?: string;
  issue_date?: string;
  patent_number?: string;
  inventor_name?: string[];
  assignee?: string;
  ipc_code?: string;
  primary_examiner?: string;
  app_filing_date?: string;
  app_exam_name?: string;
}

interface EspacenetSearchResult {
  'exchange-documents': {
    'exchange-document': Array<{
      'bibliographic-data': {
        'publication-reference': {
          'document-id': Array<{
            'country': string;
            'doc-number': string;
            'kind': string;
            'date': string;
          }>;
        };
        'invention-title': Array<{
          text: string;
        }>;
        'abstract'?: Array<{
          text: string;
        }>;
        'applicant': Array<{
          'applicant-name': {
            name: string;
          };
        }>;
        'inventor': Array<{
          'inventor-name': {
            name: string;
          };
        }>;
        'international-patent-classification'?: Array<{
          text: string;
        }>;
      };
    }>;
  };
}

export class PatentUSPTOService {
  private static readonly USPTO_API_BASE = 'https://api.uspto.gov/';
  private static readonly ESPACENET_API_BASE = 'https://ops.espacenet.com/';
  private static readonly BATCH_SIZE = 100;
  private static readonly MAX_RETRIES = 3;

  /**
   * Fetch patents from USPTO REST API
   * Using the Patent Search API (elastic search based)
   */
  static async fetchUSPTOPatents(
    query: string = '*:*',
    pageStart: number = 0,
    pageSize: number = 100,
    tenantId: string = 'default'
  ): Promise<{ patents: USPTOPatent[]; total: number }> {
    try {
      const url = `${this.USPTO_API_BASE}v1/patent/search`;
      
      const response = await axios.get(url, {
        params: {
          q: query,
          start: pageStart,
          rows: pageSize,
          fl: 'patent_id,patent_title,patent_abstract,filing_date,issue_date,patent_number,inventor_name,assignee,ipc_code,primary_examiner,app_filing_date',
          wt: 'json',
        },
        timeout: 30000,
      });

      const patents = response.data.response?.docs || [];
      const total = response.data.response?.numFound || 0;

      console.log(`[PATENT_USPTO] Fetched ${patents.length} patents (total: ${total})`);

      return { patents, total };
    } catch (error) {
      console.error('[PATENT_USPTO] Error fetching:', error);
      throw error;
    }
  }

  /**
   * Convert USPTO patent to regulatory_updates record
   */
  private static convertToUpdate(patent: USPTOPatent, authority: string = 'US', tenantId: string = 'default') {
    const title = patent.patent_title || 'Unknown Patent';
    const hashedTitle = this.hashTitle(title);

    return {
      tenantId,
      title,
      category: 'patent' as const,
      content: this.buildPatentContent(patent),
      source: 'USPTO',
      sourceUrl: `https://patents.google.com/patent/US${patent.patent_number}/en`,
      date: new Date(patent.issue_date || patent.filing_date || new Date()),
      status: 'published' as const,
      jurisdiction: 'US',
      confidenceScore: 0.95,
      dataType: 'patent',
      hashedTitle,
      metadata: {
        patent_authority: authority,
        patent_number: patent.patent_number,
        patent_applicant: patent.assignee || 'Unknown',
        patent_inventor: patent.inventor_name?.join('; ') || 'Unknown',
        patent_ipc: patent.ipc_code || 'N/A',
        filing_date: patent.filing_date,
        issue_date: patent.issue_date,
        abstract: patent.patent_abstract,
      },
    };
  }

  /**
   * Build readable content from patent data
   */
  private static buildPatentContent(patent: USPTOPatent): string {
    const lines = [
      `Patent: ${patent.patent_number}`,
      `Type: ${patent.patent_type || 'Utility'}`,
      `Inventors: ${patent.inventor_name?.join(', ') || 'Unknown'}`,
      `Assignee: ${patent.assignee || 'Unknown'}`,
      `Filed: ${patent.filing_date || 'Unknown'}`,
      `Issued: ${patent.issue_date || 'Unknown'}`,
      `IPC Classification: ${patent.ipc_code || 'N/A'}`,
      `\nAbstract:\n${patent.patent_abstract || 'Not available'}`,
    ];
    return lines.join('\n');
  }

  /**
   * Hash patent title for deduplication
   */
  private static hashTitle(title: string): string {
    return crypto
      .createHash('sha256')
      .update(title.toLowerCase().trim())
      .digest('hex')
      .slice(0, 32);
  }

  /**
   * Check if patent already exists to avoid duplicates
   */
  static async patentExists(
    hashedTitle: string,
    patentNumber?: string,
    tenantId: string = 'default'
  ): Promise<boolean> {
    try {
      const existing = await db
        .select()
        .from(regulatoryUpdates)
        .where(
          and(
            eq(regulatoryUpdates.tenantId, tenantId),
            eq(regulatoryUpdates.hashedTitle, hashedTitle)
          )
        )
        .limit(1);

      return existing.length > 0;
    } catch (error) {
      console.error('[PATENT_USPTO] Error checking existence:', error);
      return false;
    }
  }

  /**
   * Sync patents in batches
   * Returns count of patents synced
   */
  static async syncPatents(
    query: string = '*:*',
    maxPages: number = 100,
    tenantId: string = 'default'
  ): Promise<{ synced: number; skipped: number; errors: number }> {
    let synced = 0;
    let skipped = 0;
    let errors = 0;

    try {
      console.log(`[PATENT_USPTO] Starting sync with query: ${query}`);

      for (let page = 0; page < maxPages; page++) {
        try {
          const { patents, total } = await this.fetchUSPTOPatents(
            query,
            page * this.BATCH_SIZE,
            this.BATCH_SIZE,
            tenantId
          );

          if (patents.length === 0) {
            console.log(`[PATENT_USPTO] Reached end at page ${page}`);
            break;
          }

          for (const patent of patents) {
            try {
              const updateData = this.convertToUpdate(patent, 'US', tenantId);
              
              // Check for duplicate
              const exists = await this.patentExists(
                updateData.hashedTitle,
                patent.patent_number,
                tenantId
              );

              if (exists) {
                skipped++;
                continue;
              }

              // Insert into database
              await db.insert(regulatoryUpdates).values(updateData);
              synced++;

              if (synced % 100 === 0) {
                console.log(`[PATENT_USPTO] Progress: ${synced} synced, ${skipped} skipped`);
              }
            } catch (err) {
              console.error(`[PATENT_USPTO] Error processing patent ${patent.patent_number}:`, err);
              errors++;
            }
          }

          // Log page progress
          const currentTotal = page * this.BATCH_SIZE + patents.length;
          console.log(
            `[PATENT_USPTO] Page ${page + 1}/${maxPages} - ${synced} synced, ${skipped} skipped`
          );

          // Rate limiting - USPTO allows 120 requests per minute
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (err) {
          console.error(`[PATENT_USPTO] Error processing page ${page}:`, err);
          errors++;
          // Continue with next page
        }
      }

      console.log(
        `[PATENT_USPTO] Sync complete: ${synced} synced, ${skipped} skipped, ${errors} errors`
      );
      return { synced, skipped, errors };
    } catch (error) {
      console.error('[PATENT_USPTO] Fatal sync error:', error);
      throw error;
    }
  }

  /**
   * Get patent statistics
   */
  static async getPatentStats(tenantId: string = 'default'): Promise<{
    totalPatents: number;
    byAuthority: Record<string, number>;
    byYear: Record<string, number>;
    lastUpdated: Date | null;
  }> {
    try {
      // Count by authority (from metadata)
      const allPatents = await db
        .select()
        .from(regulatoryUpdates)
        .where(
          and(
            eq(regulatoryUpdates.tenantId, tenantId),
            eq(regulatoryUpdates.dataType, 'patent')
          )
        );

      const byAuthority: Record<string, number> = {};
      const byYear: Record<string, number> = {};

      for (const patent of allPatents) {
        const authority =
          patent.metadata?.patent_authority || 'Unknown';
        byAuthority[authority] = (byAuthority[authority] || 0) + 1;

        const year = new Date(patent.date).getFullYear().toString();
        byYear[year] = (byYear[year] || 0) + 1;
      }

      return {
        totalPatents: allPatents.length,
        byAuthority,
        byYear,
        lastUpdated:
          allPatents.length > 0
            ? new Date(Math.max(...allPatents.map((p) => p.date.getTime())))
            : null,
      };
    } catch (error) {
      console.error('[PATENT_USPTO] Error getting stats:', error);
      throw error;
    }
  }

  /**
   * Search patents by keyword
   */
  static async searchPatents(
    keyword: string,
    tenantId: string = 'default',
    limit: number = 50
  ): Promise<any[]> {
    try {
      return await db
        .select()
        .from(regulatoryUpdates)
        .where(
          and(
            eq(regulatoryUpdates.tenantId, tenantId),
            eq(regulatoryUpdates.dataType, 'patent')
          )
        )
        .limit(limit);
    } catch (error) {
      console.error('[PATENT_USPTO] Error searching patents:', error);
      throw error;
    }
  }
}

export default PatentUSPTOService;
