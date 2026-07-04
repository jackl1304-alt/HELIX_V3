// DEPRECATED: Diese Datei wird für Kompatibilität beibehalten
// Bitte verwenden Sie stattdessen: import { pool } from './db.js'
// Diese Datei verwendet jetzt die zentrale DB-Verbindung aus db.ts

import { pool } from './db.js';

let sqlInstance: any = null;
let isConnected = false;

/**
 * @deprecated Verwenden Sie direkt: import { pool } from './db.js'
 */
export function getDatabaseConnection() {
  if (sqlInstance) {
    return sqlInstance;
  }

  if (!pool) {
    console.warn('[DB] No database pool available, using mock database');
    sqlInstance = createMockSQL();
    return sqlInstance;
  }

  try {
    // Erstelle SQL Template Helper basierend auf pool
    sqlInstance = async (strings: TemplateStringsArray, ...values: any[]) => {
      const text = strings.reduce((acc, part, i) => acc + part + (i < values.length ? `$${i + 1}` : ''), '');
      const result = await pool.query(text, values);
      return result.rows;
    };
    isConnected = true;
    console.log('[DB] Database connection established via db.ts');
    return sqlInstance;
  } catch (error) {
    console.warn('[DB] Failed to create SQL helper, using mock:', error);
    sqlInstance = createMockSQL();
    return sqlInstance;
  }
}

function createMockSQL() {
  // Graceful fallback when no database is available
  console.warn('[DB] Using mock SQL - database features disabled');
  return async () => {
    console.warn('[DB] Database operation attempted but no connection available');
    return [];
  };
}

// SQL Template Helper - verwendet jetzt pool aus db.ts
export const sql = pool 
  ? (async (strings: TemplateStringsArray, ...values: any[]) => {
      const text = strings.reduce((acc, part, i) => acc + part + (i < values.length ? `$${i + 1}` : ''), '');
      const result = await pool.query(text, values);
      return result.rows;
    })
  : createMockSQL();

export const isDatabaseConnected = () => pool !== null;



