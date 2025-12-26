import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

/* ---------- slug → enum mapping ---------- */
const SPORT_SLUGS = {
  running: "RUN",
  cycling: "CYCLING",
  swim: "SWIM",
  swimming: "SWIM",
  triathlon: "TRIATHLON",
  trek: "TREK",
  other: "OTHER",
} as const;
type SportEnum = typeof SPORT_SLUGS[keyof typeof SPORT_SLUGS];

function sportLabel(s: SportEnum) {
  switch (s) {
    case "RUN": return "Running";
    case "CYCLING": return "Cycling";
    case "SWIM": return "Swimming";
    case "TRIATHLON": return "Triathlon";
    case "TREK": return "Trek";
    default: return "Other";
  }
}

/* ---------- page ---------- */
export default async function SportHub({
  params,
}: { params: { sport?: string } }) {
  const slug = (params.sport ?? "").toLowerCase() as keyof typeof SPORT_SLUGS;
  const sport = SPORT_SLUGS[slug] as SportEnum | undefined;
  if (!sport) notFound();

  const now = new Date();

  /* Queries */
  const events = await prisma.event.findMany({
    where: { sport: sport as any, startDate: { gte: now } },
    orderBy: { startDate: "asc" },
    take: 12,
    select: {
      id: true, slug: true, title: true, coverImage: true,
      startDate: true, endDate: true, location: true,
      price: true, currency: true, sport: true,
      city: true,
    },
  });

  const label = sportLabel(sport);

  return (
    <main className="min-h-screen bg-[rgb(var(--brand-surface))] text-white">
      {/* Hero */}
      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(900px_500px_at_-10%_-10%,rgba(99,91,255,.25),transparent_60%),radial-gradient(900px_500px_at_110%_10%,rgba(51,230,166,.18),transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                Sport
              </span>
              <h1 className="mt-3 text-3xl font-extrabold md:text-5xl">
                {label} hub
              </h1>
              <p className="mt-2 max-w-2xl text-white/70">
                Discover upcoming {label.toLowerCase()} events.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href="#events" className="rounded-xl bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15">Events</a>
              </div>
            </div>
            <Link
              href="/events/create"
              className="hidden rounded-xl bg-primary px-4 py-2 text-sm font-semibold hover:opacity-90 md:block"
            >
              + Create {label} event
            </Link>
          </div>
        </div>
      </section>

      {/* Sections */}
      <div className="mx-auto max-w-7xl px-6">
        {/* Events */}
        <SectionHeader id="events" title={`Upcoming ${label} events`} href="/events" cta="Browse all events" />
        {events.length ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((e) => (
              <li key={e.id}><EventCard e={e} /></li>
            ))}
          </ul>
        ) : (
          <EmptyCard
            title="No events yet"
            subtitle={`Add your first ${label.toLowerCase()} event or check back soon.`}
            primaryHref="/events/create"
            primary={`Create ${label} event`}
            secondaryHref="/events"
            secondary="Browse events"
          />
        )}

        <div className="h-16" />
      </div>
    </main>
  );
}

/* ---------- reusable bits (local to this page) ---------- */

function SectionHeader({
  id, title, href, cta, className = "",
}: { id: string; title: string; href: string; cta: string; className?: string }) {
  return (
    <div id={id} className={`mb-4 mt-10 flex items-center justify-between ${className}`}>
      <h2 className="text-xl font-bold">{title}</h2>
      <Link href={href} className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/85 hover:bg-white/10">
        {cta} →
      </Link>
    </div>
  );
}

function EmptyCard({
  title, subtitle, primaryHref, primary, secondaryHref, secondary,
}: {
  title: string; subtitle?: string;
  primaryHref?: string; primary?: string;
  secondaryHref?: string; secondary?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">
      <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-white/10" />
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-white/70">{subtitle}</p>}
      <div className="mt-4 flex items-center justify-center gap-2">
        {primaryHref && primary && (
          <Link href={primaryHref} className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold hover:opacity-90">
            {primary}
          </Link>
        )}
        {secondaryHref && secondary && (
          <Link href={secondaryHref} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
            {secondary}
          </Link>
        )}
      </div>
    </div>
  );
}

/* Event card */
function EventCard({ e }: {
  e: {
    slug: string; title: string; coverImage?: string | null;
    startDate: Date; endDate?: Date | null; location?: string | null;
    price: number; currency: string; sport: string;
    city?: string | null;
  }
}) {
  const img = e.coverImage && e.coverImage.trim() !== "" ? e.coverImage : "/placeholder.jpg";
  const date = formatDateRange(e.startDate, e.endDate ?? undefined);
  return (
    <Link
      href={`/events/${e.slug}`}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_15px_50px_-20px_rgba(0,0,0,0.6)] transition hover:-translate-y-0.5 hover:bg-white/[0.06]"
    >
      <div className="relative aspect-[16/10]">
        <Image src={img} alt={e.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <Chip>{e.location ?? "TBA"}</Chip>
          <Chip>{e.sport}</Chip>
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-ink shadow">
            {e.currency} {formatMoney(e.price)}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-semibold">{e.title}</h3>
        <p className="mt-1 text-sm text-white/70">{date}</p>
      </div>
    </Link>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-black/50 px-2 py-0.5 text-xs text-white/85 backdrop-blur">
      {children}
    </span>
  );
}

/* utils */
function formatMoney(n: number) {
  try {
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
  } catch { return String(n); }
}
function formatDate(d: Date) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function formatDateRange(start: Date, end?: Date) {
  if (!end) return formatDate(start);
  const s = new Date(start), e = new Date(end);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    return `${s.toLocaleString(undefined, { month: "short" })} ${s.getDate()}–${e.getDate()}, ${e.getFullYear()}`;
  }
  return `${formatDate(s)} – ${formatDate(e)}`;
}
