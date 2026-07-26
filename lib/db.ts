import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";

// Lazy initialization to handle missing POSTGRES_URL gracefully
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
    _db = drizzle(sql, { schema });
  }
  return _db;
}

// Convenience export
export const db = getDb();
