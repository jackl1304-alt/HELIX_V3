import ws from 'ws';
import * as schema from '../shared/schema.js';

// Driver Imports: Neon (serverless HTTP) & native pg for direkte lokale Verbindung
import { neon, Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';

neonConfig.webSocketConstructor = ws;

// Windows-kompatible Datenbankverbindung mit Fallback
let pool: NeonPool | PgPool | null = null;
let dbInstance: any = null;
let driver: 'neon' | 'pg' = 'pg';

if (!process.env.DATABASE_URL) {
  console.error('[DB] DATABASE_URL not set - database connection required');
  throw new Error('DATABASE_URL environment variable is required. Please set it in .env file');
} else {
  const url = process.env.DATABASE_URL;
  const isNeon = /\.neon\.tech/.test(url || '');
  try {
    if (!url?.startsWith('postgresql://')) throw new Error('Invalid DATABASE_URL format');
    if (isNeon) {
      // Neon serverless HTTP/WebSocket
      pool = new NeonPool({ connectionString: url });
      dbInstance = drizzleNeon({ client: pool, schema });
      driver = 'neon';
      console.log('[DB] Using Neon serverless driver');
    } else {
      // Native pg TCP Verbindung für lokale/Netcup Postgres
      pool = new PgPool({ connectionString: url });
      dbInstance = drizzlePg(pool, { schema });
      driver = 'pg';
      console.log('[DB] Using native pg driver');
    }
  } catch (error) {
    console.error('[DB] Failed to connect to database:', error);
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your DATABASE_URL.`);
  }
}

export const dbDriver = driver;

export { pool };
export const db = dbInstance;
