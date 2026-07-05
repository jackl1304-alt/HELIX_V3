import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, 'data/master-sources-catalog.json');

export interface MasterSourceMeta {
  version: string;
  sourceDocument: string;
  accessDate: string;
  generatedAt: string;
  totalSources: number;
  checksum: string;
}

export interface GlobalAuthority {
  id: string;
  name: string;
  region: string;
  url: string;
  type: string;
  sourceDocument: string;
  accessDate: string;
}

export interface RegulatorySourceEntry {
  id: string;
  name: string;
  category: string;
  url: string;
  region: string;
  type: string;
  publisher: string;
  verification: string;
  sourceDocument: string;
  accessDate: string;
}

export interface QMSPatentEntry {
  publicationNumber: string;
  title: string;
  url: string;
  source: string;
  jurisdiction: string;
  status: string;
  verification: string;
  sourceDocument: string;
  accessDate: string;
}

export interface ScientificStudyEntry {
  id: string;
  author: string;
  year: number | null;
  title: string;
  focus: string;
  url: string;
  source: string;
  verification: string;
  sourceDocument: string;
  accessDate: string;
}

export interface MasterSourcesCatalog {
  meta: MasterSourceMeta;
  authorities: GlobalAuthority[];
  regulatorySources: RegulatorySourceEntry[];
  patents: QMSPatentEntry[];
  studies: ScientificStudyEntry[];
}

let cachedCatalog: MasterSourcesCatalog | null = null;

export function loadMasterSourcesCatalog(): MasterSourcesCatalog {
  if (cachedCatalog) return cachedCatalog;
  const raw = fs.readFileSync(CATALOG_PATH, 'utf8');
  cachedCatalog = JSON.parse(raw) as MasterSourcesCatalog;
  return cachedCatalog;
}

export function getCatalogMarkdownPath(): string {
  return path.join(__dirname, '../docs/regulatory/MASTER_SOURCES_CATALOG.md');
}

export function reloadMasterSourcesCatalog(): MasterSourcesCatalog {
  cachedCatalog = null;
  return loadMasterSourcesCatalog();
}
