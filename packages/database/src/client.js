const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;

if (!process.env.POSTGRES_PRISMA_URL && process.env.POSTGRES_URL_NON_POOLING) {
  process.env.POSTGRES_PRISMA_URL = process.env.POSTGRES_URL_NON_POOLING;
}

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

module.exports = prisma;
