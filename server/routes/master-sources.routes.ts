import { Router } from 'express';
import { loadMasterSourcesCatalog } from '../../shared/masterSources.js';

const router = Router();

router.get('/master-sources', (req, res) => {
  try {
    const catalog = loadMasterSourcesCatalog();
    res.json(catalog);
  } catch (error: any) {
    console.error('[Master Sources] Failed to load catalog:', error);
    res.status(500).json({ error: 'Failed to load master sources catalog', message: error.message });
  }
});

router.get('/master-sources/authorities', (req, res) => {
  try {
    const catalog = loadMasterSourcesCatalog();
    res.json(catalog.authorities);
  } catch (error: any) {
    console.error('[Master Sources] Failed to load authorities:', error);
    res.status(500).json({ error: 'Failed to load authority sources', message: error.message });
  }
});

router.get('/master-sources/regulatory-sources', (req, res) => {
  try {
    const catalog = loadMasterSourcesCatalog();
    res.json(catalog.regulatorySources);
  } catch (error: any) {
    console.error('[Master Sources] Failed to load regulatory sources:', error);
    res.status(500).json({ error: 'Failed to load regulatory sources', message: error.message });
  }
});

export default router;
