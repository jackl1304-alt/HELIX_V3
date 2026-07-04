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
let driver: 'neon' | 'pg' | 'none' = 'none';

if (!process.env.DATABASE_URL) {
  console.warn('[DB] WARNING: DATABASE_URL not set - database features will be disabled');
  console.warn('[DB] The server will start, but most API endpoints will not work');
  console.warn('[DB] Set DATABASE_URL in .env file for full functionality');
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
    console.warn('[DB] Server will start, but database features will be disabled');
  }
}

export const dbDriver = driver;

export { pool };
export const db = dbInstance;
