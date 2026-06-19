import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding...");

  const providerHash = await bcrypt.hash("password123", 10);
  const provider = await prisma.user.upsert({
    where: { email: "provider@test.com" },
    update: {},
    create: {
      name: "Sarah Johnson",
      email: "provider@test.com",
      passwordHash: providerHash,
      role: "PROVIDER",
      timezone: "America/New_York",
    },
  });

  const provider2 = await prisma.user.upsert({
    where: { email: "provider2@test.com" },
    update: {},
    create: {
      name: "Ravi Mehta",
      email: "provider2@test.com",
      passwordHash: providerHash,
      role: "PROVIDER",
      timezone: "Asia/Kolkata",
    },
  });

  const userHash = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: {
      name: "Alex Smith",
      email: "user@test.com",
      passwordHash: userHash,
      role: "USER",
      timezone: "Europe/London",
    },
  });

  const now = new Date();
  for (let day = 1; day <= 5; day++) {
    for (const hour of [9, 14]) {
      const start = new Date(now);
      start.setDate(now.getDate() + day);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start);
      end.setMinutes(30);

      await prisma.slot.create({
        data: {
          providerId: provider.id,
          startTime: start,
          endTime: end,
        },
      });
    }
  }

  for (let day = 1; day <= 3; day++) {
    const start = new Date(now);
    start.setDate(now.getDate() + day);
    start.setHours(11, 0, 0, 0);
    const end = new Date(start);
    end.setHours(11, 30, 0, 0);

    await prisma.slot.create({
      data: {
        providerId: provider2.id,
        startTime: start,
        endTime: end,
      },
    });
  }

  console.log("Seed complete!");
  console.log("\nTest accounts:");
  console.log("  Provider: provider@test.com / password123 (New York timezone)");
  console.log("  Provider: provider2@test.com / password123 (India timezone)");
  console.log("  User:     user@test.com / password123 (London timezone)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
