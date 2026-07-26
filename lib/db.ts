import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";
import { sql as vercelSql } from "@vercel/postgres";

// Lazy initialization to handle missing POSTGRES_URL gracefully
let _db: ReturnType<typeof drizzle> | null = null;
let _dbError: Error | null = null;

export function getDb() {
  if (_dbError) throw _dbError;
  if (!_db) {
    try {
      _db = drizzle(vercelSql, { schema });
    } catch (e: any) {
      _dbError = e;
      throw e;
    }
  }
  return _db;
}

// Convenience export — will throw at call site if DB is not configured
export const db = getDb();
