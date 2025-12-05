/**
 * Enhanced FDA OpenAPI Service - Complete Data Extraction
 * Extracts ALL available fields from FDA APIs:
 * - 510(k) with full metadata
 * - PMA (Premarket Approvals)
 * - MAUDE (Adverse Events)
 * - Detailed Recalls with classification
 * - Device Registrations
 */

import { storage } from '../storage.js';

interface EnhancedFDA510k {
  k_number: string;
  device_name: string;
  applicant: string;
  contact?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  postal_code?: string;
  country_code?: string;
  date_received?: string;
  decision_date?: string;
  decision?: string;
  decision_code?: string;
  review_advisory_committee?: string;
  product_code?: string;
  regulation_number?: string;
  device_class?: string;
  clearance_type?: string;
  third_party_flag?: 'Y' | 'N';
  expedited_review_flag?: 'Y' | 'N';
  statement_or_summary?: string; // CRITICAL: Detailed technical description
  type?: string;
  openfda?: {
    device_name?: string[];
    medical_specialty_description?: string;
    regulation_number?: string;
    device_class?: string;
    fei_number?: string[]; // Manufacturing facility IDs
    registration_number?: string[];
  };
}

interface FDAPMA {
  pma_number?: string;
  supplement_number?: string;
  applicant?: string;
  trade_name?: string;
  generic_name?: string;
  product_code?: string;
  date_received?: string;
  decision_date?: string;
  decision?: string;
  advisory_committee?: string;
  ao_statement?: string; // Applicant's original statement
  supplement_reason?: string;
  openfda?: {
    device_name?: string[];
    medical_specialty_description?: string;
    device_class?: string;
    regulation_number?: string;
  };
}

interface FDAMAUDE {
  mdr_report_key?: string;
  event_key?: string;
  report_number?: string;
  report_source_code?: string;
  date_received?: string;
  date_of_event?: string;
  date_report?: string;
  event_location?: string;
  event_type?: string;
  device_date_of_manufacture?: string;
  device_operator?: string; // health_professional, lay_user, etc.
  device_problem_codes?: string[];
  patient_problems?: string[];
  event_description?: string;
  manufacturer_narrative?: string;
  manufacturer_name?: string;
  manufacturer_contact_city?: string;
  manufacturer_contact_state?: string;
  remedial_action?: string[];
  removal_correction_number?: string;
  device_report_product_code?: string;
  device_generic_name?: string;
  device_sequence_number?: string;
  brand_name?: string;
  model_number?: string;
  catalog_number?: string;
  openfda?: {
    device_name?: string[];
    device_class?: string;
    medical_specialty_description?: string;
    regulation_number?: string;
  };
}

interface FDARecall {
  recall_number?: string;
  reason_for_recall?: string;
  status?: string; // Ongoing, Completed, Terminated
  distribution_pattern?: string;
  product_description?: string;
  code_info?: string;
  product_quantity?: string;
  recall_initiation_date?: string;
  center_classification_date?: string;
  termination_date?: string;
  report_date?: string;
  classification?: 'Class I' | 'Class II' | 'Class III'; // CRITICAL
  product_type?: string;
  product_code?: string;
  event_id?: string;
  recalling_firm?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  voluntary_mandated?: 'Voluntary' | 'Mandated';
  initial_firm_notification?: string;
  res_event_number?: string;
  more_code_info?: string;
  openfda?: {
    device_name?: string[];
    device_class?: string;
    medical_specialty_description?: string;
    regulation_number?: string;
    fei_number?: string[];
    registration_number?: string[];
  };
}

export class EnhancedFDAService {
  private baseUrl = 'https://api.fda.gov';
  private apiKey = process.env.FDA_API_KEY || '';
  private rateLimitDelay = 250;
  private maxRetries = 3;
  private retryDelay = 2000;

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private parseFDADate(dateStr: string | undefined | null): Date | undefined {
    if (!dateStr) return undefined;
    
    try {
      // Handle YYYYMMDD format (e.g., "20251031")
      if (/^\d{8}$/.test(dateStr)) {
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6)) - 1; // JS months are 0-indexed
        const day = parseInt(dateStr.substring(6, 8));
        const date = new Date(year, month, day);
        
        // Validate the date is real
        if (isNaN(date.getTime())) return undefined;
        return date;
      }
      
      // Handle ISO format or other standard formats
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return undefined;
      return date;
    } catch {
      return undefined;
    }
  }

  private async makeRequest(endpoint: string, retryAttempt: number = 0): Promise<any> {
    try {
      const urlWithKey = this.apiKey ?
        `${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${this.apiKey}` :
        endpoint;

      console.log(`🔄 [Enhanced FDA] Requesting: ${endpoint.split('?')[0]} (attempt ${retryAttempt + 1})`);

      const response = await fetch(urlWithKey, {
        headers: {
          'User-Agent': 'Helix-Regulatory-Intelligence/3.0',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 429 && retryAttempt < this.maxRetries) {
          console.log(`⏱️ [Enhanced FDA] Rate limited, backing off...`);
          await this.delay(this.retryDelay * Math.pow(2, retryAttempt));
          return this.makeRequest(endpoint, retryAttempt + 1);
        }
        throw new Error(`FDA API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      await this.delay(this.rateLimitDelay);

      console.log(`✅ [Enhanced FDA] Success - ${data.results?.length || 0} items`);
      return data;
    } catch (error) {
      if (retryAttempt < this.maxRetries) {
        console.log(`🔄 [Enhanced FDA] Retry ${retryAttempt + 2}...`);
        await this.delay(this.retryDelay * Math.pow(2, retryAttempt));
        return this.makeRequest(endpoint, retryAttempt + 1);
      }
      console.error(`❌ [Enhanced FDA] Failed after ${retryAttempt + 1} attempts:`, error);
      throw error;
    }
  }

  /**
   * Collect 510(k) with ALL available fields
   */
  async collect510kComplete(limit: number = 100, sinceDate?: string): Promise<EnhancedFDA510k[]> {
    console.log(`[Enhanced FDA] Collecting COMPLETE 510(k) data (limit: ${limit})`);

    let endpoint = `${this.baseUrl}/device/510k.json?limit=${limit}&sort=decision_date:desc`;
    
    if (sinceDate) {
      endpoint += `&search=decision_date:[${sinceDate}+TO+NOW]`;
    }

    const data = await this.makeRequest(endpoint);

    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Invalid FDA 510k response');
    }

    console.log(`[Enhanced FDA] Processing ${data.results.length} 510(k) with full metadata`);

    for (const device of data.results as EnhancedFDA510k[]) {
      await this.process510kComplete(device);
    }

    return data.results as EnhancedFDA510k[];
  }

  private async process510kComplete(device: EnhancedFDA510k): Promise<void> {
    try {
      const title = `FDA 510(k): ${device.device_name || 'Unknown Device'}${device.k_number ? ` (${device.k_number})` : ''}`;

      // Extract manufacturing facility data
      const facilities = device.openfda?.fei_number?.join(', ') || 'N/A';
      const registrations = device.openfda?.registration_number?.join(', ') || 'N/A';

      // Enhanced description with ALL fields
      const description = `
**Device:** ${device.device_name}
**K-Number:** ${device.k_number}
**Applicant:** ${device.applicant || 'N/A'}
**Contact:** ${device.contact || 'N/A'}
**Address:** ${[device.address_1, device.address_2, device.city, device.state, device.zip_code, device.country_code].filter(Boolean).join(', ')}

**Decision:** ${device.decision || 'N/A'} (${device.decision_date || 'N/A'})
**Device Class:** ${device.device_class || device.openfda?.device_class || 'N/A'}
**Product Code:** ${device.product_code || 'N/A'}
**Regulation Number:** ${device.regulation_number || device.openfda?.regulation_number || 'N/A'}

**Review Details:**
- Advisory Committee: ${device.review_advisory_committee || 'N/A'}
- Third Party Review: ${device.third_party_flag === 'Y' ? 'Yes' : 'No'}
- Expedited Review: ${device.expedited_review_flag === 'Y' ? 'Yes ⚡' : 'No'}
- Clearance Type: ${device.clearance_type || 'N/A'}

**Manufacturing:**
- FEI Numbers: ${facilities}
- Registration Numbers: ${registrations}

**Medical Specialty:** ${device.openfda?.medical_specialty_description || 'N/A'}

**Statement/Summary:** ${device.statement_or_summary || 'No detailed statement available'}
      `.trim();

      await storage.createRegulatoryUpdate({
        title,
        description,
        sourceId: 'fda_510k_complete',
        sourceUrl: `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=${device.k_number}`,
        documentUrl: device.statement_or_summary ? `https://www.accessdata.fda.gov/cdrh_docs/pdf${device.k_number?.slice(1, 3)}/${device.k_number}.pdf` : undefined,
        region: 'US',
        jurisdiction: 'USA',
        updateType: 'approval' as const,
        category: 'medical_device_clearance',
        deviceType: device.device_name,
        priority: this.calculatePriority(device),
        riskLevel: this.calculateRiskLevel(device),
        fdaKNumber: device.k_number,
        fdaApplicant: device.applicant,
        fdaProductCode: device.product_code,
        fdaDeviceClass: device.device_class || device.openfda?.device_class,
        fdaRegulationNumber: device.regulation_number || device.openfda?.regulation_number,
        fdaDecisionDate: this.parseFDADate(device.decision_date) || undefined,
        fdaStatus: device.decision || 'Unknown',
        publishedDate: this.parseFDADate(device.decision_date) || new Date(),
        effectiveDate: this.parseFDADate(device.decision_date),
        actionRequired: device.expedited_review_flag === 'Y',
        actionType: device.expedited_review_flag === 'Y' ? 'immediate' : 'monitoring',
        authorityVerified: true,
        metadata: {
          contact: device.contact,
          address: {
            line1: device.address_1,
            line2: device.address_2,
            city: device.city,
            state: device.state,
            zip: device.zip_code,
            postal: device.postal_code,
            country: device.country_code
          },
          review: {
            advisory_committee: device.review_advisory_committee,
            third_party: device.third_party_flag,
            expedited: device.expedited_review_flag,
            clearance_type: device.clearance_type
          },
          manufacturing: {
            fei_numbers: device.openfda?.fei_number,
            registration_numbers: device.openfda?.registration_number
          },
          openfda_metadata: device.openfda
        }
      });

      console.log(`✅ [Enhanced FDA] Saved complete 510(k): ${title}`);
    } catch (error) {
      console.error('[Enhanced FDA] Error processing 510k:', error);
    }
  }

  /**
   * Collect PMA (Premarket Approvals) - NEW!
   */
  async collectPMA(limit: number = 50, sinceDate?: string): Promise<FDAPMA[]> {
    console.log(`[Enhanced FDA] Collecting PMA approvals (limit: ${limit})`);

    let endpoint = `${this.baseUrl}/device/pma.json?limit=${limit}&sort=decision_date:desc`;
    
    if (sinceDate) {
      endpoint += `&search=decision_date:[${sinceDate}+TO+NOW]`;
    }

    const data = await this.makeRequest(endpoint);

    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Invalid FDA PMA response');
    }

    console.log(`[Enhanced FDA] Processing ${data.results.length} PMA approvals`);

    for (const pma of data.results as FDAPMA[]) {
      await this.processPMA(pma);
    }

    return data.results as FDAPMA[];
  }

  private async processPMA(pma: FDAPMA): Promise<void> {
    try {
      const title = `FDA PMA: ${pma.trade_name || pma.generic_name || 'Unknown Device'} (${pma.pma_number}${pma.supplement_number ? `-${pma.supplement_number}` : ''})`;

      const description = `
**PMA Number:** ${pma.pma_number}${pma.supplement_number ? ` Supplement: ${pma.supplement_number}` : ''}
**Trade Name:** ${pma.trade_name || 'N/A'}
**Generic Name:** ${pma.generic_name || 'N/A'}
**Applicant:** ${pma.applicant || 'N/A'}

**Decision:** ${pma.decision || 'N/A'} (${pma.decision_date || 'N/A'})
**Product Code:** ${pma.product_code || 'N/A'}
**Advisory Committee:** ${pma.advisory_committee || 'N/A'}

**Device Class:** ${pma.openfda?.device_class || 'N/A'}
**Medical Specialty:** ${pma.openfda?.medical_specialty_description || 'N/A'}
**Regulation Number:** ${pma.openfda?.regulation_number || 'N/A'}

**Applicant Statement:** ${pma.ao_statement || 'No statement available'}
**Supplement Reason:** ${pma.supplement_reason || 'N/A'}
      `.trim();

      await storage.createRegulatoryUpdate({
        title,
        description,
        sourceId: 'fda_pma',
        sourceUrl: `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpma/pma.cfm?id=${pma.pma_number}`,
        region: 'US',
        jurisdiction: 'USA',
        updateType: 'approval' as const,
        category: 'medical_device_approval',
        deviceType: pma.trade_name || pma.generic_name,
        priority: 5, // PMA is always high priority (Class III devices)
        riskLevel: 'high',
        fdaProductCode: pma.product_code,
        fdaDeviceClass: pma.openfda?.device_class || '3',
        fdaRegulationNumber: pma.openfda?.regulation_number,
        fdaDecisionDate: pma.decision_date ? new Date(pma.decision_date) : null,
        fdaStatus: pma.decision || 'Unknown',
        publishedDate: pma.decision_date ? new Date(pma.decision_date) : new Date(),
        effectiveDate: pma.decision_date ? new Date(pma.decision_date) : null,
        actionRequired: true,
        actionType: 'immediate',
        authorityVerified: true,
        metadata: {
          pma_details: {
            pma_number: pma.pma_number,
            supplement_number: pma.supplement_number,
            supplement_reason: pma.supplement_reason,
            ao_statement: pma.ao_statement
          },
          advisory_committee: pma.advisory_committee,
          openfda_metadata: pma.openfda
        }
      });

      console.log(`✅ [Enhanced FDA] Saved PMA: ${title}`);
    } catch (error) {
      console.error('[Enhanced FDA] Error processing PMA:', error);
    }
  }

  /**
   * Collect MAUDE Adverse Events - NEW!
   */
  async collectMAUDE(limit: number = 100, sinceDate?: string): Promise<FDAMAUDE[]> {
    console.log(`[Enhanced FDA] Collecting MAUDE adverse events (limit: ${limit})`);

    let endpoint = `${this.baseUrl}/device/event.json?limit=${limit}&sort=date_received:desc`;
    
    if (sinceDate) {
      endpoint += `&search=date_received:[${sinceDate}+TO+NOW]`;
    }

    const data = await this.makeRequest(endpoint);

    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Invalid FDA MAUDE response');
    }

    console.log(`[Enhanced FDA] Processing ${data.results.length} adverse events`);

    for (const event of data.results as FDAMAUDE[]) {
      await this.processMAUDE(event);
    }

    return data.results as FDAMAUDE[];
  }

  private async processMAUDE(event: FDAMAUDE): Promise<void> {
    try {
      const title = `FDA MAUDE: ${event.device_generic_name || event.brand_name || 'Device'} Adverse Event (${event.report_number || event.mdr_report_key})`;

      const problemCodes = event.device_problem_codes?.join(', ') || 'N/A';
      const patientProblems = event.patient_problems?.join(', ') || 'N/A';
      const remedialActions = event.remedial_action?.join(', ') || 'None reported';

      const description = `
⚠️ **ADVERSE EVENT REPORT**

**Report Number:** ${event.report_number || event.mdr_report_key}
**Event Date:** ${event.date_of_event || 'N/A'}
**Report Date:** ${event.date_report || 'N/A'}
**Event Type:** ${event.event_type || 'N/A'}
**Event Location:** ${event.event_location || 'N/A'}

**Device Information:**
- Generic Name: ${event.device_generic_name || 'N/A'}
- Brand Name: ${event.brand_name || 'N/A'}
- Model: ${event.model_number || 'N/A'}
- Catalog: ${event.catalog_number || 'N/A'}
- Product Code: ${event.device_report_product_code || 'N/A'}
- Manufacture Date: ${event.device_date_of_manufacture || 'N/A'}

**Operator:** ${event.device_operator || 'N/A'}
**Report Source:** ${event.report_source_code || 'N/A'}

**Device Problems:** ${problemCodes}
**Patient Problems:** ${patientProblems}

**Event Description:**
${event.event_description || 'No description available'}

**Manufacturer Narrative:**
${event.manufacturer_narrative || 'No narrative provided'}

**Manufacturer:** ${event.manufacturer_name || 'N/A'}
**Location:** ${event.manufacturer_contact_city}, ${event.manufacturer_contact_state}

**Remedial Actions Taken:** ${remedialActions}
**Removal/Correction Number:** ${event.removal_correction_number || 'N/A'}

**Device Class:** ${event.openfda?.device_class || 'N/A'}
**Medical Specialty:** ${event.openfda?.medical_specialty_description || 'N/A'}
      `.trim();

      await storage.createRegulatoryUpdate({
        title,
        description,
        sourceId: 'fda_maude',
        sourceUrl: `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfmaude/detail.cfm?mdrfoi__id=${event.mdr_report_key}`,
        region: 'US',
        jurisdiction: 'USA',
        updateType: 'alert' as const,
        category: 'adverse_event',
        deviceType: event.device_generic_name || event.brand_name,
        priority: this.calculateMAUDEPriority(event),
        riskLevel: this.calculateMAUDERisk(event),
        fdaProductCode: event.device_report_product_code,
        fdaDeviceClass: event.openfda?.device_class,
        publishedDate: this.parseFDADate(event.date_received) || this.parseFDADate(event.date_report) || new Date(),
        effectiveDate: this.parseFDADate(event.date_of_event),
        actionRequired: event.remedial_action && event.remedial_action.length > 0,
        actionType: event.remedial_action && event.remedial_action.length > 0 ? 'immediate' : 'monitoring',
        authorityVerified: true,
        metadata: {
          maude_details: {
            mdr_report_key: event.mdr_report_key,
            event_key: event.event_key,
            report_number: event.report_number,
            event_type: event.event_type,
            device_operator: event.device_operator,
            report_source: event.report_source_code
          },
          device: {
            generic_name: event.device_generic_name,
            brand_name: event.brand_name,
            model_number: event.model_number,
            catalog_number: event.catalog_number,
            manufacture_date: event.device_date_of_manufacture,
            sequence_number: event.device_sequence_number
          },
          problems: {
            device_problems: event.device_problem_codes,
            patient_problems: event.patient_problems
          },
          manufacturer: {
            name: event.manufacturer_name,
            city: event.manufacturer_contact_city,
            state: event.manufacturer_contact_state
          },
          remedial_action: event.remedial_action,
          removal_correction_number: event.removal_correction_number,
          openfda_metadata: event.openfda
        }
      });

      console.log(`✅ [Enhanced FDA] Saved MAUDE event: ${title}`);
    } catch (error) {
      console.error('[Enhanced FDA] Error processing MAUDE:', error);
    }
  }

  /**
   * Collect Detailed Recalls with Classification - ENHANCED!
   */
  async collectRecallsDetailed(limit: number = 100, sinceDate?: string): Promise<FDARecall[]> {
    console.log(`[Enhanced FDA] Collecting DETAILED recalls (limit: ${limit})`);

    let endpoint = `${this.baseUrl}/device/recall.json?limit=${limit}&sort=recall_initiation_date:desc`;

    const data = await this.makeRequest(endpoint);

    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Invalid FDA Recall response');
    }

    console.log(`[Enhanced FDA] Processing ${data.results.length} detailed recalls`);

    for (const recall of data.results as FDARecall[]) {
      await this.processRecallDetailed(recall);
    }

    return data.results as FDARecall[];
  }

  private async processRecallDetailed(recall: FDARecall): Promise<void> {
    try {
      const emojiMap: Record<string, string> = {
        'Class I': '🔴',
        'Class II': '🟡',
        'Class III': '🟢',
        '': '⚫'
      };
      const classEmoji = emojiMap[recall.classification || ''];

      const title = `${classEmoji} FDA Recall ${recall.classification || ''}: ${recall.product_description?.slice(0, 100) || 'Device'} (${recall.recall_number})`;

      const description = `
**Recall Number:** ${recall.recall_number}
**Classification:** ${recall.classification || 'N/A'} ${classEmoji}
**Status:** ${recall.status || 'N/A'}

**Product:** ${recall.product_description || 'N/A'}
**Product Code:** ${recall.product_code || 'N/A'}
**Product Type:** ${recall.product_type || 'N/A'}

**Recalling Firm:** ${recall.recalling_firm || 'N/A'}
**Address:** ${[recall.address_1, recall.address_2, recall.city, recall.state, recall.postal_code, recall.country].filter(Boolean).join(', ')}

**Reason for Recall:**
${recall.reason_for_recall || 'No reason provided'}

**Distribution Pattern:** ${recall.distribution_pattern || 'N/A'}
**Product Quantity:** ${recall.product_quantity || 'N/A'}

**Code Information:** ${recall.code_info || 'N/A'}
**Additional Codes:** ${recall.more_code_info || 'N/A'}

**Dates:**
- Recall Initiation: ${recall.recall_initiation_date || 'N/A'}
- Center Classification: ${recall.center_classification_date || 'N/A'}
- Report Date: ${recall.report_date || 'N/A'}
- Termination Date: ${recall.termination_date || 'Ongoing'}

**Voluntary/Mandated:** ${recall.voluntary_mandated || 'N/A'}
**Initial Firm Notification:** ${recall.initial_firm_notification || 'N/A'}

**Event ID:** ${recall.event_id || 'N/A'}
**RES Event Number:** ${recall.res_event_number || 'N/A'}

**Device Class:** ${recall.openfda?.device_class || 'N/A'}
**Medical Specialty:** ${recall.openfda?.medical_specialty_description || 'N/A'}
**Regulation Number:** ${recall.openfda?.regulation_number || 'N/A'}
      `.trim();

      const priorityMap: Record<string, number> = {
        'Class I': 5,    // Life-threatening
        'Class II': 4,   // Serious injury
        'Class III': 2,  // Minimal harm
        '': 3
      };
      const classificationPriority = priorityMap[recall.classification || ''];

      const riskMap: Record<string, 'low' | 'medium' | 'high'> = {
        'Class I': 'high',
        'Class II': 'medium',
        'Class III': 'low',
        '': 'medium'
      };
      const classificationRisk = riskMap[recall.classification || ''];

      await storage.createRegulatoryUpdate({
        title,
        description,
        sourceId: 'fda_recall_detailed',
        sourceUrl: `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfres/res.cfm?id=${recall.res_event_number || recall.recall_number}`,
        region: 'US',
        jurisdiction: 'USA',
        updateType: 'alert' as const,
        category: 'device_recall',
        deviceType: recall.product_description,
        priority: classificationPriority,
        riskLevel: classificationRisk,
        fdaProductCode: recall.product_code,
        fdaDeviceClass: recall.openfda?.device_class,
        publishedDate: recall.recall_initiation_date ? new Date(recall.recall_initiation_date) : new Date(),
        effectiveDate: recall.recall_initiation_date ? new Date(recall.recall_initiation_date) : null,
        actionRequired: recall.classification === 'Class I' || recall.classification === 'Class II',
        actionType: recall.classification === 'Class I' ? 'immediate' : 'planned',
        actionDeadline: recall.termination_date ? new Date(recall.termination_date) : undefined,
        authorityVerified: true,
        authorityRecommendations: recall.reason_for_recall,
        metadata: {
          recall_details: {
            recall_number: recall.recall_number,
            classification: recall.classification,
            status: recall.status,
            voluntary_mandated: recall.voluntary_mandated,
            event_id: recall.event_id,
            res_event_number: recall.res_event_number
          },
          distribution: {
            pattern: recall.distribution_pattern,
            quantity: recall.product_quantity
          },
          codes: {
            code_info: recall.code_info,
            more_code_info: recall.more_code_info
          },
          firm: {
            name: recall.recalling_firm,
            address: {
              line1: recall.address_1,
              line2: recall.address_2,
              city: recall.city,
              state: recall.state,
              postal: recall.postal_code,
              country: recall.country
            },
            initial_notification: recall.initial_firm_notification
          },
          dates: {
            initiation: recall.recall_initiation_date,
            center_classification: recall.center_classification_date,
            report: recall.report_date,
            termination: recall.termination_date
          },
          openfda_metadata: recall.openfda
        }
      });

      console.log(`✅ [Enhanced FDA] Saved detailed recall: ${title}`);
    } catch (error) {
      console.error('[Enhanced FDA] Error processing recall:', error);
    }
  }

  // Helper functions
  private calculatePriority(device: EnhancedFDA510k): number {
    const deviceClass = device.device_class || device.openfda?.device_class;
    if (deviceClass === '3' || deviceClass === 'III') return 5;
    if (deviceClass === '2' || deviceClass === 'II') return 3;
    if (device.expedited_review_flag === 'Y') return 4;
    return 2;
  }

  private calculateRiskLevel(device: EnhancedFDA510k): 'low' | 'medium' | 'high' {
    const deviceClass = device.device_class || device.openfda?.device_class;
    if (deviceClass === '3' || deviceClass === 'III') return 'high';
    if (deviceClass === '2' || deviceClass === 'II') return 'medium';
    return 'low';
  }

  private calculateMAUDEPriority(event: FDAMAUDE): number {
    // Check for serious outcomes
    const hasRemedialAction = event.remedial_action && event.remedial_action.length > 0;
    const hasPatientProblems = event.patient_problems && event.patient_problems.length > 0;
    
    if (event.event_type?.toLowerCase().includes('death')) return 5;
    if (event.event_type?.toLowerCase().includes('injury') || hasPatientProblems) return 4;
    if (hasRemedialAction) return 3;
    return 2;
  }

  private calculateMAUDERisk(event: FDAMAUDE): 'low' | 'medium' | 'high' {
    if (event.event_type?.toLowerCase().includes('death')) return 'high';
    if (event.event_type?.toLowerCase().includes('injury')) return 'high';
    if (event.patient_problems && event.patient_problems.length > 0) return 'medium';
    return 'low';
  }
}

export const enhancedFDAService = new EnhancedFDAService();
