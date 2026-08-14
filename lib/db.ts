import { neon } from '@neondatabase/serverless';

export function getSql() {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) {
    return null;
  }
  return neon(dbUrl);
}

export function isDbConnected(): boolean {
  return !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}
