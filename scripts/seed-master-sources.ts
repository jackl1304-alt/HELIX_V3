/**
 * Seed data_sources Tabelle aus Master Sources Catalog (Behörden + Primärquellen)
 * Nutzung: npx tsx scripts/seed-master-sources.ts
 */
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, '../shared/data/master-sources-catalog.json');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL fehlt');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

interface Catalog {
  meta: { accessDate: string; version: string };
  authorities: Array<{ id: string; name: string; region: string; url: string }>;
  regulatorySources: Array<{
    id: string;
    name: string;
    region: string;
    url: string;
    category: string;
    publisher: string;
    verification: string;
  }>;
}

function regionToCountry(region: string): string {
  const map: Record<string, string> = {
    USA: 'US',
    EU: 'EU',
    UK: 'GB',
    Australien: 'AU',
    Kanada: 'CA',
    Japan: 'JP',
    'Südkorea': 'KR',
    Singapur: 'SG',
    Brasilien: 'BR',
    Indien: 'IN',
    'Südafrika': 'ZA',
    'Saudi-Arabien': 'SA',
    Mexiko: 'MX',
    Chile: 'CL',
    Argentinien: 'AR',
    EAEU: 'EAEU',
    Kasachstan: 'KZ',
    Global: 'GLOBAL',
  };
  return map[region] || region.slice(0, 10).toUpperCase();
}

async function main() {
  const catalog: Catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  let inserted = 0;

  const authorityRows = catalog.authorities.map((a) => ({
    id: a.id,
    name: a.name,
    url: a.url,
    description: `Master Catalog Behörde — ${a.region}`,
    country: regionToCountry(a.region),
    region: a.region,
    type: 'regulatory',
    category: 'authority',
    language: 'en',
    isActive: true,
    syncFrequency: 'weekly',
    authRequired: false,
    metadata: { source: 'master_sources_catalog', verification: 'primary' },
  }));

  const primarySources = catalog.regulatorySources
    .filter((s) => s.verification === 'primary' || s.verification === 'catalog_search')
    .map((s) => ({
      id: s.id,
      name: s.name,
      url: s.url,
      description: `${s.category} — ${s.publisher}`,
      country: regionToCountry(s.region),
      region: s.region,
      type: s.category === 'Norm' ? 'standards' : 'regulatory',
      category: s.category.toLowerCase(),
      language: 'en',
      isActive: s.verification === 'primary',
      syncFrequency: 'monthly',
      authRequired: false,
      metadata: { source: 'master_sources_catalog', verification: s.verification, publisher: s.publisher },
    }));

  const allRows = [...authorityRows, ...primarySources];
  console.log(`🌐 Seeding ${allRows.length} Master Sources (${authorityRows.length} Behörden, ${primarySources.length} Primärquellen)...`);

  for (const row of allRows) {
    await sql`
      INSERT INTO data_sources (
        id, name, url, description, country, region, type, category, language,
        is_active, sync_frequency, auth_required, metadata, created_at, updated_at
      ) VALUES (
        ${row.id},
        ${row.name},
        ${row.url},
        ${row.description},
        ${row.country},
        ${row.region},
        ${row.type},
        ${row.category},
        ${row.language},
        ${row.isActive},
        ${row.syncFrequency},
        ${row.authRequired},
        ${JSON.stringify(row.metadata)}::jsonb,
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        url = EXCLUDED.url,
        description = EXCLUDED.description,
        country = EXCLUDED.country,
        region = EXCLUDED.region,
        type = EXCLUDED.type,
        category = EXCLUDED.category,
        is_active = EXCLUDED.is_active,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    `;
    inserted++;
    console.log(`  ✅ ${row.name.slice(0, 60)}`);
  }

  console.log(`\n✅ ${inserted} Quellen in data_sources gespeichert (Catalog v${catalog.meta.version}, ${catalog.meta.accessDate})`);
}

main().catch((err) => {
  console.error('❌ Seed fehlgeschlagen:', err);
  process.exit(1);
});
