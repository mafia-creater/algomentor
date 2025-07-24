import { PrismaClient } from '@prisma/client';

// Declare a global variable to hold the Prisma Client instance
declare global {
  var prisma: PrismaClient | undefined;
}

// Initialize Prisma Client
// Check if the instance already exists in the global scope, otherwise create a new one.
// In development, this prevents hot-reloading from creating new instances on every change.
const client = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = client;

export default client;