import 'dotenv/config';
import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

const migrationDir = process.argv[2];
if (!migrationDir) {
  console.error('Uso: node scripts/apply-turso-migration.mjs <pasta-da-migration-em-prisma/migrations>');
  process.exit(1);
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const sql = readFileSync(`prisma/migrations/${migrationDir}/migration.sql`, 'utf-8');
await client.executeMultiple(sql);
console.log(`Migration ${migrationDir} aplicada no Turso com sucesso.`);
