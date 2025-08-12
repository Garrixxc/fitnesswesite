// src/app/sport/[sport]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

/* ---------- Supported sports & mapping ---------- */

const SUPPORTED = [
  "running",
  "cycling",
  "swimming",
  "triathlon",
  "cricket",
  "football",
  "yoga",
  "calisthenics",
  "pickleball",
] as const;

type SupportedSport = (typeof SUPPORTED)[number];

// Map URL slugs to Prisma enum values (fallback to OTHER where needed)
const SPORT_MAP: Record<
  SupportedSport,
  "RUN" | "CYCLING" | "SWIM" | "TRIATHLON" | "OTHER"
> = {
  running: "RUN",
  cycling: "CYCLING",
  swimming: "SWIM",
  triathlon: "TRIATHLON",
  cricket: "OTHER",
  football: "OTHER",
  yoga: "OTHER",
  calisthenics: "OTHER",
  pickleball: "OTHER",
};

const TABS = [
  { key: "events", label: "Events" },
  { key: "training", label: "Training Plans" },
  { key: "coaches", label: "Coaches" },
  { key: "clubs", label: "Clubs" },
  { key: "blogs", label: "Blogs" },
  { key: "care", label: "Physio/Nutrition" },
] as const;

/* ---------- Metadata ---------- */

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { sport: string };
  searchParams: { tab?: string };
}): Promise<Metadata> {
  const s = params.sport?.toLowerCase();
  if (!SUPPORTED.includes(s as SupportedSport)) return {};
  const tab = TABS.find((t) => t.key === (searchParams.tab ?? "events"))?.label ?? "Events";
  return {
    title: `${capitalize(s!)} — ${tab} | FitnessHub`,
    description: `Discover ${capitalize(s!)} events and training plans.`,
  };
}

/* ---------- Page ---------- */

export default async function SportPage({
  params,
  searchParams,
}: {
  params: { sport: string };
  searchParams: { tab?: string };
}) {
  const sportParam = params.sport?.toLowerCase();
  if (!SUPPORTED.includes(sportParam as SupportedSport)) notFound();

  const activeTab = (searchParams.tab ?? "events").toLowerCase();
  const sportEnum = SPORT_MAP[sportParam as SupportedSport];

  // Fetch everything needed for this sport (now includes careExperts)
  const [events, plans, coaches, clubs, careExperts] = await Promise.all([
    prisma.event.findMany({
      where: { sport: sportEnum },
      orderBy: { startDate: "asc" },
      take: 12,
    }),
    prisma.trainingPlan.findMany({
      where: { sport: sportEnum },
      orderBy: { level: "asc" },
      take: 12,
    }),
    prisma.coach.findMany({
      where: { sports: { has: sportEnum } }, // Coach.sports is Sport[]
      orderBy: { rating: "desc" },
      take: 12,
    }),
    prisma.club.findMany({
      where: { sports: { has: sportEnum } }, // Club.sports is Sport[]
      orderBy: { memberCount: "desc" },
      take: 12,
    }),
    prisma.expert.findMany({
      where: {
        sports: { has: sportEnum },
        role: { in: ["PHYSIO", "NUTRITION"] },
      },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      take: 12,
    }),
  ]);

  return (
    <main className="min-h-screen bg-[rgb(var(--brand-surface))]">
      <section className="mx-auto max-w-7xl px-4 pt-6">
        {/* Back link + breadcrumb */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/75 hover:text-white"
          >
            <span aria-hidden>←</span>
            Back to Home
          </Link>

          <nav aria-label="Breadcrumb" className="hidden text-sm text-white/60 md:block">
            <Link href="/" className="hover:text-white">
              Home
            </Link>{" "}
            / <span className="text-white/80">{capitalize(sportParam!)}</span>
          </nav>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 md:pb-14">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-8 md:p-12 shadow-[0_10px_50px_-15px_rgba(0,0,0,0.6)]">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur">
            {capitalize(sportParam!)} hub
          </span>
          <h1 className="mt-4 text-4xl/tight font-extrabold text-white md:text-6xl/tight">
            Everything {capitalize(sportParam!)} — curated for you
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Explore upcoming events, structured training plans, and expert resources tailored to{" "}
            {sportParam}.
          </p>
          <div className="pointer-events-none absolute -right-6 -top-6 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        </div>

        {/* Tabs (use replace so Back goes home, not previous tab) */}
        <nav className="mt-8 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-2">
          {TABS.map((t) => {
            const isActive = t.key === activeTab;
            return (
              <Link
                key={t.key}
                href={`/sport/${sportParam}?tab=${t.key}`}
                replace
                className={[
                  "whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-primary/20 text-white shadow-inner"
                    : "text-white/70 hover:text-white hover:bg-white/10",
                ].join(" ")}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>

        {/* Panels */}
        <div className="mt-6">
          {activeTab === "events" && (
            <SectionGrid
              title="Upcoming Events"
              subtitle={`Races & rides for ${sportParam}`}
              items={events.map((e) => ({
                id: e.id,
                title: e.title,
                href: `/events/${e.slug}`,
                meta: formatDateRange(e.startDate, e.endDate ?? undefined),
                chip: e.location,
                image: e.coverImage ?? "/placeholder.jpg",
              }))}
              emptyText={`No ${sportParam} events yet.`}
              emptyCta={`/events?sport=${sportParam}`}
            />
          )}

          {activeTab === "training" && (
            <SectionGrid
              title="Training Plans"
              subtitle="From base-building to race-ready"
              items={plans.map((p) => ({
                id: p.id,
                title: p.title,
                href: `/training/${p.slug}`,
                meta: `${capitalize(p.level.toLowerCase())} · ${p.weeks} weeks`,
                chip: sportParam,
                image: p.coverImage ?? "/placeholder.jpg",
              }))}
              emptyText="No plans yet."
              emptyCta={`/training?sport=${sportParam}`}
            />
          )}

          {activeTab === "coaches" && (
            <SectionGrid
              title="Coaches"
              subtitle="1:1 guidance from certified experts"
              items={coaches.map((c) => ({
                id: c.id,
                title: c.name,
                href: `/experts/${c.slug}`, // change to "#" if detail page not ready
                meta: `${c.city ?? "—"} • ${c.yearsExp} yrs • ₹${c.monthlyRate}/mo${
                  c.rating ? ` • ★ ${c.rating.toFixed(1)}` : ""
                }`,
                chip: sportParam,
                image: c.photoUrl ?? "/placeholder.jpg",
              }))}
              emptyText="No coaches yet for this sport."
              emptyCta={`/experts?sport=${sportParam}`}
            />
          )}

          {activeTab === "clubs" && (
            <SectionGrid
              title="Clubs"
              subtitle="Find your training crew"
              items={clubs.map((cl) => ({
                id: cl.id,
                title: cl.name,
                href: `/clubs/${cl.slug}`, // change to "#" if detail page not ready
                meta: `${cl.city ?? "—"} • ${cl.memberCount} members`,
                chip: sportParam,
                image: cl.coverImage ?? cl.logoUrl ?? "/placeholder.jpg",
              }))}
              emptyText="No clubs listed yet."
              emptyCta={`/clubs?sport=${sportParam}`}
            />
          )}

          {activeTab === "blogs" && (
            <EmptyPanel
              title="Blogs & Guides"
              text="We’ll surface technique, gear, nutrition and more here."
              ctaHref="/blog"
            />
          )}

          {activeTab === "care" && (
            <section className="mt-6">
              <h2 className="text-2xl font-bold text-white">Physio & Nutrition</h2>

              {careExperts.length === 0 ? (
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/70">
                  Coming soon for {sportParam}.
                </div>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {careExperts.map((e) => (
                    <Link
                      key={e.id}
                      href={`/experts/${e.slug}`}
                      className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
                    >
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={e.photoUrl ?? "/placeholder.jpg"}
                          alt={e.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white truncate">{e.name}</p>
                            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/80">
                              {e.role === "PHYSIO"
                                ? "Physio"
                                : e.role === "NUTRITIONIST"
                                ? "Nutrition"
                                : "Coach"}
                            </span>
                          </div>
                          <p className="text-xs text-white/60">
                            {e.city ?? "—"} {e.rating ? `• ★ ${e.rating.toFixed(1)}` : ""}
                            {e.consultRate ? ` • ₹${e.consultRate}/session` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {e.sports.map((s) => (
                          <span
                            key={s}
                            className="rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[10px] text-white/70"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <Link
                  href={`/experts?role=physio&sport=${sportParam}`}
                  className="text-sm text-white/70 hover:text-white"
                >
                  Browse all physios →
                </Link>
                <span className="px-2 text-white/20">•</span>
                <Link
                  href={`/experts?role=nutritionist&sport=${sportParam}`}
                  className="text-sm text-white/70 hover:text-white"
                >
                  Browse all nutritionists →
                </Link>
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

/* ---------- Reusable UI ---------- */

function SectionGrid({
  title,
  subtitle,
  items,
  emptyText,
  emptyCta,
}: {
  title: string;
  subtitle?: string;
  items: Array<{
    id: string;
    title: string;
    href: string;
    meta?: string;
    chip?: string | null;
    image?: string | null;
  }>;
  emptyText: string;
  emptyCta: string;
}) {
  return (
    <section className="mt-6">
      <header className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {subtitle && <p className="text-sm text-white/60">{subtitle}</p>}
        </div>
        <Link
          href={emptyCta}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
        >
          View all →
        </Link>
      </header>

      {items.length === 0 ? (
        <EmptyState text={emptyText} />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <li key={it.id}>
              <Link
                href={it.href}
                className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.6)]"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={it.title}
                    src={it.image ?? "/placeholder.jpg"}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {it.chip ? (
                    <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white/90 backdrop-blur">
                      {it.chip}
                    </span>
                  ) : null}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 font-semibold text-white">{it.title}</h3>
                  {it.meta && <p className="mt-1 text-sm text-white/60">{it.meta}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/70">
      {text}
    </div>
  );
}

function EmptyPanel({ title, text, ctaHref }: { title: string; text: string; ctaHref: string }) {
  return (
    <section className="mt-6">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
        <p>{text}</p>
        <Link
          href={ctaHref}
          className="mt-4 inline-block rounded-xl bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15"
        >
          Explore →
        </Link>
      </div>
    </section>
  );
}

/* ---------- utils ---------- */
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function formatDate(d: Date) {
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function formatDateRange(start: Date, end?: Date) {
  if (!start) return "";
  if (!end) return formatDate(start);
  const s = new Date(start),
    e = new Date(end);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth)
    return `${s.toLocaleString(undefined, { month: "short" })} ${s.getDate()}–${e.getDate()}, ${e.getFullYear()}`;
  return `${formatDate(s)} – ${formatDate(e)}`;
}
