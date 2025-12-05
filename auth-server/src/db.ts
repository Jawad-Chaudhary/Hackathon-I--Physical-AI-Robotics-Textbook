/**
 * Database configuration for better-auth
 * Uses Neon Serverless Postgres with Drizzle ORM
 */

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
