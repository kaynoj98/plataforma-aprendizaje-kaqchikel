import "dotenv/config";

import argon2 from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";

import {
  AccountStatus,
  PrismaClient,
  ProfileType,
  Role,
} from "../src/generated/prisma/client.js";

const seedEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  ADMIN_FIRST_NAME: z.string().trim().min(1),
  ADMIN_LAST_NAME: z.string().trim().min(1),
  ADMIN_EMAIL: z.string().trim().email(),
  ADMIN_PASSWORD: z.string().min(12),
});

const result = seedEnvSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    "Las variables requeridas para crear el administrador no son válidas:",
    result.error.flatten().fieldErrors,
  );

  process.exit(1);
}

const seedEnv = result.data;

const adapter = new PrismaPg({
  connectionString: seedEnv.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main(): Promise<void> {
  const email = seedEnv.ADMIN_EMAIL.trim().toLowerCase();

  const passwordHash = await argon2.hash(seedEnv.ADMIN_PASSWORD, {
    type: argon2.argon2id,
  });

  const administrator = await prisma.user.upsert({
    where: {
      email,
    },

    update: {
      firstName: seedEnv.ADMIN_FIRST_NAME.trim(),
      lastName: seedEnv.ADMIN_LAST_NAME.trim(),
      passwordHash,
      role: Role.ADMIN,
      profileType: ProfileType.OTHER,
      status: AccountStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      blockedAt: null,
      blockedReason: null,
      disabledAt: null,
    },

    create: {
      firstName: seedEnv.ADMIN_FIRST_NAME.trim(),
      lastName: seedEnv.ADMIN_LAST_NAME.trim(),
      email,
      passwordHash,
      role: Role.ADMIN,
      profileType: ProfileType.OTHER,
      status: AccountStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },

    select: {
      id: true,
      email: true,
      role: true,
      status: true,
    },
  });

  console.log("Administrador inicial preparado:");
  console.log(administrator);
}

main()
  .catch((error: unknown) => {
    console.error("No fue posible ejecutar el seed:", error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
