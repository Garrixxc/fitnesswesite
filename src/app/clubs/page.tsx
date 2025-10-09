import { prisma } from "@/lib/prisma";
import ClubCard from "../_components/ClubCard";
import Link from "next/link";

export const rdynamic = "force-dynamic"; 

export default async function ClubsPage() {
  const clubs = await prisma.club.findMany({
    orderBy: [{ members: "desc" }, { name: "asc" }],
    select: {
      slug: true, name: true, city: true, sports: true, members: true,
      description: true, logoUrl: true, coverImage: true,
    },
    take: 36,
  });

  return (
    <main className="min-h-screen bg-[rgb(var(--brand-surface))]">
      {/* Hero */}
      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 -z-10
            bg-[radial-gradient(900px_500px_at_-10%_-10%,rgba(99,91,255,.25),transparent_60%),radial-gradient(900px_500px_at_110%_10%,rgba(51,230,166,.18),transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                Community
              </span>
              <h1 className="mt-3 text-3xl font-extrabold text-white md:text-4xl">
                Clubs & groups
              </h1>
              <p className="mt-1 text-sm text-white/70">
                Find a local crew. Train together. Make it fun.
              </p>
            </div>
            <Link
              href="/events" // or a future /clubs/create
              className="hidden rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 md:block"
            >
              Browse events →
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        {clubs.length === 0 ? (
          <EmptyClubs />
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {clubs.map((c) => (
              <li key={c.slug}>
                <ClubCard club={c} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function EmptyClubs() {
  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">
      <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-white/10" />
      <h3 className="text-lg font-semibold text-white">No clubs yet</h3>
      <p className="mt-1 text-sm text-white/70">
        Seed a couple of clubs or add your first one to get started.
      </p>
      <div className="mt-4 flex items-center justify-center gap-2">
        <Link
          href="/events"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
        >
          Explore events
        </Link>
        <a
          href="mailto:hello@example.com"
          className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Partner with us
        </a>
      </div>
    </div>
  );
}
