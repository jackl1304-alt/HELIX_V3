// Direct PostgreSQL storage for Helix 7AM morning state
// Load environment variables FIRST before any imports
import { config } from 'dotenv';
config();

// IMPORTANT: This file creates its own database connection
// TODO: Migrate to use db and pool from './db.js' to avoid duplicate connections
// Currently maintaining backward compatibility - this creates a separate pool
// which should be consolidated with server/db.ts in the future

// Datenbank-Treiber (Native PG only - Neon HTTP removed for stability)
import { Pool as PgPool } from 'pg';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { dataSources, aiTasks, type AiTask, type InsertAiTask } from "../shared/schema.js";
import { eq, lt, desc, and } from "drizzle-orm";

// Enhanced database connection with debug logging
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

console.log('[DB] Database URL configured:', DATABASE_URL ? 'YES' : 'NO');
console.log('[DB] Environment:', process.env.NODE_ENV || 'development');

// Windows-kompatible Datenbankverbindung mit Fallback
let sql: any;
let db: any;
// isMockMode entfernt - keine Mock-Datenbank mehr

if (!DATABASE_URL) {
  console.error('[DB ERROR] No DATABASE_URL environment variable found');
  throw new Error('DATABASE_URL environment variable is required. Please set it in .env file');
} else {
  console.log('[DB] Using DATABASE_URL for Production/Development');
  // Validiere DATABASE_URL Format bevor Verbindung
  if (!DATABASE_URL.includes('://') || !DATABASE_URL.startsWith('postgresql://') || !DATABASE_URL.includes('@')) {
    console.warn('[DB WARNING] Invalid DATABASE_URL format');
    console.warn('[DB WARNING] Expected: postgresql://user:password@host:port/database');
    throw new Error('Invalid DATABASE_URL format. Expected: postgresql://user:password@host:port/database');
  } else {
    // ALWAYS use native PG Pool for stability (no Neon HTTP)
    console.log('[DB] Initializing NATIVE PostgreSQL connection pool...');

    const pool = new PgPool({
      connectionString: DATABASE_URL,
      max: 20, // Maximum pool size
      idleTimeoutMillis: 30000, // 30 seconds
      connectionTimeoutMillis: 5000, // 5 seconds connection timeout
      ssl: DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
    });

    // Test connection immediately (SYNCHRONOUS)
    pool.query('SELECT NOW()').then(() => {
      console.log('[DB] ✅ Connection pool established successfully');
    }).catch((err) => {
      console.error('[DB] ❌ Connection test failed:', err.message);
    });

    db = drizzlePg(pool);

    // Enhanced SQL-Template-Helper with timeout protection
    sql = async (strings: TemplateStringsArray, ...values: any[]) => {
      const text = strings.reduce((acc, part, i) => acc + part + (i < values.length ? `$${i + 1}` : ''), '');
      try {
        const result = await pool.query(text, values);
        return result.rows;
      } catch (error: any) {
        console.error('[DB] Query error:', error.message);
        throw error;
      }
    };

    console.log('[DB] storage.ts: Native PG driver with connection pooling ACTIVE');
  }
}

export { db };

export interface IStorage {
  getDashboardStats(): Promise<any>;
  getAllDataSources(): Promise<any[]>;
  getRecentRegulatoryUpdates(limit?: number): Promise<any[]>;
  getPendingApprovals(): Promise<any[]>;
  getOngoingApprovals(): Promise<any[]>;
  updateDataSource(id: string, updates: any): Promise<any>;
  getActiveDataSources(): Promise<any[]>;
  getHistoricalDataSources(): Promise<any[]>;
  getAllRegulatoryUpdates(): Promise<any[]>;
  createDataSource(data: any): Promise<any>;
  createOrUpdateDataSource(data: any): Promise<any>;
  createRegulatoryUpdate(data: any): Promise<any>;
  getAllLegalCases(): Promise<any[]>;
  getLegalCasesByJurisdiction(jurisdiction: string): Promise<any[]>;
  createLegalCase(data: any): Promise<any>;
  // Patents
  getAllPatents(limit?: number): Promise<any[]>;
  getPatentsByJurisdiction?(jurisdiction: string, limit?: number): Promise<any[]>;
  createPatent(data: any): Promise<any>;
  getAllKnowledgeArticles(): Promise<any[]>;
  getKnowledgeBaseByCategory(category: string): Promise<any[]>;
  addKnowledgeArticle(data: any): Promise<any>;
  createKnowledgeArticle(data: any): Promise<any>;
  updateDataSourceLastSync(id: string, lastSync: Date): Promise<any>;
  getDataSourceById(id: string): Promise<any>;
  getDataSources(): Promise<any[]>;
  getDataSourceByType(type: string): Promise<any>;
  deleteKnowledgeArticle(id: string): Promise<boolean>;
  countRegulatoryUpdatesBySource(sourceId: string): Promise<number>;
  getSyncStatus?(): Promise<any>;

  // Chat Board Functions für Tenant-Administrator-Kommunikation
  getChatMessagesByTenant(tenantId: string): Promise<any[]>;
  createChatMessage(data: any): Promise<any>;
  updateChatMessageStatus(id: string, status: string, readAt?: Date): Promise<any>;
  getUnreadChatMessagesCount(tenantId?: string): Promise<number>;
  getAllChatMessages(): Promise<any[]>; // Für Admin-Übersicht
  getChatConversationsByTenant(tenantId: string): Promise<any[]>;
  createChatConversation(data: any): Promise<any>;
  updateChatConversation(id: string, updates: any): Promise<any>;

  // Project Management Functions - BEREICH 3
  getAllProjects(): Promise<any[]>;
  getProjectById(id: string): Promise<any>;
  createProject(data: any): Promise<any>;
  updateProject(id: string, updates: any): Promise<any>;
  deleteProject(id: string): Promise<boolean>;

  // Regulatory Pathways & Intelligent Project Creation
  getAllRegulatoryPathways(): Promise<any[]>;
  getRegulatoryPathwayById(id: string): Promise<any>;
  createProjectWithPhases(data: any): Promise<{ project: any; phases: any[] }>;
  getProjectPhases(projectId: string): Promise<any[]>;
  updateProjectPhase(phaseId: string, updates: any): Promise<any>;
  getProjectPhases(projectId: string): Promise<any[]>;
  updateProjectPhase(phaseId: string, updates: any): Promise<any>;

  // Automatisierte Task-Verwaltung (neutralisiert)
  getPendingAiTasks(): Promise<AiTask[]>;
  getScheduledAiTasks(): Promise<AiTask[]>;
  createAiTask(task: InsertAiTask): Promise<AiTask>;
  updateAiTask(id: string, updates: Partial<AiTask>): Promise<AiTask>;
  getAiTasks(options?: { limit?: number; offset?: number }): Promise<AiTask[]>;

  // Evaluation, Cost Items, Normative Actions
  getRegulatoryUpdateEvaluation?(regulatoryUpdateId: string): Promise<any>;
  upsertRegulatoryUpdateEvaluation?(data: any): Promise<any>;
  getCostItems?(): Promise<any[]>;
  createCostItem?(data: any): Promise<any>;
  getNormativeActions?(regulatoryUpdateId: string): Promise<any[]>;
  createNormativeAction?(data: any): Promise<any>;
  updateNormativeAction?(actionCode: string, data: any): Promise<any>;
}

// Direct SQL Storage Implementation for 7AM Morning State
class MorningStorage implements IStorage {
  // Runtime Schema Guards (cached after first detection)
  private legalCasesHasSource?: boolean;
  async getDashboardStats() {
    try {
      // Basic aggregated counts pulled live from the database
      const [regCount] = await sql`SELECT COUNT(*)::int AS count FROM regulatory_updates`;
      const [legalCount] = await sql`SELECT COUNT(*)::int AS count FROM legal_cases`;
      const [recentUpdates] = await sql`SELECT COUNT(*)::int AS count FROM regulatory_updates WHERE created_at > NOW() - INTERVAL '7 days'`;
      const [recentLegal] = await sql`SELECT COUNT(*)::int AS count FROM legal_cases WHERE created_at > NOW() - INTERVAL '30 days'`;
      const [dataSourceCount] = await sql`SELECT COUNT(*)::int AS count FROM data_sources WHERE is_active = true`;
      const [patentCount] = await sql`SELECT COUNT(*)::int AS count FROM patents`;

      const stats = {
        totalUpdates: regCount?.count || 0,
        uniqueUpdates: regCount?.count || 0,
        totalLegalCases: legalCount?.count || 0,
        uniqueLegalCases: legalCount?.count || 0,
        recentUpdates: recentUpdates?.count || 0,
        recentLegalCases: recentLegal?.count || 0,
        activeDataSources: dataSourceCount?.count || 0,
        totalPatents: patentCount?.count || 0,
        currentData: regCount?.count || 0,
        archivedData: 0,
        duplicatesRemoved: 'N/A',
        dataQuality: 'UNKNOWN',
        totalArticles: 0,
        totalSubscribers: 0,
        totalNewsletters: 0,
        runningSyncs: 0,
        recentSyncs: 0,
        pendingSyncs: 0
      };
      console.log('[DB] Dashboard-Statistiken erstellt:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Database error fetching dashboard stats:', error);
      // Keine Mock-Daten - leeres Stats-Objekt zurückgeben
      return {
        totalUpdates: 0,
        uniqueUpdates: 0,
        totalLegalCases: 0,
        uniqueLegalCases: 0,
        recentUpdates: 0,
        recentLegalCases: 0,
        activeDataSources: 0,
        currentData: 0,
        archivedData: 0,
        duplicatesRemoved: 'N/A',
        dataQuality: 'UNKNOWN',
        totalArticles: 0,
        totalSubscribers: 0,
        totalNewsletters: 0,
        runningSyncs: 0,
        recentSyncs: 0,
        pendingSyncs: 0
      };
    }
  }

  async getAllDataSources() {
    try {
      console.log('[DB] getAllDataSources called');
      // Use Drizzle ORM instead of raw SQL - match actual schema column names
      const result = await db.select({
        id: dataSources.id,
        name: dataSources.name,
        type: dataSources.type,
        category: dataSources.category,
        region: dataSources.region,
        createdAt: dataSources.createdAt,
        isActive: dataSources.isActive,
        apiEndpoint: dataSources.apiEndpoint,
        syncFrequency: dataSources.syncFrequency,
        lastSync: dataSources.lastSync
      })
      .from(dataSources)
      .orderBy(dataSources.name);

      console.log('[DB] getAllDataSources result count:', result.length);
      if (result.length > 0) {
        console.log('[DB] First result sample:', result[0]);
      }

      return result;
    } catch (error: any) {
      console.error('[DB] getAllDataSources SQL error:', error);
      console.log('[DB] Error details:', error.message);
      return [];
    }
  }

  getDefaultDataSources() {
    return [
      {
        id: "fda_510k",
        name: "FDA 510(k) Clearances",
        type: "current",
        category: "regulatory",
        region: "USA",
        last_sync: "2025-01-29T17:37:00.000Z",
        is_active: true,
        endpoint: "https://api.fda.gov/device/510k.json",
        auth_required: false,
        sync_frequency: "daily"
      },
      {
        id: "fda_pma",
        name: "FDA PMA Approvals",
        type: "current",
        category: "regulatory",
        region: "USA",
        last_sync: "2025-01-29T17:37:00.000Z",
        is_active: true,
        endpoint: "https://api.fda.gov/device/pma.json",
        auth_required: false,
        sync_frequency: "daily"
      },
      {
        id: "ema_epar",
        name: "EMA EPAR Database",
        type: "current",
        category: "regulatory",
        region: "Europa",
        last_sync: "2025-01-29T17:37:00.000Z",
        is_active: true,
        endpoint: "https://www.ema.europa.eu/en/medicines/download-medicine-data",
        auth_required: false,
        sync_frequency: "daily"
      },
      {
        id: "bfarm_guidelines",
        name: "BfArM Leitfäden",
        type: "current",
        category: "regulatory",
        region: "Deutschland",
        last_sync: "2025-01-29T17:37:00.000Z",
        is_active: true,
        endpoint: "https://www.bfarm.de/SharedDocs/Downloads/DE/Arzneimittel/Pharmakovigilanz/gcp/Liste-GCP-Inspektoren.html",
        auth_required: false,
        sync_frequency: "daily"
      },
      {
        id: "mhra_guidance",
        name: "MHRA Guidance",
        type: "current",
        category: "regulatory",
        region: "UK",
        last_sync: "2025-01-29T17:37:00.000Z",
        is_active: true,
        endpoint: "https://www.gov.uk/government/collections/mhra-guidance-notes",
        auth_required: false,
        sync_frequency: "daily"
      },
      {
        id: "swissmedic_guidelines",
        name: "Swissmedic Guidelines",
        type: "current",
        category: "regulatory",
        region: "Schweiz",
        last_sync: "2025-01-29T17:37:00.000Z",
        is_active: true,
        endpoint: "https://www.swissmedic.ch/swissmedic/en/home/medical-devices.html",
        auth_required: false,
        sync_frequency: "daily"
      },
      {
        id: "grip_intelligence",
        name: "GRIP Global Intelligence Platform",
        type: "current",
        category: "intelligence",
        region: "Global",
        last_sync: "2025-08-07T09:00:00.000Z",
        is_active: true,
        endpoint: "https://grip.pureglobal.com/api/v1",
        auth_required: true,
        sync_frequency: "hourly",
        credentials_status: "under_management",
        access_level: "premium"
      }
    ];
  }

  async getAllDataSources_ORIGINAL() {
    try {
      const result = await sql`SELECT * FROM data_sources ORDER BY created_at`;
      console.log("Fetched data sources:", result.length);

      // Transform database schema to frontend schema
      const transformedResult = result.map((source: any) => ({
        ...source,
        isActive: source.is_active, // Map is_active to isActive
        lastSync: source.last_sync_at, // Map last_sync_at to lastSync
        url: source.url || source.endpoint || `https://api.${source.id}.com/data`
      }));

      console.log("Active sources:", transformedResult.filter((s: any) => s.isActive).length);
      return transformedResult;
    } catch (error) {
      console.error("Data sources error:", error);
      return [];
    }
  }

  async getRecentRegulatoryUpdates(limit = 10) {
    try {
      const result = await sql`
        SELECT * FROM regulatory_updates
        ORDER BY published_at DESC
        LIMIT ${limit}
      `;
      console.log("Fetched regulatory updates:", result.length);
      return result;
    } catch (error) {
      console.error("Recent updates error:", error);
      return [];
    }
  }

  async getPendingApprovals() {
    try {
      const result = await sql`
        SELECT * FROM approvals
        WHERE status = 'pending'
        ORDER BY created_at DESC
      `;
      console.log("Fetched pending approvals:", result.length);
      return result;
    } catch (error) {
      console.error("Pending approvals error:", error);
      return [];
    }
  }

  // Laufende Zulassungen - Aus externen Quellen (regulatory_updates)
  async getOngoingApprovals() {
    try {
      console.log('[DB] getOngoingApprovals called - fetching ongoing approvals from regulatory_updates');
      
      // Hole laufende Zulassungen aus regulatory_updates
      // Filter: type = 'approval' UND (approvalStatus = 'pending'/'in_review' ODER fdaDecisionDate IS NULL ODER publishedDate sehr recent)
      const updates = await sql`
        SELECT 
          id, title, description, type, category, device_type, device_class,
          jurisdiction, published_date, effective_date, submission_date,
          review_start_date, expected_decision_date, approval_status,
          fda_k_number, fda_applicant, fda_device_class, fda_status,
          fda_decision_date, source_url, source_id, priority, risk_level,
          metadata, created_at, updated_at
        FROM regulatory_updates
        WHERE type = 'approval'
          AND (
            approval_status IN ('pending', 'in_review')
            OR (approval_status IS NULL AND fda_decision_date IS NULL)
            OR (fda_decision_date IS NULL AND published_date > NOW() - INTERVAL '90 days')
          )
        ORDER BY 
          CASE 
            WHEN approval_status = 'pending' THEN 1
            WHEN approval_status = 'in_review' THEN 2
            ELSE 3
          END,
          priority DESC NULLS LAST,
          published_date DESC NULLS LAST,
          created_at DESC
        LIMIT 500
      `;
      console.log(`[DB] Fetched ${updates.length} ongoing approvals from regulatory_updates`);
      
      // Transformiere regulatory_updates zu OngoingApproval Format
      return updates.map((update: any) => {
        // Bestimme Region aus jurisdiction
        const region = update.jurisdiction || 'Unknown';
        
        // Bestimme Regulatory Body basierend auf Region
        let regulatoryBody = 'Unknown';
        if (region === 'US' || update.fda_k_number) {
          regulatoryBody = 'FDA - Center for Devices and Radiological Health';
        } else if (region === 'EU' || region === 'DE' || region === 'FR' || region === 'IT') {
          regulatoryBody = 'MDR - Benannte Stelle';
        } else if (region === 'CA') {
          regulatoryBody = 'Health Canada';
        } else if (region === 'UK' || region === 'GB') {
          regulatoryBody = 'MHRA - Medicines and Healthcare products Regulatory Agency';
        } else if (region === 'CH') {
          regulatoryBody = 'Swissmedic';
        } else if (region === 'JP') {
          regulatoryBody = 'PMDA - Pharmaceuticals and Medical Devices Agency';
        } else if (region === 'AU') {
          regulatoryBody = 'TGA - Therapeutic Goods Administration';
        }
        
        // Bestimme Status-Mapping aus approval_status oder fda_status
        let status: string = 'submitted';
        const approvalStatus = update.approval_status || update.fda_status;
        if (approvalStatus === 'pending' || approvalStatus === 'submitted') {
          status = 'submitted';
        } else if (approvalStatus === 'in_review' || approvalStatus === 'under_review') {
          status = 'under-review';
        } else if (approvalStatus === 'pending_response' || approvalStatus === 'additional_info_requested') {
          status = 'pending-response';
        } else if (approvalStatus === 'nearly_approved' || approvalStatus === 'final_review') {
          status = 'nearly-approved';
        } else if (approvalStatus === 'approved' || update.fda_decision_date) {
          status = 'approved';
        } else if (approvalStatus === 'rejected' || approvalStatus === 'denied') {
          status = 'rejected';
        }
        
        // Berechne Progress basierend auf Status
        let progressPercentage = 0;
        if (status === 'submitted') progressPercentage = 20;
        else if (status === 'under-review') progressPercentage = 50;
        else if (status === 'pending-response') progressPercentage = 60;
        else if (status === 'nearly-approved') progressPercentage = 90;
        else if (status === 'approved') progressPercentage = 100;
        else if (status === 'rejected') progressPercentage = 0;
        
        // Extrahiere Produktname aus title
        let productName = update.title || 'Unknown Product';
        // Entferne Präfixe wie "FDA 510(k):", "FDA PMA:", etc.
        productName = productName.replace(/^(FDA\s+(510\(k\)|PMA|Device):\s*|EMA\s+Approval:\s*)/i, '').trim();
        
        // Extrahiere Company aus fda_applicant oder metadata
        const company = update.fda_applicant || update.metadata?.company || update.metadata?.applicant || 'Unknown Company';
        
        // Bestimme Device Class
        const deviceClass = update.device_class || update.fda_device_class || 'Unknown';
        
        // Submission Date
        const submissionDate = update.submission_date 
          ? new Date(update.submission_date).toISOString().split('T')[0]
          : update.published_date
          ? new Date(update.published_date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        
        // Expected Approval Date
        const expectedApproval = update.expected_decision_date
          ? new Date(update.expected_decision_date).toISOString().split('T')[0]
          : null;
        
        // Current Phase
        const currentPhase = this.getCurrentPhaseFromApprovalStatus(approvalStatus || status);
        
        // Key Milestones
        const keyMilestones = this.getKeyMilestonesFromStatus(approvalStatus || status);
        
        // Priority basierend auf risk_level oder priority
        let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
        if (update.risk_level === 'high' || update.priority >= 4) priority = 'high';
        else if (update.risk_level === 'critical' || update.priority >= 5) priority = 'critical';
        else if (update.risk_level === 'low' || update.priority <= 2) priority = 'low';
        
        return {
          id: update.id,
          productName: productName,
          company: company,
          region: region,
          regulatoryBody: regulatoryBody,
          submissionDate: submissionDate,
          expectedApproval: expectedApproval,
          currentPhase: currentPhase,
          deviceClass: deviceClass,
          status: status as any,
          progressPercentage: progressPercentage,
          estimatedCosts: 'N/A', // Wird später aus metadata extrahiert falls verfügbar
          keyMilestones: keyMilestones,
          challenges: update.metadata?.challenges || [],
          nextSteps: update.metadata?.nextSteps || [],
          contactPerson: update.metadata?.contactPerson || 'N/A',
          priority: priority
        };
      });
    } catch (error) {
      console.error("❌ getOngoingApprovals error:", error);
      return [];
    }
  }

  private getCurrentPhase(status: string): string {
    const phaseMap: Record<string, string> = {
      'planning': 'Planungsphase',
      'in_development': 'Entwicklung',
      'regulatory_review': 'Regulatorische Prüfung',
      'approval_pending': 'Genehmigung ausstehend',
      'testing': 'Testphase',
      'approved': 'Genehmigt',
      'on_hold': 'Pausiert',
      'cancelled': 'Abgebrochen'
    };
    return phaseMap[status] || status;
  }

  private getCurrentPhaseFromApprovalStatus(status: string): string {
    const phaseMap: Record<string, string> = {
      'submitted': 'Eingereicht',
      'pending': 'Eingereicht',
      'in_review': 'In Prüfung',
      'under_review': 'In Prüfung',
      'under-review': 'In Prüfung',
      'pending_response': 'Antwort ausstehend',
      'additional_info_requested': 'Zusätzliche Informationen angefordert',
      'nearly_approved': 'Fast genehmigt',
      'final_review': 'Finale Prüfung',
      'approved': 'Genehmigt',
      'rejected': 'Abgelehnt',
      'denied': 'Abgelehnt',
      'withdrawn': 'Zurückgezogen'
    };
    return phaseMap[status?.toLowerCase()] || 'Unbekannt';
  }

  private getKeyMilestonesFromStatus(status: string): string[] {
    const statusLower = status?.toLowerCase() || '';
    const milestones: string[] = [];
    
    if (statusLower === 'submitted' || statusLower === 'pending') {
      milestones.push('✅ Antrag eingereicht');
      milestones.push('⏳ Warte auf erste Prüfung');
    } else if (statusLower === 'in_review' || statusLower === 'under_review' || statusLower === 'under-review') {
      milestones.push('✅ Antrag eingereicht');
      milestones.push('✅ Erste Prüfung abgeschlossen');
      milestones.push('🔄 Detaillierte Prüfung läuft');
      milestones.push('⏳ Warte auf Entscheidung');
    } else if (statusLower === 'pending_response' || statusLower === 'additional_info_requested') {
      milestones.push('✅ Antrag eingereicht');
      milestones.push('✅ Erste Prüfung abgeschlossen');
      milestones.push('🔄 Zusätzliche Informationen angefordert');
      milestones.push('⏳ Warte auf Antwort');
    } else if (statusLower === 'nearly_approved' || statusLower === 'final_review') {
      milestones.push('✅ Antrag eingereicht');
      milestones.push('✅ Erste Prüfung abgeschlossen');
      milestones.push('✅ Detaillierte Prüfung abgeschlossen');
      milestones.push('🔄 Finale Prüfung läuft');
    } else if (statusLower === 'approved') {
      milestones.push('✅ Antrag eingereicht');
      milestones.push('✅ Erste Prüfung abgeschlossen');
      milestones.push('✅ Detaillierte Prüfung abgeschlossen');
      milestones.push('✅ Genehmigung erteilt');
    } else {
      milestones.push('⏳ Status wird geprüft');
    }
    
    return milestones;
  }

  private getKeyMilestones(status: string): string[] {
    const milestones: Record<string, string[]> = {
      'planning': ['✅ Projekt initialisiert', '⏳ Planung läuft'],
      'in_development': ['✅ Planung abgeschlossen', '🔄 Entwicklung läuft', '⏳ Tests ausstehend'],
      'regulatory_review': ['✅ Entwicklung abgeschlossen', '✅ Tests abgeschlossen', '🔄 Regulatorische Prüfung läuft', '⏳ Genehmigung ausstehend'],
      'approval_pending': ['✅ Entwicklung abgeschlossen', '✅ Tests abgeschlossen', '✅ Regulatorische Prüfung abgeschlossen', '⏳ Genehmigung ausstehend'],
      'approved': ['✅ Entwicklung abgeschlossen', '✅ Tests abgeschlossen', '✅ Regulatorische Prüfung abgeschlossen', '✅ Genehmigt']
    };
    return milestones[status] || [];
  }

  private mapRiskToPriority(riskLevel: string | null): 'low' | 'medium' | 'high' | 'critical' {
    if (!riskLevel) return 'medium';
    const risk = riskLevel.toLowerCase();
    if (risk === 'critical') return 'critical';
    if (risk === 'high') return 'high';
    if (risk === 'low') return 'low';
    return 'medium';
  }

  async updateDataSource(id: string, updates: any) {
    try {
      // Update only existing columns - no updated_at column in this table
      const result = await sql`
        UPDATE data_sources
        SET is_active = ${updates.isActive}, last_sync_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      console.log("Updated data source:", id, "to active:", updates.isActive);
      return result[0];
    } catch (error) {
      console.error("Update data source error:", error);
      throw error;
    }
  }

  async getActiveDataSources() {
    try {
      const result = await sql`SELECT * FROM data_sources WHERE is_active = true ORDER BY created_at`;

      // Transform database schema to frontend schema
      const transformedResult = result.map((source: any) => ({
        ...source,
        isActive: source.is_active,
        lastSync: source.last_sync_at,
        url: source.url || source.endpoint || `https://api.${source.id}.com/data`
      }));

      return transformedResult;
    } catch (error) {
      console.error("Active data sources error:", error);
      return [];
    }
  }

  async getHistoricalDataSources() {
    try {
      console.log('[DB] getHistoricalDataSources called - ARCHIVIERTE DATEN (vor 30.07.2024)');

      // Kombiniere archivierte Regulatory Updates mit Historical Data
      const cutoffDate = '2024-07-30';

      // Hole archivierte Regulatory Updates (vor 30.07.2024)
      const archivedUpdates = await sql`
        SELECT
          id,
          title,
          description,
          source_id,
          source_url as document_url,
          published_at,
          region,
          update_type as category,
          priority,
          device_classes,
          created_at as archived_at,
          'regulatory_update' as source_type
        FROM regulatory_updates
        WHERE published_at < ${cutoffDate}
        ORDER BY published_at DESC
      `;

      // Hole Data Sources für Metadaten
      const dataSources = await sql`SELECT * FROM data_sources ORDER BY created_at DESC`;

      console.log(`[DB] Archivierte Updates (vor ${cutoffDate}): ${archivedUpdates.length} Einträge`);
      console.log(`[DB] Data Sources: ${dataSources.length} Quellen`);

      // Kombiniere und transformiere zu einheitlichem Format
      const historicalData = [
        ...archivedUpdates.map((update: any) => ({
          id: update.id,
          source_id: update.source_id,
          title: update.title,
          description: update.description,
          document_url: update.document_url,
          published_at: update.published_at,
          archived_at: update.archived_at,
          region: update.region,
          category: update.category,
          priority: update.priority,
          deviceClasses: Array.isArray(update.device_classes) ? update.device_classes : [],
          source_type: 'archived_regulatory'
        })),
        ...dataSources.map((source: any) => ({
          id: source.id,
          source_id: source.id,
          title: source.name,
          description: `Datenquelle: ${source.name} (${source.country})`,
          document_url: source.endpoint,
          published_at: source.created_at,
          archived_at: source.last_sync_at,
          region: source.country,
          category: source.type,
          priority: 'low',
          deviceClasses: [],
          source_type: 'data_source',
          isActive: source.is_active,
          lastSync: source.last_sync_at,
          url: source.url || source.endpoint
        }))
      ];

      return historicalData;
    } catch (error) {
      console.error("Historical data sources error:", error);
      return [];
    }
  }

  async getAllRegulatoryUpdates() {
    try {
      console.log('[DB] getAllRegulatoryUpdates called - ALLE DATEN FÜR FRONTEND MIT QUELLEN');
      // Frontend-Anzeige: JOIN mit data_sources für Quelleninformationen
      const result = await sql`
        SELECT
          ru.*,
          ds.name as source_name,
          ds.url as source_url,
          ds.description as source_description,
          ds.country as source_country
        FROM regulatory_updates ru
        LEFT JOIN data_sources ds ON ru.source_id = ds.id
        ORDER BY
          CASE WHEN ru.source_id = 'fda_510k' THEN 1 ELSE 2 END,
          ru.created_at DESC
        LIMIT 5000
      `;
      console.log(`[DB] Alle regulatory updates für Frontend: ${result.length} Einträge (mit Quellen)`);
      return result;
    } catch (error) {
      console.error("❌ Database error fetching regulatory updates:", error);
      // Keine Mock-Daten - leeres Array zurückgeben
      return [];
    }
  }

  async createDataSource(data: any) {
    try {
      // CRITICAL FIX: Ensure ID is never null or undefined
      let sourceId = data.id;
      if (!sourceId || sourceId === null || sourceId === undefined || sourceId === '') {
        sourceId = `source_${Date.now()}_${crypto.randomUUID().substr(0, 9)}`;
        console.log(`[DB] Generated new ID for data source: ${sourceId}`);
      }

      console.log(`[DB] Creating data source with ID: ${sourceId}, Name: ${data.name}`);

      // First try to INSERT, if conflict use ON CONFLICT DO UPDATE
      const result = await sql`
        INSERT INTO data_sources (id, name, url, country, region, type, category, language, is_active, sync_frequency, auth_required, last_sync, created_at)
        VALUES (
          ${sourceId},
          ${data.name || 'Unnamed Source'},
          ${data.url || data.endpoint || ''},
          ${data.country || 'INTL'},
          ${data.region || 'Global'},
          ${data.type || 'unknown'},
          ${data.category || 'general'},
          ${data.language || 'en'},
          ${data.isActive !== undefined ? data.isActive : true},
          ${data.syncFrequency || 'daily'},
          ${data.authRequired !== undefined ? data.authRequired : false},
          ${data.lastSync || new Date().toISOString()},
          ${new Date().toISOString()}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          url = EXCLUDED.url,
          country = EXCLUDED.country,
          region = EXCLUDED.region,
          type = EXCLUDED.type,
          category = EXCLUDED.category,
          language = EXCLUDED.language,
          is_active = EXCLUDED.is_active,
          sync_frequency = EXCLUDED.sync_frequency,
          auth_required = EXCLUDED.auth_required,
          last_sync = EXCLUDED.last_sync
        RETURNING *
      `;

      console.log(`[DB] Successfully created/updated data source: ${sourceId}`);
      return result[0];
    } catch (error) {
      console.error("Create data source error:", error, "Data:", data);
      throw error;
    }
  }

  async createRegulatoryUpdate(data: any) {
    try {
      // Erweiterte SQL mit allen neuen Feldern für laufende Zulassungen
      const result = await sql`
        INSERT INTO regulatory_updates (
          title,
          description,
          source_id,
          source_url,
          document_url,
          document_id,
          jurisdiction,
          type,
          category,
          language,
          tags,
          priority,
          risk_level,
          published_date,
          effective_date,
          submission_date,
          review_start_date,
          expected_decision_date,
          approval_status,
          fda_k_number,
          fda_applicant,
          fda_device_class,
          fda_status,
          action_required,
          action_type,
          authority_verified,
          metadata
        )
        VALUES (
          ${data.title},
          ${data.description || 'No description provided'},
          ${data.sourceId || null},
          ${data.sourceUrl || data.documentUrl || ''},
          ${data.documentUrl || null},
          ${data.documentId || null},
          ${data.jurisdiction || data.region || 'International'},
          ${(data.type || 'regulation')}::update_type,
          ${data.category || 'general'},
          ${data.language || 'en'},
          ${data.tags || []},
          ${typeof data.priority === 'number' ? data.priority : 1},
          ${data.riskLevel || null},
          ${data.publishedDate || data.publishedAt || new Date()},
          ${data.effectiveDate || null},
          ${data.submissionDate || null},
          ${data.reviewStartDate || null},
          ${data.expectedDecisionDate || null},
          ${data.approvalStatus || null},
          ${data.fdaKNumber || null},
          ${data.fdaApplicant || null},
          ${data.fdaDeviceClass || null},
          ${data.fdaStatus || null},
          ${data.actionRequired || false},
          ${data.actionType || null},
          ${data.authorityVerified || false},
          ${data.metadata ? JSON.stringify(data.metadata) : null}
        )
        RETURNING *
      `;
      console.log(`[DB] Successfully created regulatory update: ${data.title}`);
      return result[0];
    } catch (error: any) {
      console.error("Create regulatory update error:", error);
      console.error("Data that failed:", JSON.stringify(data, null, 2));
      throw error;
    }
  }

  private mapPriorityToEnum(priority: string | number): string {
    // Mapping von String-Prioritäten zu Enum-Werten
    if (typeof priority === 'number') {
      if (priority >= 4) return 'urgent';
      if (priority >= 3) return 'high';
      if (priority >= 2) return 'medium';
      return 'low';
    }

    const priorityStr = priority?.toLowerCase() || 'medium';
    if (['urgent', 'high', 'medium', 'low'].includes(priorityStr)) {
      return priorityStr;
    }
    return 'medium'; // default
  }

  async createOrUpdateDataSource(data: any): Promise<any> {
    return this.createDataSource(data);
  }

  async getAllLegalCases() {
    try {
      console.log('[DB] getAllLegalCases called (ALL DATA - NO LIMITS)');
      // REMOVED LIMITS: Get all legal cases for complete dataset viewing
      const result = await sql`
        SELECT * FROM legal_cases
        ORDER BY decision_date DESC
      `;
      console.log(`Fetched ${result.length} legal cases from database (ALL DATA)`);
      return result.map((row: any) => ({
        id: row.id,
        caseNumber: row.case_number,
        title: row.title,
        court: row.court,
        jurisdiction: row.jurisdiction,
        decisionDate: row.decision_date,
        summary: row.summary,
        content: row.content || row.summary,
        documentUrl: row.document_url,
        impactLevel: row.impact_level,
        keywords: row.keywords || []
      }));
    } catch (error) {
      console.error("All legal cases error:", error);
      return [];
    }
  }

  async getLegalCasesByJurisdiction(jurisdiction: string) {
    try {
      // Legal cases don't exist in current DB - return empty for now
      return [];
    } catch (error) {
      console.error("Legal cases by jurisdiction error:", error);
      return [];
    }
  }

  async createLegalCase(data: any) {
    try {
      console.log('[DB] Creating legal case:', data.title);

      // Parse date safely
      let decisionDate = null;
      if (data.filedDate) {
        try {
          const dateStr = typeof data.filedDate === 'string' ? data.filedDate : data.filedDate.toISOString();
          decisionDate = dateStr.split('T')[0]; // Extract YYYY-MM-DD
        } catch (dateError) {
          console.warn('[DB] Invalid date format, using null:', data.filedDate);
        }
      }

      // Format keywords array for PostgreSQL
      const keywordsArray = data.keywords && data.keywords.length > 0
        ? `{${data.keywords.map((k: string) => `"${k.replace(/"/g, '\\"')}"`).join(',')}}`
        : null;

      // Source Mapping (supports legacy sourceId)
      const sourceValue = data.source || data.sourceId || null;

      const result = await sql`
        INSERT INTO legal_cases (
          id, case_number, title, court, jurisdiction, source,
          decision_date, summary, content, document_url,
          impact_level, keywords, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(),
          ${data.caseNumber || null},
          ${data.title},
          ${data.court},
          ${data.jurisdiction},
          ${sourceValue},
          ${decisionDate},
          ${data.description || data.summary || null},
          ${data.description || null},
          ${data.documentUrl || null},
          ${data.impactLevel || 'medium'},
          ${keywordsArray},
          NOW(),
          NOW()
        )
        RETURNING *
      `;

      console.log(`[DB] Successfully created legal case: ${data.title}`);
      return result[0];
    } catch (error) {
      console.error("[DB] Create legal case error:", error);
      throw error; // Fehler weiterwerfen statt Mock-Daten
    }
  }

  // ------------------------------
  // Patent Storage Methods
  // ------------------------------
  async getAllPatents(limit: number = 100) {
    try {
      const result = await sql`SELECT * FROM patents ORDER BY publication_date DESC NULLS LAST LIMIT ${limit}`;
      return result;
    } catch (error) {
      console.error('[DB] getAllPatents error:', error);
      return [];
    }
  }

  async createPatent(data: any) {
    try {
      if (!data.publicationNumber) {
        throw new Error('publicationNumber required');
      }

      // Check existing
      const existing = await sql`SELECT id FROM patents WHERE publication_number = ${data.publicationNumber} LIMIT 1`;
      if (existing.length > 0) {
        // Simple update of abstract/status
        await sql`UPDATE patents SET abstract = ${data.abstract || null}, status = ${data.status || 'granted'}, updated_at = NOW() WHERE id = ${existing[0].id}`;
        return { id: existing[0].id, ...data, updated: true };
      }

      // Prepare arrays
      const inventorsArray = data.inventors && data.inventors.length > 0
        ? `{${data.inventors.map((n: string) => '"' + n.replace(/"/g,'\"') + '"').join(',')}}`
        : null;
      const cpcArray = data.cpcCodes && data.cpcCodes.length > 0
        ? `{${data.cpcCodes.map((n: string) => '"' + n.replace(/"/g,'\"') + '"').join(',')}}`
        : null;
      const ipcArray = data.ipcCodes && data.ipcCodes.length > 0
        ? `{${data.ipcCodes.map((n: string) => '"' + n.replace(/"/g,'\"') + '"').join(',')}}`
        : null;
      const familyArray = data.patentFamily && data.patentFamily.length > 0
        ? `{${data.patentFamily.map((n: string) => '"' + n.replace(/"/g,'\"') + '"').join(',')}}`
        : null;

      const publicationDate = data.publicationDate ? (typeof data.publicationDate === 'string' ? data.publicationDate : data.publicationDate.toISOString().split('T')[0]) : null;
      const filingDate = data.filingDate ? (typeof data.filingDate === 'string' ? data.filingDate : data.filingDate.toISOString().split('T')[0]) : null;

      const inserted = await sql`INSERT INTO patents (
        id, publication_number, title, abstract, applicant, inventors, publication_date, filing_date,
        status, jurisdiction, ipc_codes, cpc_codes, forward_citations, backward_citations, document_url,
        patent_family, therapeutic_area, device_type, chemical_structure, source, metadata, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        ${data.publicationNumber},
        ${data.title},
        ${data.abstract || null},
        ${data.applicant || null},
        ${inventorsArray},
        ${publicationDate},
        ${filingDate},
        ${data.status || 'granted'},
        ${data.jurisdiction || 'US'},
        ${ipcArray},
        ${cpcArray},
        ${data.forwardCitations || 0},
        ${data.backwardCitations || 0},
        ${data.documentUrl || null},
        ${familyArray},
        ${data.therapeuticArea || null},
        ${data.deviceType || null},
        ${data.chemicalStructure || null},
        ${data.source || 'USPTO PatentsView'},
        ${data.metadata ? JSON.stringify(data.metadata) : null},
        NOW(), NOW()
      ) RETURNING *`;

      return inserted[0];
    } catch (error) {
      console.error('[DB] createPatent error:', error);
      throw error; // Fehler weiterwerfen statt Mock-Daten
    }
  }

  async getPatentsByJurisdiction(jurisdiction: string, limit: number = 100) {
    try {
      const result = await sql`SELECT * FROM patents WHERE jurisdiction = ${jurisdiction} ORDER BY publication_date DESC NULLS LAST LIMIT ${limit}`;
      return result;
    } catch (error) {
      console.error('[DB] getPatentsByJurisdiction error:', error);
      return [];
    }
  }

  async getAllKnowledgeArticles() {
    try {
      const result = await sql`SELECT * FROM knowledge_base ORDER BY created_at DESC`;
      return result;
    } catch (error) {
      console.error("All knowledge articles error:", error);
      return [];
    }
  }

  // Task Implementation (neutralisiert)
  async getPendingAiTasks(): Promise<AiTask[]> {
    try {
      return await db.select().from(aiTasks).where(eq(aiTasks.status, "pending"));
    } catch (error) {
      console.error("Error getting pending tasks:", error);
      return [];
    }
  }

  async getScheduledAiTasks(): Promise<AiTask[]> {
    try {
      return await db.select().from(aiTasks)
        .where(and(
          eq(aiTasks.scheduled, true),
          lt(aiTasks.scheduledFor, new Date())
        ));
    } catch (error) {
      console.error("Error getting scheduled tasks:", error);
      return [];
    }
  }

  async createAiTask(task: InsertAiTask): Promise<AiTask> {
    const [newTask] = await db.insert(aiTasks).values(task).returning();
    return newTask;
  }

  async updateAiTask(id: string, updates: Partial<AiTask>): Promise<AiTask> {
    const [updatedTask] = await db.update(aiTasks)
      .set(updates)
      .where(eq(aiTasks.id, id))
      .returning();
    return updatedTask;
  }

  async getAiTasks(options: { limit?: number; offset?: number } = {}): Promise<AiTask[]> {
    try {
      const { limit = 100, offset = 0 } = options;
      return await db.select().from(aiTasks)
        .orderBy(desc(aiTasks.createdAt))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error("Error getting tasks:", error);
      return [];
    }
  }

  async getKnowledgeBaseByCategory(category: string) {
    try {
      console.log(`[DB] getKnowledgeBaseByCategory called for: ${category}`);
      const result = await sql`
        SELECT * FROM knowledge_base
        WHERE category = ${category} AND is_published = true
        ORDER BY created_at DESC
      `;
      console.log(`[DB] Found ${result.length} articles in category ${category}`);
      return result;
    } catch (error) {
      console.error(`[DB] Error getting knowledge articles by category ${category}:`, error);
      return [];
    }
  }

  async addKnowledgeArticle(data: any) {
    try {
      console.log('[DB] Adding knowledge article:', data.title);
      const result = await sql`
        INSERT INTO knowledge_base (title, content, category, tags, is_published, created_at)
        VALUES (${data.title}, ${data.content}, ${data.category}, ${JSON.stringify(data.tags || [])}, ${data.isPublished || false}, NOW())
        RETURNING *
      `;
      console.log('[DB] Knowledge article added successfully');
      return result[0];
    } catch (error) {
      console.error('[DB] Error adding knowledge article:', error);
      throw error;
    }
  }

  async createKnowledgeArticle(data: any) {
    return this.addKnowledgeArticle(data);
  }

  async updateDataSourceLastSync(id: string, lastSync: Date) {
    try {
      console.log(`[DB] Updating last sync for data source ${id} to ${lastSync.toISOString()}`);
      const result = await sql`
        UPDATE data_sources
        SET last_sync_at = ${lastSync.toISOString()}
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.length === 0) {
        console.warn(`[DB] No data source found with id: ${id}`);
        return null;
      }

      console.log(`[DB] Successfully updated last sync for ${id}`);
      return result[0];
    } catch (error: any) {
      console.error(`[DB] Error updating last sync for ${id}:`, error);
      throw error;
    }
  }

  async getDataSourceById(id: string) {
    try {
      console.log(`[DB] Getting data source by id: ${id}`);
      const result = await sql`SELECT * FROM data_sources WHERE id = ${id}`;

      if (result.length === 0) {
        console.warn(`[DB] No data source found with id: ${id}`);
        return null;
      }

      const record = result[0];
      if (!record) {
        console.warn(`[DB] Invalid record for data source id: ${id}`);
        return null;
      }

      return {
        id: record.id,
        name: record.name,
        type: record.type,
        endpoint: record.endpoint,
        isActive: record.is_active,
        lastSync: record.last_sync_at
      };
    } catch (error: any) {
      console.error(`[DB] Error getting data source by id ${id}:`, error);
      throw error;
    }
  }

  async getDataSources(): Promise<any[]> {
    try {
      console.log('[STORAGE] Fetching data sources...');
      const result = await sql`SELECT id, name, type, country, is_active, created_at, api_endpoint FROM data_sources ORDER BY name`;
      console.log(`[STORAGE] Data sources fetched: ${result.length} items`);
      return Array.isArray(result) ? result : [];
    } catch (error: any) {
      console.error('[STORAGE] Data sources fetch failed:', error);

      // FALLBACK: Default data sources wenn DB fehlschlägt
      return [
        {
          id: 'fda_510k',
          name: 'FDA 510(k) Clearances',
          description: 'FDA medical device clearances',
          type: 'api',
          country: 'US',
          is_active: true,
          isActive: true,
          created_at: new Date(),
          updated_at: new Date(),
          endpoint: "https://api.fda.gov/device/510k.json"
        },
        {
          id: 'fda_recalls',
          name: 'FDA Device Recalls',
          description: 'FDA medical device recalls',
          type: 'api',
          country: 'US',
          is_active: true,
          isActive: true,
          created_at: new Date(),
          updated_at: new Date(),
          endpoint: "https://api.fda.gov/device/recall.json"
        }
      ];
    }
  }

  async getDataSourceByType(type: string) {
    try {
      console.log(`[DB] Getting data source by type: ${type}`);
      const result = await sql`SELECT * FROM data_sources WHERE type = ${type} LIMIT 1`;

      if (result.length === 0) {
        console.warn(`[DB] No data source found with type: ${type}`);
        return null;
      }

      const record = result[0];
      if (!record) {
        console.warn(`[DB] Invalid record for data source type: ${type}`);
        return null;
      }

      return {
        id: record.id,
        name: record.name,
        type: record.type,
        endpoint: record.endpoint,
        isActive: record.is_active,
        lastSync: record.last_sync_at
      };
    } catch (error: any) {
      console.error(`[DB] Error getting data source by type ${type}:`, error);
      throw error;
    }
  }

  async deleteKnowledgeArticle(id: string): Promise<boolean> {
    try {
      console.log(`[DB] Deleting knowledge article with ID: ${id}`);

      // Since we don't have a knowledge articles table yet,
      // this is a no-op that returns true for compatibility
      return true;
    } catch (error) {
      console.error('[DB] Error deleting knowledge article:', error);
      return false;
    }
  }
  async countRegulatoryUpdatesBySource(sourceId: string): Promise<number> {
    try {
      const result = await sql`
        SELECT COUNT(*) as count
        FROM regulatory_updates
        WHERE source_id = ${sourceId}
      `;
      return parseInt(result[0]?.count || '0');
    } catch (error) {
      console.error('[DB ERROR] Count regulatory updates by source failed:', error);
      return 0;
    }
  }

  // Chat Board Implementation für Tenant-Administrator-Kommunikation
  async getChatMessagesByTenant(tenantId: string) {
    try {
      console.log(`[CHAT] Getting messages for tenant: ${tenantId}`);
      const result = await sql`
        SELECT cm.*, t.name as tenant_name, t.subdomain
        FROM chat_messages cm
        LEFT JOIN tenants t ON cm.tenant_id = t.id
        WHERE cm.tenant_id = ${tenantId}
        ORDER BY cm.created_at DESC
      `;
      console.log(`[CHAT] Found ${result.length} messages for tenant ${tenantId}`);
      return result;
    } catch (error) {
      console.error("[CHAT] Get messages error:", error);
      return [];
    }
  }

  async createChatMessage(data: any) {
    try {
      console.log('[CHAT] Creating new message:', data);
      const result = await sql`
        INSERT INTO chat_messages (
          tenant_id, sender_id, sender_type, sender_name, sender_email,
          message_type, subject, message, priority, attachments, metadata
        )
        VALUES (
          ${data.tenantId}, ${data.senderId}, ${data.senderType},
          ${data.senderName}, ${data.senderEmail}, ${data.messageType || 'message'},
          ${data.subject}, ${data.message}, ${data.priority || 'normal'},
          ${JSON.stringify(data.attachments || [])}, ${JSON.stringify(data.metadata || {})}
        )
        RETURNING *
      `;
      console.log('[CHAT] Message created:', result[0].id);
      return result[0];
    } catch (error) {
      console.error("[CHAT] Create message error:", error);
      throw error;
    }
  }

  async updateChatMessageStatus(id: string, status: string, readAt?: Date) {
    try {
      console.log(`[CHAT] Updating message ${id} status to: ${status}`);
      const result = await sql`
        UPDATE chat_messages
        SET status = ${status},
            read_at = ${readAt || (status === 'read' ? new Date() : null)},
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0];
    } catch (error) {
      console.error("[CHAT] Update status error:", error);
      throw error;
    }
  }

  async getUnreadChatMessagesCount(tenantId?: string) {
    try {
      let query;
      if (tenantId) {
        query = sql`SELECT COUNT(*) as count FROM chat_messages WHERE status = 'unread' AND tenant_id = ${tenantId}`;
      } else {
        query = sql`SELECT COUNT(*) as count FROM chat_messages WHERE status = 'unread'`;
      }
      const result = await query;
      return parseInt(result[0].count) || 0;
    } catch (error) {
      console.error("[CHAT] Unread count error:", error);
      return 0;
    }
  }

  async getAllChatMessages() {
    try {
      console.log('[CHAT] Getting all messages for admin overview');
      const result = await sql`
        SELECT cm.*, t.name as tenant_name, t.subdomain, t.color_scheme
        FROM chat_messages cm
        LEFT JOIN tenants t ON cm.tenant_id = t.id
        ORDER BY cm.created_at DESC
      `;
      console.log(`[CHAT] Found ${result.length} total messages`);
      return result;
    } catch (error) {
      console.error("[CHAT] Get all messages error:", error);
      return [];
    }
  }

  async getChatConversationsByTenant(tenantId: string) {
    try {
      console.log(`[CHAT] Getting conversations for tenant: ${tenantId}`);
      const result = await sql`
        SELECT * FROM chat_conversations
        WHERE tenant_id = ${tenantId}
        ORDER BY last_message_at DESC
      `;
      return result;
    } catch (error) {
      console.error("[CHAT] Get conversations error:", error);
      return [];
    }
  }

  async createChatConversation(data: any) {
    try {
      console.log('[CHAT] Creating new conversation:', data);
      const result = await sql`
        INSERT INTO chat_conversations (
          tenant_id, subject, status, priority, participant_ids, metadata
        )
        VALUES (
          ${data.tenantId}, ${data.subject}, ${data.status || 'open'},
          ${data.priority || 'normal'}, ${JSON.stringify(data.participantIds || [])},
          ${JSON.stringify(data.metadata || {})}
        )
        RETURNING *
      `;
      return result[0];
    } catch (error) {
      console.error("[CHAT] Create conversation error:", error);
      throw error;
    }
  }

  async updateChatConversation(id: string, updates: any) {
    try {
      console.log(`[CHAT] Updating conversation ${id}:`, updates);
      const result = await sql`
        UPDATE chat_conversations
        SET status = COALESCE(${updates.status}, status),
            last_message_at = COALESCE(${updates.lastMessageAt}, last_message_at),
            message_count = COALESCE(${updates.messageCount}, message_count),
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0];
    } catch (error) {
      console.error("[CHAT] Update conversation error:", error);
      throw error;
    }
  }

  // ============================================================================
  // BEREICH 3: PROJECT MANAGEMENT - REAL DATABASE QUERIES ONLY
  // ============================================================================

  async getAllProjects() {
    try {
      console.log('[DB] getAllProjects called');
      const projects = await sql`
        SELECT
          id, name, description, device_type, device_class, intended_use, therapeutic_area,
          status, risk_level, priority, start_date, target_submission_date,
          estimated_approval_date, actual_completion_date,
          estimated_cost_total, estimated_cost_development, estimated_cost_regulatory, estimated_cost_testing,
          actual_cost_total, similar_devices_found, regulatory_requirements,
          compliance_checklist, risk_assessment, tags, metadata, created_at, updated_at
        FROM projects
        ORDER BY priority DESC, created_at DESC
      `;
      console.log(`[DB] Fetched ${projects.length} projects from database`);
      return projects;
    } catch (error) {
      console.error('[DB ERROR] getAllProjects failed:', error);
      return [];
    }
  }

  async getProjectById(id: string) {
    try {
      console.log(`[DB] getProjectById called for ID: ${id}`);
      const result = await sql`
        SELECT
          id, name, description, device_type, device_class, intended_use, therapeutic_area,
          status, risk_level, priority, start_date, target_submission_date,
          estimated_approval_date, actual_completion_date,
          estimated_cost_total, estimated_cost_development, estimated_cost_regulatory, estimated_cost_testing,
          actual_cost_total, similar_devices_found, regulatory_requirements,
          compliance_checklist, risk_assessment, tags, metadata, created_at, updated_at
        FROM projects
        WHERE id = ${id}
      `;

      if (result.length === 0) {
        console.log(`[DB] No project found with ID: ${id}`);
        return null;
      }

      console.log(`[DB] Project found: ${result[0].name}`);
      return result[0];
    } catch (error) {
      console.error(`[DB ERROR] getProjectById failed for ID ${id}:`, error);
      return null;
    }
  }

  async createProject(data: any) {
    try {
      console.log('[DB] createProject called:', data.name);
      
      // Parse metadata if it's a string
      let metadata = data.metadata;
      if (typeof metadata === 'string') {
        try {
          metadata = JSON.parse(metadata);
        } catch (e) {
          metadata = {};
        }
      }
      
      // Extract target_markets from metadata or data
      let targetMarkets = data.targetMarkets || metadata?.targetMarkets || [];
      
      // Ensure targetMarkets is an array
      if (!Array.isArray(targetMarkets)) {
        if (typeof targetMarkets === 'string') {
          try {
            targetMarkets = JSON.parse(targetMarkets);
          } catch (e) {
            targetMarkets = [targetMarkets];
          }
        } else {
          targetMarkets = [];
        }
      }
      
      // Extract estimated_approval_date from metadata or data
      const estimatedApprovalDate = data.estimatedApprovalDate || metadata?.estimatedApprovalDate || null;
      
      // Convert targetMarkets array to PostgreSQL array format
      const targetMarketsPg = targetMarkets.length > 0 
        ? sql`${targetMarkets}::text[]`
        : sql`ARRAY[]::text[]`;
      
      const result = await sql`
        INSERT INTO projects (
          name, description, device_type, device_class, intended_use, therapeutic_area,
          status, risk_level, priority, start_date, target_submission_date, estimated_approval_date,
          target_markets, metadata,
          estimated_cost_total, estimated_cost_development, estimated_cost_regulatory, estimated_cost_testing,
          similar_devices_found, regulatory_requirements, compliance_checklist, risk_assessment
        ) VALUES (
          ${data.name}, ${data.description}, ${data.deviceType}, ${data.deviceClass},
          ${data.intendedUse}, ${data.therapeuticArea}, ${data.status || 'planning'},
          ${data.riskLevel || 'medium'}, ${data.priority || 1}, ${data.startDate},
          ${data.targetSubmissionDate}, ${estimatedApprovalDate},
          ${targetMarketsPg}, ${JSON.stringify(metadata || {})},
          ${data.estimatedCostTotal || 0},
          ${data.estimatedCostDevelopment || 0}, ${data.estimatedCostRegulatory || 0},
          ${data.estimatedCostTesting || 0}, ${JSON.stringify(data.similarDevicesFound || [])},
          ${JSON.stringify(data.regulatoryRequirements || [])},
          ${JSON.stringify(data.complianceChecklist || [])},
          ${JSON.stringify(data.riskAssessment || {})}
        )
        RETURNING *
      `;
      console.log('[DB] Project created successfully:', result[0].id);
      return result[0];
    } catch (error) {
      console.error('[DB ERROR] createProject failed:', error);
      throw error;
    }
  }

  async updateProject(id: string, updates: any) {
    try {
      console.log(`[DB] updateProject called for ID: ${id}`);
      const result = await sql`
        UPDATE projects
        SET
          name = COALESCE(${updates.name}, name),
          description = COALESCE(${updates.description}, description),
          status = COALESCE(${updates.status}, status),
          risk_level = COALESCE(${updates.riskLevel}, risk_level),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.length === 0) {
        console.log(`[DB] No project found to update with ID: ${id}`);
        return null;
      }

      console.log('[DB] Project updated successfully');
      return result[0];
    } catch (error) {
      console.error(`[DB ERROR] updateProject failed for ID ${id}:`, error);
      throw error;
    }
  }

  async deleteProject(id: string) {
    try {
      console.log(`[DB] deleteProject called for ID: ${id}`);
      await sql`DELETE FROM projects WHERE id = ${id}`;
      console.log('[DB] Project deleted successfully');
      return true;
    } catch (error) {
      console.error(`[DB ERROR] deleteProject failed for ID ${id}:`, error);
      return false;
    }
  }

  // ============================================================================
  // REGULATORY PATHWAYS & INTELLIGENT PROJECT CREATION
  // ============================================================================

  async getAllRegulatoryPathways() {
    try {
      console.log('[DB] getAllRegulatoryPathways called');
      const pathways = await sql`
        SELECT
          id, name, type, description, jurisdiction, device_classes,
          average_timeline_months, min_timeline_months, max_timeline_months,
          average_cost_usd, min_cost_usd, max_cost_usd,
          cost_breakdown, required_phases, clinical_data_required,
          notified_body_required, qms_required, success_rate,
          common_delays, critical_success_factors, source_url,
          last_updated, is_active, metadata, created_at
        FROM regulatory_pathways
        WHERE is_active = true
        ORDER BY jurisdiction, type
      `;
      console.log(`[DB] Fetched ${pathways.length} regulatory pathways`);
      return pathways;
    } catch (error) {
      console.error('[DB ERROR] getAllRegulatoryPathways failed:', error);
      return [];
    }
  }

  async getRegulatoryPathwayById(id: string) {
    try {
      console.log(`[DB] getRegulatoryPathwayById called for ID: ${id}`);
      const result = await sql`
        SELECT * FROM regulatory_pathways WHERE id = ${id}
      `;
      return result[0] || null;
    } catch (error) {
      console.error(`[DB ERROR] getRegulatoryPathwayById failed:`, error);
      return null;
    }
  }

  async createProjectWithPhases(data: any) {
    try {
      console.log('[DB] createProjectWithPhases called:', data.name);

      // 1. Create the project
      const projectResult = await sql`
        INSERT INTO projects (
          tenant_id, user_id, name, description, device_type, device_class,
          intended_use, therapeutic_area, regulatory_pathway_id, target_markets,
          status, risk_level, priority, start_date, target_submission_date,
          estimated_cost_total, estimated_cost_development, estimated_cost_regulatory,
          estimated_cost_testing
        ) VALUES (
          ${data.tenantId}, ${data.userId}, ${data.name}, ${data.description},
          ${data.deviceType}, ${data.deviceClass}, ${data.intendedUse},
          ${data.therapeuticArea}, ${data.regulatoryPathwayId}, ${JSON.stringify(data.targetMarkets || [])},
          ${data.status || 'planning'}, ${data.riskLevel || 'medium'},
          ${data.priority || 1}, ${data.startDate || new Date()},
          ${data.targetSubmissionDate}, ${data.estimatedCostTotal || 0},
          ${data.estimatedCostDevelopment || 0}, ${data.estimatedCostRegulatory || 0},
          ${data.estimatedCostTesting || 0}
        )
        RETURNING *
      `;

      const project = projectResult[0];
      console.log('[DB] Project created successfully:', project.id);

      // 2. Get the regulatory pathway to generate phases
      const pathway = await this.getRegulatoryPathwayById(data.regulatoryPathwayId);

      let phases = [];
      if (pathway && pathway.required_phases) {
        console.log(`[DB] Generating ${pathway.required_phases.length} phases from pathway`);

        // 3. Generate phases based on regulatory pathway
        for (let i = 0; i < pathway.required_phases.length; i++) {
          const phaseTemplate = pathway.required_phases[i];

          const phaseResult = await sql`
            INSERT INTO project_phases (
              project_id, tenant_id, name, description, phase_number,
              estimated_duration_days, estimated_cost, status,
              required_documents, deliverables, is_auto_generated, metadata
            ) VALUES (
              ${project.id}, ${data.tenantId}, ${phaseTemplate.name},
              ${phaseTemplate.description || ''}, ${i + 1},
              ${phaseTemplate.duration_days || 0}, ${phaseTemplate.cost || 0},
              'not_started', ${JSON.stringify(phaseTemplate.requiredDocuments || [])},
              ${JSON.stringify(phaseTemplate.deliverables || [])}, true,
              ${JSON.stringify({ source: 'regulatory_pathway', pathwayId: pathway.id })}
            )
            RETURNING *
          `;

          phases.push(phaseResult[0]);
        }

        console.log(`[DB] Created ${phases.length} phases for project ${project.id}`);
      } else {
        console.log('[DB] No regulatory pathway or phases defined, creating project without phases');
      }

      return { project, phases };
    } catch (error) {
      console.error('[DB ERROR] createProjectWithPhases failed:', error);
      throw error;
    }
  }

  async getProjectPhases(projectId: string) {
    try {
      console.log(`[DB] getProjectPhases called for project: ${projectId}`);
      const phases = await sql`
        SELECT
          id, project_id, name, description, phase_number,
          estimated_duration_days, actual_duration_days,
          start_date, end_date, target_end_date,
          estimated_cost, actual_cost, status, progress_percentage,
          depends_on_phases, blocking_issues, required_documents,
          deliverables, completed_deliverables, is_auto_generated,
          metadata, created_at, updated_at
        FROM project_phases
        WHERE project_id = ${projectId}
        ORDER BY phase_number ASC
      `;
      console.log(`[DB] Fetched ${phases.length} phases for project ${projectId}`);
      return phases;
    } catch (error) {
      console.error('[DB ERROR] getProjectPhases failed:', error);
      return [];
    }
  }

  async updateProjectPhase(phaseId: string, updates: any) {
    try {
      console.log(`[DB] updateProjectPhase called for phase: ${phaseId}`);
      const result = await sql`
        UPDATE project_phases
        SET
          status = COALESCE(${updates.status}, status),
          progress_percentage = COALESCE(${updates.progressPercentage}, progress_percentage),
          start_date = COALESCE(${updates.startDate}, start_date),
          end_date = COALESCE(${updates.endDate}, end_date),
          actual_duration_days = COALESCE(${updates.actualDurationDays}, actual_duration_days),
          actual_cost = COALESCE(${updates.actualCost}, actual_cost),
          completed_deliverables = COALESCE(${JSON.stringify(updates.completedDeliverables)}, completed_deliverables),
          blocking_issues = COALESCE(${JSON.stringify(updates.blockingIssues)}, blocking_issues),
          updated_at = NOW()
        WHERE id = ${phaseId}
        RETURNING *
      `;

      if (result.length === 0) {
        console.log(`[DB] No phase found to update with ID: ${phaseId}`);
        return null;
      }

      console.log('[DB] Phase updated successfully');
      return result[0];
    } catch (error) {
      console.error(`[DB ERROR] updateProjectPhase failed:`, error);
      throw error;
    }
  }

  // Regulatory Update Evaluation Methods
  async getRegulatoryUpdateEvaluation(regulatoryUpdateId: string) {
    try {
      const result = await sql`
        SELECT * FROM regulatory_update_evaluations
        WHERE regulatory_update_id = ${regulatoryUpdateId}
        LIMIT 1
      `;
      return result[0] || null;
    } catch (error) {
      console.error('[DB ERROR] getRegulatoryUpdateEvaluation:', error);
      return null;
    }
  }

  async upsertRegulatoryUpdateEvaluation(data: any) {
    try {
      const existing = await this.getRegulatoryUpdateEvaluation(data.regulatoryUpdateId);
      if (existing) {
        const updated = await sql`
          UPDATE regulatory_update_evaluations
          SET
            tenant_id = ${data.tenantId},
            evaluation_status = ${data.evaluationStatus || 'draft'},
            obligation_summary = ${data.obligationSummary || null},
            required_actions = ${JSON.stringify(data.requiredActions || [])},
            document_references = ${JSON.stringify(data.documentReferences || [])},
            cost_reference_ids = ${JSON.stringify(data.costReferenceIds || [])},
            timeline_estimate_months = ${data.timelineEstimateMonths || null},
            authority_sources = ${JSON.stringify(data.authoritySources || [])},
            verification_log = ${JSON.stringify(data.verificationLog || [])},
            version = version + 1,
            updated_at = NOW()
          WHERE regulatory_update_id = ${data.regulatoryUpdateId}
          RETURNING *
        `;
        return updated[0];
      } else {
        const created = await sql`
          INSERT INTO regulatory_update_evaluations (
            regulatory_update_id, tenant_id, evaluation_status,
            obligation_summary, required_actions, document_references,
            cost_reference_ids, timeline_estimate_months, authority_sources,
            verification_log
          ) VALUES (
            ${data.regulatoryUpdateId}, ${data.tenantId}, ${data.evaluationStatus || 'draft'},
            ${data.obligationSummary || null}, ${JSON.stringify(data.requiredActions || [])},
            ${JSON.stringify(data.documentReferences || [])}, ${JSON.stringify(data.costReferenceIds || [])},
            ${data.timelineEstimateMonths || null}, ${JSON.stringify(data.authoritySources || [])},
            ${JSON.stringify(data.verificationLog || [])}
          ) RETURNING *
        `;
        return created[0];
      }
    } catch (error) {
      console.error('[DB ERROR] upsertRegulatoryUpdateEvaluation:', error);
      throw error;
    }
  }

  // Cost Items Methods
  async getCostItems() {
    try {
      const items = await sql`SELECT * FROM cost_items ORDER BY created_at DESC`;
      return items;
    } catch (error) {
      console.error('[DB ERROR] getCostItems:', error);
      return [];
    }
  }

  async createCostItem(data: any) {
    try {
      const created = await sql`
        INSERT INTO cost_items (
          tenant_id, jurisdiction, authority_ref, fee_type, description,
          amount_minor_unit, currency, valid_from, valid_to, source_url,
          evidence_document_id, verification_status
        ) VALUES (
          ${data.tenantId}, ${data.jurisdiction}, ${data.authorityRef},
          ${data.feeType}, ${data.description}, ${data.amountMinorUnit},
          ${data.currency}, ${data.validFrom || null}, ${data.validTo || null},
          ${data.sourceUrl}, ${data.evidenceDocumentId || null},
          ${data.verificationStatus || 'unverified'}
        ) RETURNING *
      `;
      return created[0];
    } catch (error) {
      console.error('[DB ERROR] createCostItem:', error);
      throw error;
    }
  }

  // Normative Actions Methods
  async getNormativeActions(regulatoryUpdateId: string) {
    try {
      const actions = await sql`
        SELECT * FROM normative_actions
        WHERE regulatory_update_id = ${regulatoryUpdateId}
        ORDER BY action_code ASC
      `;
      return actions;
    } catch (error) {
      console.error('[DB ERROR] getNormativeActions:', error);
      return [];
    }
  }

  async createNormativeAction(data: any) {
    try {
      const created = await sql`
        INSERT INTO normative_actions (
          tenant_id, regulatory_update_id, clause_ref, action_code,
          action_description, required_documents, dependencies,
          estimated_effort_hours, authority_category, verification_status
        ) VALUES (
          ${data.tenantId}, ${data.regulatoryUpdateId}, ${data.clauseRef},
          ${data.actionCode}, ${data.actionDescription},
          ${JSON.stringify(data.requiredDocuments || [])},
          ${JSON.stringify(data.dependencies || [])},
          ${data.estimatedEffortHours || null}, ${data.authorityCategory || null},
          ${data.verificationStatus || 'pending'}
        ) RETURNING *
      `;
      return created[0];
    } catch (error) {
      console.error('[DB ERROR] createNormativeAction:', error);
      throw error;
    }
  }

  async updateNormativeAction(actionCode: string, data: any) {
    try {
      const updated = await sql`
        UPDATE normative_actions
        SET
          action_description = ${data.actionDescription},
          required_documents = ${JSON.stringify(data.requiredDocuments || [])},
          dependencies = ${JSON.stringify(data.dependencies || [])},
          estimated_effort_hours = ${data.estimatedEffortHours || null},
          authority_category = ${data.authorityCategory || null},
          verification_status = ${data.verificationStatus || 'pending'},
          updated_at = NOW()
        WHERE action_code = ${actionCode} AND regulatory_update_id = ${data.regulatoryUpdateId}
        RETURNING *
      `;
      return updated[0] || null;
    } catch (error) {
      console.error('[DB ERROR] updateNormativeAction:', error);
      throw error;
    }
  }
}

const storageInstance = new MorningStorage();

// Export the storage instance
export const storage = storageInstance;

// Export the createOrUpdateDataSource as an alias to createDataSource (which already does upsert)
export const createOrUpdateDataSource = storageInstance.createDataSource.bind(storageInstance);
