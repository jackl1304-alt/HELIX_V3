/**
 * FDA Dockets Service
 * Ruft laufende Zulassungsprozesse von Regulations.gov ab
 * Regulations.gov enthält FDA Dockets mit Proposed Rules, Comments und laufenden Prozessen
 */
import { storage } from '../storage.js';
import fetch from 'node-fetch';

interface RegulationsGovDocket {
  attributes: {
    docketId: string;
    title: string;
    agencyId: string;
    documentType: string;
    postedDate: string;
    commentStartDate?: string;
    commentEndDate?: string;
    openForComment: boolean;
    documentCount: number;
  };
}

interface RegulationsGovDocument {
  attributes: {
    documentId: string;
    title: string;
    documentType: string;
    postedDate: string;
    agencyId: string;
    docketId: string;
    commentStartDate?: string;
    commentEndDate?: string;
    openForComment: boolean;
  };
}

export class FDADocketsService {
  private baseUrl = 'https://api.regulations.gov/v4';
  private apiKey = process.env.REGULATIONS_GOV_API_KEY || '';
  private rateLimitDelay = 500; // Regulations.gov hat Rate Limits

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Sucht nach FDA Dockets für Medical Devices
   */
  async fetchFDADockets(limit: number = 50): Promise<RegulationsGovDocket[]> {
    try {
      // Suche nach FDA Dockets mit Medical Device Bezug
      const url = `${this.baseUrl}/dockets?filter[agencyId]=FDA&filter[searchTerm]=medical+device&page[size]=${limit}&sort=-postedDate`;
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }

      await this.delay(this.rateLimitDelay);
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        console.warn(`[FDA Dockets] API Error: ${response.status} ${response.statusText}`);
        return [];
      }

      const json: any = await response.json();
      const dockets: RegulationsGovDocket[] = json.data || [];
      
      console.log(`[FDA Dockets] Found ${dockets.length} dockets`);
      return dockets;
    } catch (error) {
      console.error('[FDA Dockets] Error fetching dockets:', error);
      return [];
    }
  }

  /**
   * Holt Dokumente für einen spezifischen Docket
   */
  async fetchDocketDocuments(docketId: string): Promise<RegulationsGovDocument[]> {
    try {
      const url = `${this.baseUrl}/documents?filter[docketId]=${docketId}&page[size]=100&sort=-postedDate`;
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }

      await this.delay(this.rateLimitDelay);
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        console.warn(`[FDA Dockets] Error fetching documents for ${docketId}: ${response.status}`);
        return [];
      }

      const json: any = await response.json();
      const documents: RegulationsGovDocument[] = json.data || [];
      
      return documents;
    } catch (error) {
      console.error(`[FDA Dockets] Error fetching documents for ${docketId}:`, error);
      return [];
    }
  }

  /**
   * Importiert laufende FDA Dockets als regulatory updates
   */
  async importOngoingApprovals(): Promise<number> {
    let imported = 0;
    
    try {
      const dockets = await this.fetchFDADockets(100);
      
      for (const docket of dockets) {
        try {
          // Nur Dockets die noch offen sind oder kürzlich gepostet wurden
          const postedDate = new Date(docket.attributes.postedDate);
          const isRecent = postedDate > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // Letztes Jahr
          const isOpen = docket.attributes.openForComment || false;
          
          if (!isRecent && !isOpen) {
            continue; // Überspringe alte, geschlossene Dockets
          }

          // Prüfe ob bereits vorhanden
          const sourceUrl = `https://www.regulations.gov/docket/${docket.attributes.docketId}`;
          const { sql } = await import('../storage.js');
          const existing = await sql`
            SELECT id FROM regulatory_updates 
            WHERE source_url = ${sourceUrl} OR document_id = ${docket.attributes.docketId}
            LIMIT 1
          `;
          
          if (existing.length > 0) {
            continue; // Bereits vorhanden
          }

          // Bestimme approval_status
          let approvalStatus = 'pending';
          if (isOpen && docket.attributes.commentEndDate) {
            const commentEnd = new Date(docket.attributes.commentEndDate);
            if (commentEnd > new Date()) {
              approvalStatus = 'in_review'; // Noch offen für Kommentare
            }
          }

          // Erstelle regulatory update
          await storage.createRegulatoryUpdate({
            title: `FDA Docket: ${docket.attributes.title}`,
            description: `FDA Docket für Medical Devices - ${docket.attributes.documentType}`,
            type: 'approval',
            category: 'fda_docket',
            jurisdiction: 'US',
            publishedDate: postedDate,
            submissionDate: docket.attributes.commentStartDate ? new Date(docket.attributes.commentStartDate) : postedDate,
            expectedDecisionDate: docket.attributes.commentEndDate ? new Date(docket.attributes.commentEndDate) : null,
            approvalStatus: approvalStatus,
            sourceUrl: `https://www.regulations.gov/docket/${docket.attributes.docketId}`,
            documentId: docket.attributes.docketId,
            priority: 2,
            riskLevel: 'medium',
            actionRequired: false,
            actionType: 'monitoring',
            authorityVerified: true,
            metadata: {
              docketId: docket.attributes.docketId,
              agencyId: docket.attributes.agencyId,
              documentType: docket.attributes.documentType,
              documentCount: docket.attributes.documentCount,
              openForComment: docket.attributes.openForComment,
              commentStartDate: docket.attributes.commentStartDate,
              commentEndDate: docket.attributes.commentEndDate,
            },
            tags: ['fda', 'docket', 'medical-device'],
          });

          imported++;
          console.log(`[FDA Dockets] Imported: ${docket.attributes.docketId}`);
        } catch (error) {
          console.error(`[FDA Dockets] Error processing docket ${docket.attributes.docketId}:`, error);
        }
      }
    } catch (error) {
      console.error('[FDA Dockets] Error in importOngoingApprovals:', error);
    }

    return imported;
  }
}
