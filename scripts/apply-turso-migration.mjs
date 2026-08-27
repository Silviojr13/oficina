import 'dotenv/config';
import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const sql = readFileSync('prisma/migrations/20260813163718/migration.sql', 'utf-8');
await client.executeMultiple(sql);
console.log('Migration aplicada no Turso com sucesso.');