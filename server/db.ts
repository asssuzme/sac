import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

let db: any;

if (!process.env.DATABASE_URL) {
  console.warn("⚠️  DATABASE_URL not set. Running in preview mode without database.");
  // Create a mock database connection for preview
  const mockClient = {
    query: () => Promise.resolve([]),
    end: () => Promise.resolve(),
  };
  db = mockClient as any;
} else {
  // Create a postgres connection
  const client = postgres(process.env.DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  db = drizzle(client, { schema });
}

export { db };