import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : [],
});
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
export const db = prisma;
