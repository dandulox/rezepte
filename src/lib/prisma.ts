import { statSync } from "node:fs";
import path from "node:path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

type GlobalPrisma = typeof globalThis & {
  __rezeptbuch_prisma__?: PrismaClient;
  __rezeptbuch_prisma_key__?: string;
};

const g = globalThis as GlobalPrisma;

function prismaClientCacheKey(): string {
  try {
    const schema = statSync(path.join(process.cwd(), "prisma", "schema.prisma")).mtimeMs;
    const client = statSync(
      path.join(process.cwd(), "src", "generated", "prisma", "client.ts"),
    ).mtimeMs;
    return `${schema}:${client}`;
  } catch {
    return `${Date.now()}`;
  }
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL ist nicht gesetzt.");
  }
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter });
}

function getPrisma(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    g.__rezeptbuch_prisma__ ??= createPrismaClient();
    return g.__rezeptbuch_prisma__;
  }

  const key = prismaClientCacheKey();
  if (g.__rezeptbuch_prisma_key__ !== key || !g.__rezeptbuch_prisma__) {
    g.__rezeptbuch_prisma__ = createPrismaClient();
    g.__rezeptbuch_prisma_key__ = key;
  }
  return g.__rezeptbuch_prisma__;
}

/**
 * Lazy-Proxy: In der Entwicklung bleibt sonst oft ein alter PrismaClient in globalThis,
 * wenn nach `prisma generate` der Dev-Server nicht neu gestartet wurde (Schema ohne passenden Client).
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client as object, prop, receiver);
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
