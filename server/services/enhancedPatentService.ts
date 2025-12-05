/**
 * ENHANCED PATENT SERVICE - Multi-Source Global Integration
 * Nutzt die besten verfügbaren APIs: Google Patents, PatentsView, USPTO Bulk, WIPO
 */

import axios from 'axios';
import { storage } from '../storage.js';
import { Logger } from './logger.service.js';

const logger = new Logger('EnhancedPatentService');

interface PatentRecord {
  publicationNumber: string;
  title: string;
  abstract?: string;
  applicant?: string;
  inventors: string[];
  publicationDate?: Date;
  filingDate?: Date;
  status?: string;
  jurisdiction?: string;
  ipcCodes?: string[];
  cpcCodes?: string[];
  forwardCitations?: number;
  backwardCitations?: number;
  documentUrl?: string;
  source?: string;
  assignee?: string;
  claims?: number;
}

class EnhancedPatentService {
  private readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) HelixPatentBot/1.0';
  private readonly REQUEST_DELAY = 1500;

  // ============================================================================
  // 1. PATENTSVIEW (NIH-FINANZIERT, RELIABLE)
  // ============================================================================
  async collectFromPatentsView(limit: number = 100): Promise<PatentRecord[]> {
    logger.info(`PatentsView: Collecting patents (limit: ${limit})...`);
    const patents: PatentRecord[] = [];

    const searchTerms = [
      'medical',
      'device',
      'pharmaceutical',
      'diagnostic',
      'implant',
      'prosthetic'
    ];

    for (const term of searchTerms) {
      try {
        const response = await axios.get('https://patentsview.org/api/patents/query', {
          params: {
            q: JSON.stringify({
              patent_title: { contains: term },
              patent_type: 'utility'
            }),
            f: ['patent_num', 'patent_title', 'patent_abstract', 'patent_date', 'patent_type', 'assignee_organization', 'inventor_first_name', 'inventor_last_name'],
            o: JSON.stringify({ per_page: Math.min(limit / searchTerms.length, 50) })
          },
          timeout: 15000
        });

        if (response.data?.patents) {
          for (const p of response.data.patents) {
            patents.push({
              publicationNumber: `US${p.patent_num}`,
              title: p.patent_title || 'Unknown',
              abstract: p.patent_abstract || undefined,
              publicationDate: p.patent_date ? new Date(p.patent_date) : undefined,
              status: 'granted',
              jurisdiction: 'US',
              applicant: p.assignee_organization || 'Unknown',
              inventors: [
                ...(p.inventor_first_name ? [p.inventor_first_name] : []),
                ...(p.inventor_last_name ? [p.inventor_last_name] : [])
              ],
              documentUrl: `https://patents.google.com/patent/US${p.patent_num}`,
              source: 'PatentsView (NIH)',
              forwardCitations: 0,
              backwardCitations: 0
            });
          }
        }

        await this.delay(this.REQUEST_DELAY);
      } catch (error: any) {
        logger.warn(`PatentsView search failed for term "${term}":`, error.message);
      }
    }

    // Deduplicate
    const unique = Array.from(new Map(
      patents.map(p => [p.publicationNumber, p])
    ).values());

    logger.info(`PatentsView: Collected ${unique.length} patents`);
    return unique;
  }

  // ============================================================================
  // 2. GOOGLE PATENTS (Via HTTP Scraping - Kostenlos)
  // ============================================================================
  async collectFromGooglePatents(limit: number = 50): Promise<PatentRecord[]> {
    logger.info(`Google Patents: Collecting patents (limit: ${limit})...`);
    const patents: PatentRecord[] = [];

    const queries = [
      'medical device FDA 510k',
      'diagnostic medical device',
      'implant prosthetic',
      'pharmaceutical drug',
      'surgical instrument'
    ];

    for (const query of queries) {
      try {
        // Konstruiere Google Patents Search URL
        const searchUrl = `https://patents.google.com/`;
        
        // Note: Google Patents hat kein offenes API
        // Alternative: Nutze Google Patents Search API über Custom Search oder scrape
        logger.info(`Google Patents: Query "${query}" would require scraping or custom API`);
        
      } catch (error: any) {
        logger.warn(`Google Patents search failed:`, error.message);
      }
    }

    logger.info(`Google Patents: Collected ${patents.length} patents`);
    return patents;
  }

  // ============================================================================
  // 3. WIPO PATENTSCOPE (International PCT)
  // ============================================================================
  async collectFromWIPO(limit: number = 50): Promise<PatentRecord[]> {
    logger.info(`WIPO PatentScope: Collecting international patents (limit: ${limit})...`);
    const patents: PatentRecord[] = [];

    try {
      const response = await axios.get('https://patentscope.wipo.int/search/en/result.json', {
        params: {
          query: 'medical device',
          resultSize: Math.min(limit, 50),
          sortKey: 'Relevance'
        },
        timeout: 15000
      });

      if (response.data?.results) {
        for (const result of response.data.results) {
          patents.push({
            publicationNumber: result.publicationNumber || result.pctNumber,
            title: result.title || 'Unknown',
            abstract: result.abstract || undefined,
            publicationDate: result.publicationDate ? new Date(result.publicationDate) : undefined,
            filingDate: result.filingDate ? new Date(result.filingDate) : undefined,
            status: result.status || 'pending',
            jurisdiction: 'WO', // WIPO/PCT
            applicant: result.applicant?.[0]?.name || 'Unknown',
            inventors: result.inventor?.map((i: any) => i.name) || [],
            documentUrl: `https://patentscope.wipo.int/search/en/detail.jsf?docId=${result.id}`,
            source: 'WIPO PatentScope',
            ipcCodes: result.ipcCodes || [],
            forwardCitations: 0,
            backwardCitations: 0
          });
        }
      }
    } catch (error: any) {
      logger.warn('WIPO PatentScope collection failed:', error.message);
    }

    logger.info(`WIPO PatentScope: Collected ${patents.length} patents`);
    return patents;
  }

  // ============================================================================
  // 4. USPTO BULK DATA (Vollständige XML-Dumps)
  // ============================================================================
  async collectFromUSPTOBulk(limit: number = 100): Promise<PatentRecord[]> {
    logger.info(`USPTO Bulk: Parsing FTP data (limit: ${limit})...`);
    
    // Note: Real implementation würde FTP-Download durchführen
    // Hier ein Platzhalter für die Struktur
    
    const patents: PatentRecord[] = [];
    logger.info('USPTO Bulk: FTP-Download würde hier stattfinden');
    logger.info('URL: ftp://ftp.uspto.gov/pub/patft');
    
    return patents;
  }

  // ============================================================================
  // 5. LENS.org (AI-POWERED, Freemium)
  // ============================================================================
  async collectFromLens(limit: number = 50): Promise<PatentRecord[]> {
    logger.info(`Lens.org: Collecting patents (limit: ${limit})...`);
    const patents: PatentRecord[] = [];

    const apiKey = process.env.LENS_API_TOKEN;
    if (!apiKey) {
      logger.info('Lens.org: API key not configured (LENS_API_TOKEN), skipping');
      return [];
    }

    try {
      const response = await axios.post('https://api.lens.org/patent/search', {
        query: {
          terms: [
            { field: 'title_abstract', include: ['medical', 'device'] }
          ]
        },
        limit: Math.min(limit, 100)
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': this.USER_AGENT
        },
        timeout: 15000
      });

      if (response.data?.data) {
        for (const patent of response.data.data) {
          patents.push({
            publicationNumber: patent.lens_id || patent.publication_number,
            title: patent.title || 'Unknown',
            abstract: patent.abstract || undefined,
            publicationDate: patent.publication_date ? new Date(patent.publication_date) : undefined,
            filingDate: patent.filing_date ? new Date(patent.filing_date) : undefined,
            status: patent.legal_status || 'unknown',
            jurisdiction: patent.jurisdiction || 'Unknown',
            applicant: patent.applicant?.[0]?.name || 'Unknown',
            inventors: patent.inventor?.map((i: any) => i.name || i) || [],
            documentUrl: `https://www.lens.org/patents/${patent.lens_id}`,
            source: 'Lens.org',
            ipcCodes: patent.ipc_classifications || [],
            cpcCodes: patent.cpc_classifications || [],
            forwardCitations: patent.forward_citations_count || 0,
            backwardCitations: patent.backward_citations_count || 0
          });
        }
      }
    } catch (error: any) {
      logger.warn('Lens.org collection failed:', error.message);
    }

    logger.info(`Lens.org: Collected ${patents.length} patents`);
    return patents;
  }

  // ============================================================================
  // 6. LAUFENDE PATENTE - MONITORING SERVICE
  // ============================================================================
  async monitorOngoingPatents(): Promise<{
    newApplications: number;
    publishedApplications: number;
    grants: number;
    abandonments: number;
    lastUpdate: Date;
  }> {
    logger.info('Monitoring ongoing patent applications...');

    const monitoring = {
      newApplications: 0,
      publishedApplications: 0,
      grants: 0,
      abandonments: 0,
      lastUpdate: new Date()
    };

    // USPTO TSDR - Real-time application status
    try {
      logger.info('Checking USPTO TSDR for application status updates...');
      // Implementation würde TSDR scraping durchführen
    } catch (error) {
      logger.warn('USPTO TSDR monitoring failed');
    }

    // PatentScope Alerts
    try {
      logger.info('Checking WIPO PatentScope alerts...');
      // Implementation würde PatentScope Alerts abrufen
    } catch (error) {
      logger.warn('WIPO PatentScope alerts failed');
    }

    return monitoring;
  }

  // ============================================================================
  // 7. MAIN SYNC FUNCTION
  // ============================================================================
  async syncAllGlobalPatents(): Promise<{
    totalFound: number;
    totalStored: number;
    errors: string[];
    sources: { name: string; count: number }[];
  }> {
    logger.info('Starting global patent sync...');
    const startTime = Date.now();

    const stats = {
      totalFound: 0,
      totalStored: 0,
      errors: [] as string[],
      sources: [] as { name: string; count: number }[]
    };

    // Collect from all sources
    const sources = [
      { name: 'PatentsView (NIH)', fn: () => this.collectFromPatentsView(150) },
      { name: 'Google Patents', fn: () => this.collectFromGooglePatents(100) },
      { name: 'WIPO PatentScope', fn: () => this.collectFromWIPO(100) },
      { name: 'USPTO Bulk', fn: () => this.collectFromUSPTOBulk(100) },
      { name: 'Lens.org', fn: () => this.collectFromLens(100) }
    ];

    const allPatents: PatentRecord[] = [];

    for (const source of sources) {
      try {
        logger.info(`Collecting from ${source.name}...`);
        const patents = await source.fn();
        allPatents.push(...patents);
        stats.sources.push({ name: source.name, count: patents.length });
        stats.totalFound += patents.length;
      } catch (error: any) {
        const errorMsg = `${source.name} failed: ${error.message}`;
        stats.errors.push(errorMsg);
        logger.error(errorMsg);
      }
    }

    // Deduplicate by publication number
    const unique = Array.from(new Map(
      allPatents.map(p => [p.publicationNumber, p])
    ).values());

    logger.info(`Total unique patents: ${unique.length}`);

    // Store in database
    for (const patent of unique) {
      try {
        await storage.createPatent({
          publicationNumber: patent.publicationNumber,
          title: patent.title,
          abstract: patent.abstract || null,
          applicant: patent.applicant || null,
          inventors: patent.inventors,
          publicationDate: patent.publicationDate || null,
          filingDate: patent.filingDate || null,
          status: patent.status || 'unknown',
          jurisdiction: patent.jurisdiction || 'Unknown',
          ipcCodes: patent.ipcCodes || [],
          cpcCodes: patent.cpcCodes || [],
          forwardCitations: patent.forwardCitations || 0,
          backwardCitations: patent.backwardCitations || 0,
          documentUrl: patent.documentUrl || null,
          source: patent.source || 'Unknown'
        });
        stats.totalStored++;
      } catch (error: any) {
        stats.errors.push(`Failed to store patent ${patent.publicationNumber}: ${error.message}`);
      }
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    logger.info(`Patent sync complete: ${stats.totalStored} patents stored in ${duration}s`);

    return stats;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export { EnhancedPatentService, PatentRecord };
export const enhancedPatentService = new EnhancedPatentService();
