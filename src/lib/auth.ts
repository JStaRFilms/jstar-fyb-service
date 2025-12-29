import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Database provider from environment (default: postgresql for production safety)
const dbProvider = (process.env.DATABASE_PROVIDER || "postgresql") as "sqlite" | "postgresql" | "mysql";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: dbProvider,
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
});
