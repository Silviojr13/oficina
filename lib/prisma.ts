import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

// Attempt to pass config object directly (works with current setup)
const adapterConfig = {
  url: process.env.DATABASE_URL!, // This is the local dev DB
};
const adapter = new PrismaLibSql(adapterConfig);

if (process.env.NODE_ENV === 'production') {
  const prodAdapterConfig = {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  };
  const prodAdapter = new PrismaLibSql(prodAdapterConfig);
  prisma = new PrismaClient({ adapter: prodAdapter });
} else {
  // Use a global variable in development
  if (!global.prisma) {
    global.prisma = new PrismaClient({ adapter });
  }
  prisma = global.prisma;
}

export default prisma;