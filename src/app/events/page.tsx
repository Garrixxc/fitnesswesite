// src/app/events/page.tsx
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

type Search = {
  q?: string;
  sport?: string; // RUN, CYCLING, etc.
  city?: string;
  from?: string; // yyyy-mm-dd
  to?: string;   // yyyy-mm-dd
  min?: string;
  max?: string;
};

const SPORTS = [
  { label: "All sports", value: "" },
  { label: "Running", value: "RUN" },
  { label: "Cycling", value: "CYCLING" },
  { label: "Swimming", value: "SWIM" },
  { label: "Triathlon", value: "TRIATHLON" },
];

export default async function EventsPage({ searchParams }: { searchParams?: Search }) {
  const sp = searchParams ?? {};

  // Build Prisma where from filters
  const where: any = {};
  if (sp.sport) where.sport = sp.sport;
  if (sp.city) where.location = { contains: sp.city, mode: "insensitive" };
  if (sp.q) where.title = { contains: sp.q, mode: "insensitive" };
  if (sp.from || sp.to) {
    where.startDate = {};
    if (sp.from) where.startDate.gte = new Date(sp.from);
    if (sp.to) where.startDate.lte = new Date(sp.to);
  }
  if (sp.min || sp.max) {
    where.price = {};
    if (sp.min) where.price.gte = Number(sp.min);
    if (sp.max) where.price.lte = Number(sp.max);
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { startDate: "asc" },
    take: 60,
    select: {
      id: true,
      slug: true,
      title: true,
      coverImage: true,
      startDate: true,
      endDate: true,
      location: true,
      price: true,
      currency: true,
      sport: true,
    },
  });

  const hasFilters =
    !!sp.q || !!sp.sport || !!sp.city || !!sp.from || !!sp.to || !!sp.min || !!sp.max;

  return (
    <main className="min-h-screen bg-[rgb(var(--brand-surface))]">
      {/* Hero */}
      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(900px_500px_at_-10%_-10%,rgba(99,91,255,.25),transparent_60%),radial-gradient(900px_500px_at_110%_10%,rgba(51,230,166,.18),transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                Events directory
              </span>
              <h1 className="mt-3 text-3xl font-extrabold text-white md:text-4xl">
                Find your next start line
              </h1>
              <p className="mt-1 text-sm text-white/70">
                Filter by sport, city, dates and price. Tap a card to see details.
              </p>
            </div>
            <Link
              href="/events/create"
              className="hidden rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 md:block"
            >
              + Create Event
            </Link>
          </div>
        </div>
      </section>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[rgb(var(--brand-surface))]/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <form className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-8">
            {/* q */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-medium text-white/60">Search</label>
              <input
                name="q"
                defaultValue={sp.q ?? ""}
                placeholder="Event name, keyword…"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            {/* sport */}
            <div>
              <label className="block text-[11px] font-medium text-white/60">Sport</label>
              <select
                name="sport"
                defaultValue={sp.sport ?? ""}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"
              >
                {SPORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            {/* city */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-medium text-white/60">City</label>
              <input
                name="city"
                defaultValue={sp.city ?? ""}
                placeholder="e.g. Mumbai"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            {/* dates */}
            <div>
              <label className="block text-[11px] font-medium text-white/60">From</label>
              <input
                type="date"
                name="from"
                defaultValue={sp.from ?? ""}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-white/60">To</label>
              <input
                type="date"
                name="to"
                defaultValue={sp.to ?? ""}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            {/* price */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-white/60">Min ₹</label>
                <input
                  name="min"
                  defaultValue={sp.min ?? ""}
                  inputMode="numeric"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-white/60">Max ₹</label>
                <input
                  name="max"
                  defaultValue={sp.max ?? ""}
                  inputMode="numeric"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
            {/* actions */}
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Apply
              </button>
              {hasFilters && (
                <Link
                  href="/events"
                  className="whitespace-nowrap rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white/85 hover:bg-white/10"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-4 text-xs text-white/60">
          results: <span className="font-semibold text-white">{events.length}</span>
        </div>

        {events.length === 0 ? (
          <Empty />
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <li key={e.id}>
                <EventCard
                  slug={e.slug}
                  title={e.title}
                  image={e.coverImage}
                  location={e.location}
                  sport={e.sport}
                  start={e.startDate}
                  end={e.endDate ?? undefined}
                  price={e.price}
                  currency={e.currency}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

/* ---------- UI pieces ---------- */

function EventCard(props: {
  slug: string;
  title: string;
  image?: string | null;
  location?: string | null;
  sport: string;
  start: Date;
  end?: Date;
  price: number;
  currency: string;
}) {
  const img = props.image && props.image.trim() !== "" ? props.image : "/placeholder.jpg";
  const date = formatDateRange(props.start, props.end);

  return (
    <Link
      href={`/events/${props.slug}`}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_15px_50px_-20px_rgba(0,0,0,0.6)] transition hover:-translate-y-0.5 hover:bg-white/[0.06]"
    >
      <div className="relative aspect-[16/10]">
        <Image
          src={img}
          alt={props.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <Chip>{props.location ?? "TBA"}</Chip>
          <Chip>{props.sport}</Chip>
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-ink shadow">
            {props.currency} {formatMoney(props.price)}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-semibold text-white">{props.title}</h3>
        <p className="mt-1 text-sm text-white/70">{date}</p>
        <span className="mt-3 inline-block text-sm text-primary/90 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          View details →
        </span>
      </div>
    </Link>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-black/50 px-2 py-1 text-xs text-white/85 backdrop-blur">
      {children}
    </span>
  );
}

function Empty() {
  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">
      <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-white/10" />
      <h3 className="text-lg font-semibold text-white">No events match your filters</h3>
      <p className="mt-1 text-sm text-white/70">
        Try widening your dates, clearing price, or switching sport.
      </p>
      <div className="mt-4">
        <Link
          href="/events"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
        >
          Clear all
        </Link>
      </div>
    </div>
  );
}

/* ---------- utils ---------- */

function formatMoney(n: number) {
  try {
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);
  } catch {
    return String(n);
  }
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
