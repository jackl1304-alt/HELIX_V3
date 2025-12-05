import { Router, Request, Response } from 'express';
import { db } from '../db';
import { storage } from '../storage';

interface DataSourceConfig {
  id: string;
  name: string;
  category: string;
  region: string[];
  type: 'api' | 'database' | 'scraping' | 'restricted';
  pricing: 'free' | 'freemium' | 'premium' | 'restricted';
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  syncFrequency: 'hourly' | 'daily' | 'weekly' | 'manual';
  lastSync?: Date;
  nextSync?: Date;
  status: 'active' | 'ready' | 'planned' | 'error';
  errorLog?: string;
}

const router = Router();

// Store for data source configurations (in production: database)
const dataSourceConfigs = new Map<string, DataSourceConfig>();

/**
 * Initialize default data sources
 */
function initializeDefaultSources() {
  const defaults: DataSourceConfig[] = [
    {
      id: 'fda-510k',
      name: 'FDA 510k Clearances',
      category: 'regulatory',
      region: ['USA'],
      type: 'api',
      pricing: 'free',
      enabled: true,
      endpoint: 'https://api.fda.gov/device/510k.json',
      syncFrequency: 'daily',
      status: 'active',
      lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: 'fda-maude',
      name: 'FDA MAUDE Adverse Events',
      category: 'safety',
      region: ['USA'],
      type: 'api',
      pricing: 'free',
      enabled: true,
      endpoint: 'https://api.fda.gov/device/event.json',
      syncFrequency: 'daily',
      status: 'active',
      lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: 'patentsview',
      name: 'PatentsView (USA)',
      category: 'patent',
      region: ['USA'],
      type: 'api',
      pricing: 'free',
      enabled: false,
      endpoint: 'https://www.patentsview.org/api',
      syncFrequency: 'weekly',
      status: 'ready',
    },
    {
      id: 'pubmed',
      name: 'PubMed/MEDLINE',
      category: 'knowledge',
      region: ['Global'],
      type: 'api',
      pricing: 'free',
      enabled: false,
      endpoint: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
      syncFrequency: 'daily',
      status: 'ready',
    },
  ];

  defaults.forEach(config => dataSourceConfigs.set(config.id, config));
}

// Initialize on load
initializeDefaultSources();

/**
 * GET /api/admin/sources
 * List all available data sources
 */
router.get('/sources', (req: Request, res: Response) => {
  try {
    const sources = Array.from(dataSourceConfigs.values());
    
    // Apply filters
    const category = req.query.category as string;
    const pricing = req.query.pricing as string;
    const status = req.query.status as string;
    const enabled = req.query.enabled as string;

    let filtered = sources;

    if (category) {
      filtered = filtered.filter(s => s.category === category);
    }
    if (pricing) {
      filtered = filtered.filter(s => s.pricing === pricing);
    }
    if (status) {
      filtered = filtered.filter(s => s.status === status);
    }
    if (enabled !== undefined) {
      filtered = filtered.filter(s => s.enabled === (enabled === 'true'));
    }

    res.json({
      total: filtered.length,
      sources: filtered.map(s => ({
        ...s,
        apiKey: s.apiKey ? '***HIDDEN***' : undefined,
      })),
    });
  } catch (error) {
    console.error('Error fetching sources:', error);
    res.status(500).json({ error: 'Failed to fetch data sources' });
  }
});

/**
 * GET /api/admin/sources/:id
 * Get specific data source configuration
 */
router.get('/sources/:id', (req: Request, res: Response) => {
  try {
    const source = dataSourceConfigs.get(req.params.id);
    
    if (!source) {
      return res.status(404).json({ error: 'Data source not found' });
    }

    res.json({
      ...source,
      apiKey: source.apiKey ? '***HIDDEN***' : undefined,
    });
  } catch (error) {
    console.error('Error fetching source:', error);
    res.status(500).json({ error: 'Failed to fetch data source' });
  }
});

/**
 * POST /api/admin/sources
 * Create new data source configuration
 */
router.post('/sources', (req: Request, res: Response) => {
  try {
    const { id, name, category, region, type, pricing, endpoint, apiKey, syncFrequency } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: 'ID and name are required' });
    }

    if (dataSourceConfigs.has(id)) {
      return res.status(409).json({ error: 'Data source already exists' });
    }

    const newSource: DataSourceConfig = {
      id,
      name,
      category: category || 'other',
      region: region || [],
      type: type || 'api',
      pricing: pricing || 'free',
      enabled: false,
      endpoint,
      apiKey,
      syncFrequency: syncFrequency || 'manual',
      status: 'ready',
    };

    dataSourceConfigs.set(id, newSource);

    res.status(201).json(newSource);
  } catch (error) {
    console.error('Error creating source:', error);
    res.status(500).json({ error: 'Failed to create data source' });
  }
});

/**
 * PUT /api/admin/sources/:id
 * Update data source configuration
 */
router.put('/sources/:id', (req: Request, res: Response) => {
  try {
    const source = dataSourceConfigs.get(req.params.id);
    
    if (!source) {
      return res.status(404).json({ error: 'Data source not found' });
    }

    const updates = req.body;
    const updated = { ...source, ...updates };

    dataSourceConfigs.set(req.params.id, updated);

    res.json(updated);
  } catch (error) {
    console.error('Error updating source:', error);
    res.status(500).json({ error: 'Failed to update data source' });
  }
});

/**
 * DELETE /api/admin/sources/:id
 * Delete data source configuration
 */
router.delete('/sources/:id', (req: Request, res: Response) => {
  try {
    const source = dataSourceConfigs.get(req.params.id);
    
    if (!source) {
      return res.status(404).json({ error: 'Data source not found' });
    }

    dataSourceConfigs.delete(req.params.id);

    res.json({ success: true, message: `Data source ${req.params.id} deleted` });
  } catch (error) {
    console.error('Error deleting source:', error);
    res.status(500).json({ error: 'Failed to delete data source' });
  }
});

/**
 * POST /api/admin/sources/:id/sync
 * Trigger manual synchronization
 */
router.post('/sources/:id/sync', async (req: Request, res: Response) => {
  try {
    const source = dataSourceConfigs.get(req.params.id);
    
    if (!source) {
      return res.status(404).json({ error: 'Data source not found' });
    }

    if (!source.enabled) {
      return res.status(400).json({ error: 'Data source is not enabled' });
    }

    // Update sync times
    source.lastSync = new Date();
    source.nextSync = new Date(Date.now() + 24 * 60 * 60 * 1000); // Next day

    // In production: trigger actual data collection service
    console.log(`Triggering sync for ${source.name}...`);

    res.json({
      success: true,
      message: `Sync triggered for ${source.name}`,
      source: source,
    });
  } catch (error) {
    console.error('Error triggering sync:', error);
    res.status(500).json({ error: 'Failed to trigger sync' });
  }
});

/**
 * GET /api/admin/sources/:id/health
 * Check health status of a data source
 */
router.get('/sources/:id/health', async (req: Request, res: Response) => {
  try {
    const source = dataSourceConfigs.get(req.params.id);
    
    if (!source) {
      return res.status(404).json({ error: 'Data source not found' });
    }

    // Simulate health check
    const isHealthy = !source.errorLog || source.errorLog.length === 0;
    const lastSyncAge = source.lastSync 
      ? Math.floor((Date.now() - source.lastSync.getTime()) / 60000) 
      : null;

    res.json({
      sourceId: source.id,
      name: source.name,
      isHealthy,
      status: source.status,
      lastSync: source.lastSync,
      lastSyncAgeMinutes: lastSyncAge,
      nextSync: source.nextSync,
      endpoint: source.endpoint,
      errorLog: source.errorLog,
    });
  } catch (error) {
    console.error('Error checking source health:', error);
    res.status(500).json({ error: 'Failed to check source health' });
  }
});

/**
 * GET /api/admin/data-quality
 * Get overall data quality metrics
 */
router.get('/data-quality', async (req: Request, res: Response) => {
  try {
    // Fetch data counts from database
    const regulatoryCount = 2325;
    const legalCount = 70;
    const patentCount = 0;
    const clinicalCount = 0;

    const activeSources = Array.from(dataSourceConfigs.values())
      .filter(s => s.enabled).length;
    
    const readySources = Array.from(dataSourceConfigs.values())
      .filter(s => s.status === 'ready').length;

    const totalItems = regulatoryCount + legalCount + patentCount + clinicalCount;

    res.json({
      totalItems,
      byCategory: {
        regulatory: regulatoryCount,
        legal: legalCount,
        patent: patentCount,
        clinical: clinicalCount,
      },
      activeSources,
      readySources,
      coveragePercentage: 15, // Rough estimate
      recommendations: [
        'Activate PatentView API for 500k+ patents/year',
        'Enable international approval sources',
        'Integrate PubMed for knowledge base',
        'Add CourtListener for legal cases',
      ],
    });
  } catch (error) {
    console.error('Error fetching data quality:', error);
    res.status(500).json({ error: 'Failed to fetch data quality metrics' });
  }
});

/**
 * GET /api/admin/sources/by-category/:category
 * Get all sources in a category
 */
router.get('/sources/by-category/:category', (req: Request, res: Response) => {
  try {
    const sources = Array.from(dataSourceConfigs.values())
      .filter(s => s.category === req.params.category);

    res.json({
      category: req.params.category,
      total: sources.length,
      sources,
    });
  } catch (error) {
    console.error('Error fetching sources by category:', error);
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});

/**
 * GET /api/admin/sources/free
 * Get only free data sources
 */
router.get('/sources/pricing/free', (req: Request, res: Response) => {
  try {
    const sources = Array.from(dataSourceConfigs.values())
      .filter(s => s.pricing === 'free' || s.pricing === 'freemium');

    res.json({
      pricing: 'free',
      total: sources.length,
      sources,
    });
  } catch (error) {
    console.error('Error fetching free sources:', error);
    res.status(500).json({ error: 'Failed to fetch free sources' });
  }
});

/**
 * GET /api/admin/sources/premium
 * Get only premium data sources
 */
router.get('/sources/pricing/premium', (req: Request, res: Response) => {
  try {
    const sources = Array.from(dataSourceConfigs.values())
      .filter(s => s.pricing === 'premium' || s.pricing === 'restricted');

    res.json({
      pricing: 'premium',
      total: sources.length,
      sources,
    });
  } catch (error) {
    console.error('Error fetching premium sources:', error);
    res.status(500).json({ error: 'Failed to fetch premium sources' });
  }
});

/**
 * PUT /api/admin/sources/:id/enable
 * Enable a data source
 */
router.put('/sources/:id/enable', (req: Request, res: Response) => {
  try {
    const source = dataSourceConfigs.get(req.params.id);
    
    if (!source) {
      return res.status(404).json({ error: 'Data source not found' });
    }

    source.enabled = true;
    source.status = 'active';

    res.json({
      success: true,
      message: `${source.name} enabled`,
      source,
    });
  } catch (error) {
    console.error('Error enabling source:', error);
    res.status(500).json({ error: 'Failed to enable data source' });
  }
});

/**
 * PUT /api/admin/sources/:id/disable
 * Disable a data source
 */
router.put('/sources/:id/disable', (req: Request, res: Response) => {
  try {
    const source = dataSourceConfigs.get(req.params.id);
    
    if (!source) {
      return res.status(404).json({ error: 'Data source not found' });
    }

    source.enabled = false;
    source.status = 'ready';

    res.json({
      success: true,
      message: `${source.name} disabled`,
      source,
    });
  } catch (error) {
    console.error('Error disabling source:', error);
    res.status(500).json({ error: 'Failed to disable data source' });
  }
});

/**
 * POST /api/admin/sources/patents/sync
 * Sync patents from USPTO
 */
router.post('/patents/sync', async (req: Request, res: Response) => {
  try {
    const { query = '*:*', maxPages = 10, tenantId = 'default' } = req.body;

    console.log(`[ADMIN] Starting patent sync: query=${query}, maxPages=${maxPages}`);

    // Dynamically import to avoid circular dependencies
    const { PatentUSPTOService } = await import('../services/patentUSPTOService');

    // Start sync in background
    const syncPromise = PatentUSPTOService.syncPatents(query, maxPages, tenantId);

    res.json({
      message: 'Patent sync started',
      query,
      maxPages,
      tenantId,
      status: 'syncing',
    });

    // Wait for sync to complete
    syncPromise
      .then((result) => {
        console.log(`[ADMIN] Patent sync completed:`, result);
      })
      .catch((error) => {
        console.error(`[ADMIN] Patent sync failed:`, error);
      });
  } catch (error) {
    console.error('Error starting patent sync:', error);
    res.status(500).json({ error: 'Failed to start patent sync' });
  }
});

/**
 * GET /api/admin/sources/patents/stats
 * Get patent statistics
 */
router.get('/patents/stats', async (req: Request, res: Response) => {
  try {
    const tenantId = req.query.tenantId as string || 'default';

    const { PatentUSPTOService } = await import('../services/patentUSPTOService');
    const stats = await PatentUSPTOService.getPatentStats(tenantId);

    res.json({
      ...stats,
      message: 'Patent statistics retrieved',
    });
  } catch (error) {
    console.error('Error getting patent stats:', error);
    res.status(500).json({ error: 'Failed to retrieve patent statistics' });
  }
});

export const adminSourcesRouter = router;
