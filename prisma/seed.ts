// prisma/seed.ts
import { PrismaClient, Sport, Level } from "@prisma/client";
const prisma = new PrismaClient();

/* ---------- helpers ---------- */

async function upsertTrainingPlan(input: {
  slug: string;
  title: string;
  sport: Sport;
  level: Level;
  weeks: number;
  price: number;
  isPremium?: boolean;
  coverImage?: string | null;
  description: string;
  workouts: Array<{
    week: number;
    dayOfWeek: number; // 1=Mon ... 7=Sun
    title: string;
    details: string;
  }>;
}) {
  const plan = await prisma.trainingPlan.upsert({
    where: { slug: input.slug },
    update: {
      title: input.title,
      sport: input.sport,
      level: input.level,
      weeks: input.weeks,
      price: input.price,
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
      isPremium: input.isPremium ?? false,
      coverImage: input.coverImage ?? null,
      description: input.description,
    },
  });

  await prisma.workout.deleteMany({ where: { trainingPlanId: plan.id } });
  await prisma.workout.createMany({
    data: input.workouts.map((w) => ({
      trainingPlanId: plan.id,
      week: w.week,
      dayOfWeek: w.dayOfWeek,
      title: w.title,
      details: w.details,
    })),
  });

  return plan;
}

async function upsertClub(input: {
  slug: string;
  name: string;
  city?: string | null;
  sports: Sport[];
  memberCount: number;
  description?: string | null;
  logoUrl?: string | null;
  coverImage?: string | null;
}) {
  return prisma.club.upsert({
    where: { slug: input.slug },
    update: {
      name: input.name,
      city: input.city ?? null,
      sports: input.sports,
      memberCount: input.memberCount,
      description: input.description ?? null,
      logoUrl: input.logoUrl ?? null,
      coverImage: input.coverImage ?? null,
    },
    create: {
      slug: input.slug,
      name: input.name,
      city: input.city ?? null,
      sports: input.sports,
      memberCount: input.memberCount,
      description: input.description ?? null,
      logoUrl: input.logoUrl ?? null,
      coverImage: input.coverImage ?? null,
    },
  });
}

async function upsertExpert(input: {
  slug: string;
  name: string;
  role: "COACH" | "PHYSIO" | "NUTRITION";
  sports: Sport[];
  city?: string | null;
  bio?: string | null;
  certifications?: string | null;
  monthlyRate?: number | null;
  hourlyRate?: number | null;
  rating?: number | null;
  photoUrl?: string | null;
  yearsExp?: number | null;
}) {
  return prisma.expert.upsert({
    where: { slug: input.slug },
    update: input,
    create: input,
  });
}

/* ---------- seed ---------- */

async function main() {
  // ---- Training Plans (same as yours) ----
  await upsertTrainingPlan({
    slug: "5k-beginner-8w",
    title: "5K Beginner — 8 Weeks",
    sport: "RUN",
    level: "BEGINNER",
    weeks: 8,
    price: 0,
    coverImage: "/uploads/cat-running.jpg",
    description:
      "Gentle introduction to running with walk/run intervals, building to a confident 5K.",
    workouts: [
      { week: 1, dayOfWeek: 2, title: "Easy Walk/Run", details: "20 min easy: 1 min jog / 2 min walk x 6" },
      { week: 1, dayOfWeek: 4, title: "Cross Train", details: "30 min bike or swim" },
      { week: 1, dayOfWeek: 6, title: "Long Easy", details: "30 min easy continuous jog" },
    ],
  });

  await upsertTrainingPlan({
    slug: "cycling-base-6w",
    title: "Cycling Base — 6 Weeks",
    sport: "CYCLING",
    level: "BEGINNER",
    weeks: 6,
    price: 0,
    coverImage: "/uploads/cat-cycling.jpg",
    description:
      "Foundational endurance and cadence drills to build aerobic base.",
    workouts: [
      { week: 1, dayOfWeek: 2, title: "Endurance Ride", details: "45 min Z2 steady" },
      { week: 1, dayOfWeek: 4, title: "Cadence Drills", details: "5 x 3 min high cadence" },
      { week: 1, dayOfWeek: 6, title: "Long Endurance", details: "75 min Z2" },
    ],
  });

  // ---- Clubs (same as yours) ----
  await upsertClub({
    slug: "mumbai-morning-milers",
    name: "Mumbai Morning Milers",
    city: "Mumbai",
    sports: ["RUN"],
    memberCount: 420,
    description: "Community runs at Marine Drive, Tues/Thu/Sun. All paces welcome.",
    logoUrl: "/uploads/cat-running.jpg",
    coverImage: "/uploads/hero.jpg",
  });

  await upsertClub({
    slug: "blr-crit-crew",
    name: "BLR Crit Crew",
    city: "Bengaluru",
    sports: ["CYCLING"],
    memberCount: 260,
    description: "Weeknight crit practice and weekend endurance rides.",
    logoUrl: "/uploads/cat-cycling.jpg",
    coverImage: "/uploads/tri.jpg",
  });

  // ---- Experts ----
  await upsertExpert({
    slug: "aisha-kapoor-run-coach",
    name: "Aisha Kapoor",
    role: "COACH",
    sports: ["RUN"],
    city: "Mumbai",
    bio: "RRCA-certified coach, beginners to half-marathon PRs.",
    certifications: "RRCA L1, NASM-CPT",
    monthlyRate: 2999,
    rating: 4.8,
    photoUrl: "/uploads/cat-running.jpg",
    yearsExp: 7,
  });

  await upsertExpert({
    slug: "rahul-menon-cycling-coach",
    name: "Rahul Menon",
    role: "COACH",
    sports: ["CYCLING"],
    city: "Bengaluru",
    bio: "FTP development and race tactics.",
    certifications: "UEC L1",
    monthlyRate: 3499,
    rating: 4.7,
    photoUrl: "/uploads/cat-cycling.jpg",
    yearsExp: 9,
  });

  await upsertExpert({
    slug: "meera-shah-physio",
    name: "Meera Shah",
    role: "PHYSIO",
    sports: ["RUN", "CYCLING"],
    city: "Pune",
    bio: "Sports physio: knee tracking, ITB, return-to-run.",
    certifications: "MPT (Sports), COMT",
    hourlyRate: 1200,
    rating: 4.9,
    photoUrl: "/uploads/physio.jpg",
  });

  await upsertExpert({
    slug: "arjun-iyer-nutrition",
    name: "Arjun Iyer",
    role: "NUTRITION",
    sports: ["RUN", "CYCLING", "TRIATHLON"],
    city: "Chennai",
    bio: "Endurance fueling and weight management for athletes.",
    certifications: "CNS, PN L1",
    hourlyRate: 900,
    rating: 4.6,
    photoUrl: "/uploads/nutrition.jpg",
  });

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
