/**
 * ClinicalTrials.gov API Integration
 * Collects ongoing and completed medical device trials
 * API Docs: https://clinicaltrials.gov/api/
 */

import { storage } from '../storage.js';

interface ClinicalTrial {
  NCTId: string;
  BriefTitle: string;
  OfficialTitle?: string;
  BriefSummary?: string;
  DetailedDescription?: string;
  OverallStatus: string;
  Phase?: string[];
  StudyType: string;
  StartDate?: string;
  CompletionDate?: string;
  PrimaryCompletionDate?: string;
  EnrollmentCount?: number;
  Condition?: string[];
  Intervention?: Array<{
    InterventionType: string;
    InterventionName: string;
    Description?: string;
  }>;
  Sponsor?: {
    LeadSponsor: {
      LeadSponsorName: string;
      LeadSponsorClass: string;
    };
  };
  Location?: Array<{
    LocationFacility: string;
    LocationCity?: string;
    LocationCountry?: string;
  }>;
  OutcomeMeasure?: Array<{
    OutcomeMeasureTitle: string;
    OutcomeMeasureDescription?: string;
  }>;
  StudyDocuments?: Array<{
    StudyDocType: string;
    StudyDocURL: string;
  }>;
}

export class ClinicalTrialsService {
  private baseUrl = 'https://clinicaltrials.gov/api/v2';
  private rateLimitDelay = 1000; // Be respectful
  private maxRetries = 3;

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest(endpoint: string, retryAttempt: number = 0): Promise<any> {
    try {
      console.log(`🔄 [ClinicalTrials] Requesting: ${endpoint.split('?')[0]}`);

      const response = await fetch(endpoint, {
        headers: {
          'User-Agent': 'Helix-Regulatory-Intelligence/3.0 (Medical Device Research)',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 429 && retryAttempt < this.maxRetries) {
          console.log(`⏱️ [ClinicalTrials] Rate limited, waiting...`);
          await this.delay(5000);
          return this.makeRequest(endpoint, retryAttempt + 1);
        }
        throw new Error(`ClinicalTrials API error: ${response.status}`);
      }

      const data = await response.json();
      await this.delay(this.rateLimitDelay);

      console.log(`✅ [ClinicalTrials] Success`);
      return data;
    } catch (error) {
      if (retryAttempt < this.maxRetries) {
        await this.delay(2000 * Math.pow(2, retryAttempt));
        return this.makeRequest(endpoint, retryAttempt + 1);
      }
      console.error(`❌ [ClinicalTrials] Failed:`, error);
      throw error;
    }
  }

  /**
   * Collect medical device trials
   */
  async collectDeviceTrials(limit: number = 50): Promise<ClinicalTrial[]> {
    console.log(`[ClinicalTrials] Collecting device trials (limit: ${limit})`);

    // Query for device-related trials
    const query = 'device OR implant OR diagnostic OR IVD OR "medical device"';
    const endpoint = `${this.baseUrl}/studies?query.term=${encodeURIComponent(query)}&filter.advanced=AREA[StudyType]DEVICE&pageSize=${limit}&sort=LastUpdatePostDate:desc&format=json`;

    const data = await this.makeRequest(endpoint);

    if (!data.studies || !Array.isArray(data.studies)) {
      console.warn('[ClinicalTrials] No studies found');
      return [];
    }

    console.log(`[ClinicalTrials] Processing ${data.studies.length} trials`);

    for (const study of data.studies) {
      await this.processTrial(study.protocolSection);
    }

    return data.studies.map((s: any) => s.protocolSection);
  }

  private async processTrial(trial: any): Promise<void> {
    try {
      const id = trial.identificationModule?.nctId;
      const title = trial.identificationModule?.briefTitle || trial.identificationModule?.officialTitle;

      if (!id || !title) {
        console.warn('[ClinicalTrials] Skipping trial without ID or title');
        return;
      }

      // Extract intervention devices
      const interventions = trial.armsInterventionsModule?.interventions || [];
      const devices = interventions
        .filter((i: any) => i.type === 'Device' || i.type === 'Diagnostic Test')
        .map((i: any) => i.name)
        .join(', ');

      // Extract conditions
      const conditions = trial.conditionsModule?.conditions || [];

      // Extract sponsor
      const sponsor = trial.sponsorCollaboratorsModule?.leadSponsor?.name || 'Unknown';

      // Extract status and dates
      const status = trial.statusModule?.overallStatus || 'Unknown';
      const startDate = trial.statusModule?.startDateStruct?.date;
      const completionDate = trial.statusModule?.completionDateStruct?.date;

      // Extract outcomes
      const outcomes = trial.outcomesModule?.primaryOutcomes || [];
      const outcomeTitles = outcomes.map((o: any) => o.measure).join('; ');

      // Build description
      const description = `
**NCT ID:** ${id}
**Status:** ${status}
**Study Type:** Device Trial

**Sponsor:** ${sponsor}

**Conditions:** ${conditions.join(', ') || 'N/A'}
**Devices/Interventions:** ${devices || 'N/A'}

**Enrollment:** ${trial.designModule?.enrollmentInfo?.count || 'N/A'} participants

**Study Dates:**
- Start: ${startDate || 'N/A'}
- Primary Completion: ${trial.statusModule?.primaryCompletionDateStruct?.date || 'N/A'}
- Completion: ${completionDate || 'N/A'}

**Primary Outcomes:**
${outcomeTitles || 'Not specified'}

**Brief Summary:**
${trial.descriptionModule?.briefSummary || 'No summary available'}

**Detailed Description:**
${trial.descriptionModule?.detailedDescription || 'No detailed description available'}

**Eligibility:**
${trial.eligibilityModule?.eligibilityCriteria || 'No eligibility criteria specified'}

**Study Documents:** ${trial.documentSection?.largeDocumentModule?.largeDocs?.length || 0} available
      `.trim();

      await storage.createRegulatoryUpdate({
        title: `Clinical Trial: ${title}`,
        description,
        sourceId: 'clinicaltrials_gov',
        sourceUrl: `https://clinicaltrials.gov/study/${id}`,
        region: this.determineRegion(trial),
        jurisdiction: this.determineJurisdiction(trial),
        updateType: 'guidance' as const,
        category: 'clinical_trial',
        deviceType: devices || undefined,
        priority: this.calculatePriority(status),
        riskLevel: this.calculateRisk(trial),
        publishedDate: new Date(trial.statusModule?.lastUpdatePostDateStruct?.date || Date.now()),
        effectiveDate: startDate ? new Date(startDate) : null,
        actionRequired: false,
        actionType: 'monitoring',
        authorityVerified: true,
        metadata: {
          nct_id: id,
          study_type: trial.designModule?.studyType,
          phase: trial.designModule?.phases,
          enrollment: trial.designModule?.enrollmentInfo,
          sponsor: trial.sponsorCollaboratorsModule,
          collaborators: trial.sponsorCollaboratorsModule?.collaborators,
          interventions: interventions,
          outcomes: outcomes,
          locations: trial.contactsLocationsModule?.locations,
          documents: trial.documentSection?.largeDocumentModule?.largeDocs,
          references: trial.referencesModule?.references
        }
      });

      console.log(`✅ [ClinicalTrials] Saved trial: ${id}`);
    } catch (error) {
      console.error('[ClinicalTrials] Error processing trial:', error);
    }
  }

  private determineRegion(trial: any): string {
    const locations = trial.contactsLocationsModule?.locations || [];
    if (locations.length === 0) return 'GLOBAL';
    
    const countries = [...new Set(locations.map((l: any) => l.country))];
    if (countries.length === 1) {
      const country = countries[0];
      if (country === 'United States') return 'US';
      if (['Germany', 'France', 'Italy', 'Spain', 'United Kingdom'].includes(country)) return 'EU';
    }
    
    return 'GLOBAL';
  }

  private determineJurisdiction(trial: any): string {
    const locations = trial.contactsLocationsModule?.locations || [];
    if (locations.length === 0) return 'GLOBAL';
    
    const countries = [...new Set(locations.map((l: any) => l.country))];
    return countries.join(', ');
  }

  private calculatePriority(status: string): number {
    const statusMap: Record<string, number> = {
      'Recruiting': 4,
      'Active, not recruiting': 3,
      'Enrolling by invitation': 4,
      'Completed': 2,
      'Terminated': 5,
      'Suspended': 5,
      'Withdrawn': 3
    };
    return statusMap[status] || 2;
  }

  private calculateRisk(trial: any): 'low' | 'medium' | 'high' {
    const phases = trial.designModule?.phases || [];
    if (phases.includes('Phase 1') || phases.includes('Early Phase 1')) return 'high';
    if (phases.includes('Phase 2')) return 'medium';
    return 'low';
  }
}

export const clinicalTrialsService = new ClinicalTrialsService();
