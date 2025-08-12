import { prisma } from "@/lib/prisma";
import ExpertCard from "@/app/_components/ExpertCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ExpertsIndex({
  searchParams,
}: {
  searchParams: { role?: string; sport?: string; city?: string };
}) {
  const role = (searchParams.role ?? "").toUpperCase();
  const sport = (searchParams.sport ?? "").toUpperCase();
  const city = searchParams.city?.trim();

  const where: any = {};
  if (["COACH", "PHYSIO", "NUTRITION"].includes(role)) where.role = role;
  if (["RUN", "CYCLING", "SWIM", "TRIATHLON", "OTHER"].includes(sport))
    where.sports = { has: sport };
  if (city) where.city = { contains: city, mode: "insensitive" };

  const [coaches, physios, nutritions] = await Promise.all([
    prisma.coach.findMany({
      where: sport ? { sports: { has: sport } } : undefined,
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      take: 24,
    }),
    prisma.expert.findMany({
      where: { ...(where.role ? { role: "PHYSIO" } : {}), ...(where.sports ? { sports: where.sports } : {}), ...(where.city ? { city: where.city } : {}) },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      take: 24,
    }),
    prisma.expert.findMany({
      where: { ...(where.role ? { role: "NUTRITION" } : {}), ...(where.sports ? { sports: where.sports } : {}), ...(where.city ? { city: where.city } : {}) },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      take: 24,
    }),
  ]);

  return (
    <main className="min-h-screen bg-[rgb(var(--brand-surface))]">
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-8 md:p-12">
          <h1 className="text-4xl/tight font-extrabold text-white md:text-6xl/tight">
            Find your experts
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Physiotherapists, nutritionists, and coaches — curated for endurance athletes.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["All", "Coach", "Physio", "Nutrition"].map((r) => {
              const rkey = r === "All" ? "" : r.toLowerCase();
              const href = `/experts${rkey ? `?role=${rkey}` : ""}`;
              const active = (searchParams.role ?? "") === rkey;
              return (
                <Link
                  key={r}
                  href={href}
                  className={`rounded-xl px-3 py-1.5 text-sm ${active ? "bg-primary/20 text-white" : "text-white/70 hover:bg-white/10"}`}
                >
                  {r}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Coaches */}
        <section className="mt-10">
          <header className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-white">Coaches</h2>
            <Link href="/experts?role=coach" className="text-sm text-white/70 hover:text-white">
              View all →
            </Link>
          </header>
          {coaches.length === 0 ? (
            <EmptyRow text="No coaches yet." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {coaches.map((c) => (
                <ExpertCard
                  key={c.id}
                  slug={c.slug}
                  name={c.name}
                  role="COACH"
                  city={c.city}
                  photoUrl={c.photoUrl || undefined}
                  rating={c.rating || undefined}
                  consultRate={c.monthlyRate || undefined}
                  sports={c.sports}
                />
              ))}
            </div>
          )}
        </section>

        {/* Physios */}
        <section className="mt-10">
          <header className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-white">Physiotherapists</h2>
            <Link href="/experts?role=physio" className="text-sm text-white/70 hover:text-white">
              View all →
            </Link>
          </header>
          {physios.length === 0 ? (
            <EmptyRow text="No physios yet." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {physios.map((e) => (
                <ExpertCard
                  key={e.id}
                  slug={e.slug}
                  name={e.name}
                  role="PHYSIO"
                  city={e.city}
                  photoUrl={e.photoUrl || undefined}
                  rating={e.rating || undefined}
                  consultRate={e.consultRate || undefined}
                  sports={e.sports}
                />
              ))}
            </div>
          )}
        </section>

        {/* Nutritionists */}
        <section className="mt-10">
          <header className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-white">Nutritionists</h2>
            <Link href="/experts?role=nutritionist" className="text-sm text-white/70 hover:text-white">
              View all →
            </Link>
          </header>
          {nutritions.length === 0 ? (
            <EmptyRow text="No nutritionists yet." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nutritions.map((e) => (
                <ExpertCard
                  key={e.id}
                  slug={e.slug}
                  name={e.name}
                  role="NUTRITIONIST"
                  city={e.city}
                  photoUrl={e.photoUrl || undefined}
                  rating={e.rating || undefined}
                  consultRate={e.consultRate || undefined}
                  sports={e.sports}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/70">
      {text}
    </div>
  );
}
