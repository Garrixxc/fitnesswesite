// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import type { Sport } from "@prisma/client";
import { mkdir } from "fs/promises";

const prisma = new PrismaClient();


async function main() {
  console.log("DATABASE_URL =", process.env.DATABASE_URL);
  await mkdir("public/uploads", { recursive: true });

  console.log("✅ Seed complete (No V1 data to seed yet).");

  // Create one dummy event if none exist
  const count = await prisma.event.count();
  if (count === 0) {
    await prisma.event.create({
      data: {
        slug: "demo-marathon-2025",
        title: "Demo City Marathon 2025",
        description: "A placeholder event to test the events page.",
        sport: "RUN",
        startDate: new Date("2025-06-01"),
        location: "City Center",
        city: "Mumbai",
        price: 999,
        coverImage: "/banners/hero-run.jpg",
      }
    });
    console.log("✅ Created demo event.");
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
