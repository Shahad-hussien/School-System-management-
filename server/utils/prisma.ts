// server/utils/prisma.ts
import pkg from "@prisma/client";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const PrismaClientClass =
  (pkg as any).PrismaClient || (pkg as any).default?.PrismaClient;
const { Pool } = pg;

declare global {
  var __prisma_singleton: any;
}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);

export const prisma =
  globalThis.__prisma_singleton ||
  new PrismaClientClass({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production")
  globalThis.__prisma_singleton = prisma;
