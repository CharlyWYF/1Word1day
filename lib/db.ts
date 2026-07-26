import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Missing database connection string. Set POSTGRES_URL or DATABASE_URL."
  );
}

// Serverless: disable prepared statements and limit connections
const client = postgres(connectionString, {
  ssl: "require",
  max: 1,
  prepare: false,
});

export const db = drizzle(client, { schema });
