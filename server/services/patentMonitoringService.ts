/**
 * PATENT MONITORING SERVICE - Real-time ongoing patent tracking
 * Überwacht laufende Patentanträge in Echtzeit
 */

import axios from 'axios';
import { Logger } from './logger.service.js';

const logger = new Logger('PatentMonitoringService');

interface OngoingPatent {
  applicationNumber: string;
  filingDate: Date;
  status: 'pending' | 'published' | 'rejected' | 'granted' | 'abandoned';
  title: string;
  jurisdiction: string;
  lastUpdate: Date;
  nextDeadline?: Date;
  examinerName?: string;
  classificationCode?: string;
}

interface MonitoringAlert {
  type: 'status_change' | 'office_action' | 'publication' | 'grant' | 'rejection' | 'deadline_approaching';
  applicationNumber: string;
  title: string;
  date: Date;
  details: string;
  source: string;
}

class PatentMonitoringService {
  private readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) HelixPatentBot/1.0';
  private monitoredPatents: Map<string, OngoingPatent> = new Map();
  private alerts: MonitoringAlert[] = [];

  // ============================================================================
  // 1. USPTO TSDR MONITORING
  // ============================================================================
  async monitorUSPTOApplications(applicationNumbers: string[]): Promise<OngoingPatent[]> {
    logger.info(`USPTO TSDR: Monitoring ${applicationNumbers.length} applications...`);
    const patents: OngoingPatent[] = [];

    for (const appNum of applicationNumbers) {
      try {
        // USPTO TSDR API: https://teas.uspto.gov/api
        const response = await axios.get(
          `https://tsdr.uspto.gov/cgi-bin/tdbs_webserv.cgi`,
          {
            params: {
              applid: appNum,
              caseType: 'base',
              output: 'json'
            },
            timeout: 10000,
            headers: { 'User-Agent': this.USER_AGENT }
          }
        );

        if (response.data) {
          patents.push({
            applicationNumber: appNum,
            filingDate: new Date(response.data.filingDate || Date.now()),
            status: this.mapUSPTOStatus(response.data.status),
            title: response.data.firstUsedDate || 'Application',
            jurisdiction: 'US',
            lastUpdate: new Date(),
            examinerName: response.data.examinerId,
            classificationCode: response.data.classificationCode
          });
        }

        await this.delay(500);
      } catch (error: any) {
        logger.warn(`USPTO TSDR lookup failed for ${appNum}:`, error.message);
      }
    }

    logger.info(`USPTO TSDR: Monitored ${patents.length} applications`);
    return patents;
  }

  private mapUSPTOStatus(status: string): OngoingPatent['status'] {
    if (!status) return 'pending';
    if (status.includes('published')) return 'published';
    if (status.includes('rejected')) return 'rejected';
    if (status.includes('granted') || status.includes('issued')) return 'granted';
    if (status.includes('abandoned')) return 'abandoned';
    return 'pending';
  }

  // ============================================================================
  // 2. WIPO PATENTSCOPE MONITORING
  // ============================================================================
  async monitorWIPOApplications(pctNumbers: string[]): Promise<OngoingPatent[]> {
    logger.info(`WIPO PatentScope: Monitoring ${pctNumbers.length} PCT applications...`);
    const patents: OngoingPatent[] = [];

    for (const pctNum of pctNumbers) {
      try {
        // WIPO PatentScope REST API
        const response = await axios.get(
          `https://patentscope.wipo.int/api/patentscope/v1/patent/${pctNum}`,
          {
            timeout: 10000,
            headers: { 'User-Agent': this.USER_AGENT }
          }
        );

        if (response.data?.data) {
          const data = response.data.data;
          patents.push({
            applicationNumber: pctNum,
            filingDate: new Date(data.filingDate || Date.now()),
            status: this.mapWIPOStatus(data.status),
            title: data.title || 'International Application',
            jurisdiction: 'WO',
            lastUpdate: new Date(),
            nextDeadline: data.nextDeadline ? new Date(data.nextDeadline) : undefined,
            classificationCode: data.ipc?.[0]
          });
        }

        await this.delay(500);
      } catch (error: any) {
        logger.warn(`WIPO PatentScope lookup failed for ${pctNum}:`, error.message);
      }
    }

    logger.info(`WIPO PatentScope: Monitored ${patents.length} applications`);
    return patents;
  }

  private mapWIPOStatus(status: string): OngoingPatent['status'] {
    if (!status) return 'pending';
    if (status.includes('published')) return 'published';
    if (status.includes('refused')) return 'rejected';
    if (status.includes('granted')) return 'granted';
    if (status.includes('withdrawn')) return 'abandoned';
    return 'pending';
  }

  // ============================================================================
  // 3. EPO ESPACENET MONITORING
  // ============================================================================
  async monitorEPOApplications(appNumbers: string[]): Promise<OngoingPatent[]> {
    logger.info(`EPO espacenet: Monitoring ${appNumbers.length} applications...`);
    const patents: OngoingPatent[] = [];

    for (const appNum of appNumbers) {
      try {
        // EPO espacenet public search (no API, would require OPS registration)
        logger.info(`EPO: ${appNum} - would require OPS API credentials`);
      } catch (error: any) {
        logger.warn(`EPO lookup failed for ${appNum}:`, error.message);
      }
    }

    return patents;
  }

  // ============================================================================
  // 4. ALERT GENERATION
  // ============================================================================
  async detectStatusChanges(
    previousPatents: Map<string, OngoingPatent>,
    currentPatents: OngoingPatent[]
  ): Promise<MonitoringAlert[]> {
    const newAlerts: MonitoringAlert[] = [];

    for (const current of currentPatents) {
      const previous = previousPatents.get(current.applicationNumber);

      if (!previous) {
        // New application
        newAlerts.push({
          type: 'status_change',
          applicationNumber: current.applicationNumber,
          title: current.title,
          date: new Date(),
          details: `New application started monitoring`,
          source: current.jurisdiction
        });
        continue;
      }

      // Check for status changes
      if (previous.status !== current.status) {
        newAlerts.push({
          type: 'status_change',
          applicationNumber: current.applicationNumber,
          title: current.title,
          date: new Date(),
          details: `Status changed: ${previous.status} → ${current.status}`,
          source: current.jurisdiction
        });
      }

      // Check for publication
      if (previous.status !== 'published' && current.status === 'published') {
        newAlerts.push({
          type: 'publication',
          applicationNumber: current.applicationNumber,
          title: current.title,
          date: new Date(),
          details: `Application published`,
          source: current.jurisdiction
        });
      }

      // Check for grant
      if (previous.status !== 'granted' && current.status === 'granted') {
        newAlerts.push({
          type: 'grant',
          applicationNumber: current.applicationNumber,
          title: current.title,
          date: new Date(),
          details: `Patent granted`,
          source: current.jurisdiction
        });
      }

      // Check for rejection
      if (previous.status !== 'rejected' && current.status === 'rejected') {
        newAlerts.push({
          type: 'rejection',
          applicationNumber: current.applicationNumber,
          title: current.title,
          date: new Date(),
          details: `Patent application rejected`,
          source: current.jurisdiction
        });
      }

      // Check for deadline approaching
      if (current.nextDeadline) {
        const daysUntilDeadline = Math.floor(
          (current.nextDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilDeadline > 0 && daysUntilDeadline <= 30) {
          newAlerts.push({
            type: 'deadline_approaching',
            applicationNumber: current.applicationNumber,
            title: current.title,
            date: new Date(),
            details: `Deadline in ${daysUntilDeadline} days`,
            source: current.jurisdiction
          });
        }
      }
    }

    this.alerts.push(...newAlerts);
    return newAlerts;
  }

  // ============================================================================
  // 5. RSS FEED MONITORING
  // ============================================================================
  async monitorRSSFeeds(): Promise<MonitoringAlert[]> {
    logger.info('Checking patent office RSS feeds for updates...');
    const alerts: MonitoringAlert[] = [];

    const feeds = [
      {
        name: 'USPTO Patents Issued',
        url: 'https://www.uspto.gov/rss/utab_issue_rss.xml',
        type: 'grant' as const
      },
      {
        name: 'USPTO Applications Published',
        url: 'https://www.uspto.gov/rss/utab_pubs_rss.xml',
        type: 'publication' as const
      },
      {
        name: 'WIPO PCT Updates',
        url: 'https://www.wipo.int/rss/pct.xml',
        type: 'status_change' as const
      }
    ];

    for (const feed of feeds) {
      try {
        // In real implementation, würde RSS Feed geparsed
        logger.info(`Checking ${feed.name}...`);
      } catch (error: any) {
        logger.warn(`RSS feed check failed for ${feed.name}:`, error.message);
      }
    }

    return alerts;
  }

  // ============================================================================
  // 6. WEBHOOK-BASED MONITORING
  // ============================================================================
  async setupWebhookMonitoring(webhookUrl: string): Promise<void> {
    logger.info(`Setting up webhook monitoring to ${webhookUrl}`);

    // Register webhooks with patent offices that support them
    const endpoints = [
      {
        office: 'WIPO',
        endpoint: 'https://patentscope.wipo.int/api/webhook/register',
        events: ['publication', 'grant', 'rejection']
      },
      {
        office: 'USPTO',
        endpoint: 'https://developer.uspto.gov/webhooks/register',
        events: ['patent-issued', 'application-published', 'office-action']
      }
    ];

    for (const config of endpoints) {
      try {
        logger.info(`Registering webhook with ${config.office}...`);
        // Implementation würde webhook registration durchführen
      } catch (error: any) {
        logger.warn(`Webhook registration failed for ${config.office}:`, error.message);
      }
    }
  }

  // ============================================================================
  // 7. COMPREHENSIVE MONITORING
  // ============================================================================
  async runMonitoringCycle(
    usptApplications: string[] = [],
    wipoApplications: string[] = [],
    epoApplications: string[] = []
  ): Promise<{
    totalMonitored: number;
    alerts: MonitoringAlert[];
    statusUpdates: OngoingPatent[];
  }> {
    logger.info('Running comprehensive patent monitoring cycle...');

    const statusUpdates: OngoingPatent[] = [];

    // Monitor all sources
    const [usptPatents, wipoPatents, epoPatents] = await Promise.all([
      this.monitorUSPTOApplications(usptApplications),
      this.monitorWIPOApplications(wipoApplications),
      this.monitorEPOApplications(epoApplications)
    ]);

    statusUpdates.push(...usptPatents, ...wipoPatents, ...epoPatents);

    // Update monitored patents map
    for (const patent of statusUpdates) {
      this.monitoredPatents.set(patent.applicationNumber, patent);
    }

    // Detect changes and generate alerts
    const alerts = await this.detectStatusChanges(
      new Map(this.monitoredPatents),
      statusUpdates
    );

    // Check RSS feeds
    const rssAlerts = await this.monitorRSSFeeds();
    alerts.push(...rssAlerts);

    logger.info(
      `Monitoring cycle complete: ${statusUpdates.length} patents, ${alerts.length} alerts`
    );

    return {
      totalMonitored: statusUpdates.length,
      alerts,
      statusUpdates
    };
  }

  getAlerts(limit: number = 50): MonitoringAlert[] {
    return this.alerts.slice(-limit);
  }

  clearAlerts(): void {
    this.alerts = [];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export { PatentMonitoringService, OngoingPatent, MonitoringAlert };
export const patentMonitoringService = new PatentMonitoringService();
