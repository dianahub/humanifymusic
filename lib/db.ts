import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

let sql: ReturnType<typeof postgres> | null = null;

function getDb() {
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set. Add a PostgreSQL database to your Railway/Vercel project.");
  }
  if (!sql) {
    sql = postgres(connectionString, { ssl: { rejectUnauthorized: false } });
  }
  return sql;
}

export async function ensureTable() {
  const db = getDb();
  await db`
    CREATE TABLE IF NOT EXISTS signups (
      id        SERIAL PRIMARY KEY,
      name      TEXT,
      email     TEXT NOT NULL UNIQUE,
      language  TEXT DEFAULT 'en',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function insertSignup(name: string | null, email: string, language: string) {
  const db = getDb();
  await ensureTable();
  await db`
    INSERT INTO signups (name, email, language)
    VALUES (${name}, ${email}, ${language})
  `;
}

export async function getAllSignups() {
  const db = getDb();
  await ensureTable();
  return db`SELECT * FROM signups ORDER BY created_at DESC`;
}

export async function getSignupCount(): Promise<number> {
  const db = getDb();
  await ensureTable();
  const result = await db`SELECT COUNT(*)::int AS count FROM signups`;
  return result[0].count;
}
