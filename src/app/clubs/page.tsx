// app/clubs/page.tsx
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import ClubGallery from "./ui/ClubGallery";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clubs | FitnessHub",
  description:
    "Find running, cycling, and tri clubs near you. Train together, go farther.",
};

export default async function ClubsPage() {
  const clubs = await prisma.club.findMany({
    orderBy: [{ memberCount: "desc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      city: true,
      sports: true,
      memberCount: true,
      description: true,
      logoUrl: true,
      coverImage: true,
    },
  });

  // Figure out unique filters server-side to avoid client crunching
  const cities = [...new Set(clubs.map((c) => c.city).filter(Boolean))].sort() as string[];
  const sports = [...new Set(clubs.flatMap((c) => c.sports))].sort();

  const featured = clubs.slice(0, 3);

  return (
    <main className="min-h-screen bg-[rgb(var(--brand-surface))]">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-10 md:pt-14">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.03] to-transparent p-6 md:p-10">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur">
                Train together
              </span>
              <h1 className="mt-4 text-4xl/tight font-extrabold text-white md:text-6xl/tight">
                Clubs that keep you <span className="text-primary">consistent</span>
              </h1>
              <p className="mt-4 max-w-xl text-white/70">
                Find groups near you for long runs, weekend rides, skills clinics, and coffee after.
                Join a crew and watch your fitness stick.
              </p>
            </div>

            {/* Featured mosaic */}
            <div className="grid grid-cols-3 gap-3">
              {featured.map((f) => (
                <div
                  key={f.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                  title={f.name}
                >
                  <Image
                    src={f.coverImage || "/placeholder.jpg"}
                    alt={f.name}
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute left-3 bottom-3 flex items-center gap-2">
                    <div className="h-7 w-7 overflow-hidden rounded-full border border-white/20 bg-black/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={`${f.name} logo`}
                        src={f.logoUrl || "/placeholder.jpg"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="text-sm font-semibold text-white drop-shadow">{f.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        </div>
      </section>

      {/* Directory */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-6">
        <ClubGallery
          initialClubs={clubs}
          cities={cities}
          sports={sports}
        />
      </section>
    </main>
  );
}
