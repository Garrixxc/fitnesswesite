// prisma/seed.ts
import { PrismaClient, Prisma } from "@prisma/client";
import { mkdir } from "fs/promises";

const prisma = new PrismaClient();

type Sport = Prisma.Sport;
type Level = Prisma.Level;

async function upsertTrainingPlan(input: {
  slug: string;
  title: string;
  sport: Sport;
  level: Level;
  weeks: number;
  price: number;
  compareAt?: number | null;
  isPremium?: boolean;
  coverImage?: string | null;
  description: string;
}) {
  await prisma.trainingPlan.upsert({
    where: { slug: input.slug },
    update: {
      title: input.title,
      sport: input.sport,
      level: input.level,
      weeks: input.weeks,
      price: input.price,
      compareAt: input.compareAt ?? null,
      isPremium: input.isPremium ?? false,
      coverImage: input.coverImage ?? null,
      description: input.description,
    },
    create: {
      slug: input.slug,
      title: input.title,
      sport: input.sport,
      level: input.level,
      weeks: input.weeks,
      price: input.price,
      compareAt: input.compareAt ?? null,
      isPremium: input.isPremium ?? false,
      coverImage: input.coverImage ?? null,
      description: input.description,
    },
  });
}

async function upsertClub(input: {
  slug: string;
  name: string;
  city: string;
  sports: Sport[];
  members?: number | null;
  description?: string | null;
  logoUrl?: string | null;
  coverImage?: string | null;
}) {
  await prisma.club.upsert({
    where: { slug: input.slug },
    update: {
      name: input.name,
      city: input.city,
      sports: input.sports,
      members: input.members ?? null,
      description: input.description ?? null,
      logoUrl: input.logoUrl ?? null,
      coverImage: input.coverImage ?? null,
    },
    create: {
      slug: input.slug,
      name: input.name,
      city: input.city,
      sports: input.sports,
      members: input.members ?? null,
      description: input.description ?? null,
      logoUrl: input.logoUrl ?? null,
      coverImage: input.coverImage ?? null,
    },
  });
}

async function main() {
  console.log("DATABASE_URL =", process.env.DATABASE_URL); // <- sanity check
  await mkdir("public/uploads", { recursive: true });

  // Plans
  await upsertTrainingPlan({
    slug: "5k-beginner-8w",
    title: "5K Beginner — 8 Weeks",
    sport: "RUN",
    level: "BEGINNER",
    weeks: 8,
    price: 0,
    isPremium: false,
    coverImage: "/uploads/cat-running.jpg",
    description: "Gentle intro to running; build to a confident 5K.",
  });

  await upsertTrainingPlan({
    slug: "cycling-base-6w",
    title: "Cycling Base — 6 Weeks",
    sport: "CYCLING",
    level: "BEGINNER",
    weeks: 6,
    price: 0,
    isPremium: false,
    coverImage: "/uploads/cat-cycling.jpg",
    description: "Endurance and cadence drills to build aerobic base.",
  });

  // Clubs
  await Promise.all([
    upsertClub({
      slug: "mumbai-morning-milers",
      name: "Mumbai Morning Milers",
      city: "Mumbai",
      sports: ["RUN"],
      members: 420,
      description: "Community runs at Marine Drive, Tue/Thu/Sun.",
      logoUrl: "/uploads/cat-running.jpg",
      coverImage: "/uploads/hero.jpg",
    }),
    upsertClub({
      slug: "blr-crit-crew",
      name: "BLR Crit Crew",
      city: "Bengaluru",
      sports: ["CYCLING"],
      members: 260,
      description: "Weeknight crit practice and weekend endurance rides.",
      logoUrl: "/uploads/cat-cycling.jpg",
      coverImage: "/uploads/tri.jpg",
    }),
    upsertClub({
      slug: "pune-trail-pack",
      name: "Pune Trail Pack",
      city: "Pune",
      sports: ["RUN", "TREK"],
      members: 180,
      description: "Early morning trail runs and monthly treks in the ghats.",
      logoUrl: "/uploads/placeholder-logo.png",
      coverImage: "/uploads/placeholder.jpg",
    }),
    upsertClub({
      slug: "chennai-enduro",
      name: "Chennai Enduro",
      city: "Chennai",
      sports: ["CYCLING"],
      members: 150,
      description: "Coastal endurance rides and FTP build blocks.",
      logoUrl: "/uploads/placeholder-logo.png",
      coverImage: "/uploads/placeholder.jpg",
    }),
    upsertClub({
      slug: "goa-open-water",
      name: "Goa Open Water",
      city: "Goa",
      sports: ["SWIM"],
      members: 95,
      description: "Weekly ocean swims, technique + safety briefings.",
      logoUrl: "/uploads/placeholder-logo.png",
      coverImage: "/uploads/placeholder.jpg",
    }),
  ]);

  const count = await prisma.club.count();
  console.log(`✅ Seed complete. Clubs in DB: ${count}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
