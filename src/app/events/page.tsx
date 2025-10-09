import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const revalidate = 60;

type Search = {
  q?: string; sport?: string; city?: string;
  from?: string; to?: string; min?: string; max?: string; page?: string;
};

const SPORTS = [
  { label: "All sports", value: "" },
  { label: "Running", value: "RUN" },
  { label: "Cycling", value: "CYCLING" },
  { label: "Swimming", value: "SWIM" },
  { label: "Triathlon", value: "TRIATHLON" },
  { label: "Trek", value: "TREK" },
  { label: "Other", value: "OTHER" },
] as const;

const parseDate = (s?: string) => (s ? new Date(s) : undefined);
const isValidDate = (d: Date | undefined) => !!d && !Number.isNaN(d.getTime());
const toInt = (s?: string) => (s ? (Number.isFinite(Number(s)) ? Math.floor(Number(s)) : undefined) : undefined);

export default async function EventsPage({ searchParams }: { searchParams?: Search }) {
  const sp = searchParams ?? {};
  const where: Prisma.EventWhereInput = {};

  if (sp.q?.trim()) where.title = { contains: sp.q.trim(), mode: "insensitive" };
  if (sp.sport) where.sport = sp.sport as any;
  if (sp.city?.trim()) where.location = { contains: sp.city.trim(), mode: "insensitive" };

  const from = parseDate(sp.from);
  const to = parseDate(sp.to);
  if (isValidDate(from) || isValidDate(to)) {
    where.startDate = {};
    if (isValidDate(from)) (where.startDate as any).gte = from!;
    if (isValidDate(to)) (where.startDate as any).lte = to!;
  }

  const min = toInt(sp.min);
  const max = toInt(sp.max);
  if (min != null || max != null) {
    where.price = {};
    if (min != null) (where.price as any).gte = min;
    if (max != null) (where.price as any).lte = max;
  }

  const pageSize = 30;
  const page = Math.max(1, toInt(sp.page) ?? 1);
  const skip = (page - 1) * pageSize;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { startDate: "asc" },
      take: pageSize,
      skip,
      select: {
        id: true, slug: true, title: true, coverImage: true, startDate: true,
        endDate: true, location: true, price: true, currency: true, sport: true,
      },
    }),
    prisma.event.count({ where }),
  ]);

  const hasFilters =
    !!sp.q || !!sp.sport || !!sp.city || !!sp.from || !!sp.to || !!sp.min || !!sp.max;

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const buildPageHref = (p: number) => {
    const params = new URLSearchParams({ ...Object.fromEntries(Object.entries(sp as any)) });
    if (p <= 1) params.delete("page"); else params.set("page", String(p));
    return `/events?${params.toString()}`;
  };

  return (
    <main className="min-h-screen bg-[rgb(var(--brand-surface))]">
      {/* Hero */}
      <section className="relative border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex items-center justify-between gap-4">
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
            <Link href="/events/create"
              className="hidden rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 md:block">
              + Create Event
            </Link>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[rgb(var(--brand-surface))]/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <form className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-8" method="get">
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-medium text-white/60">Search</label>
              <input name="q" defaultValue={sp.q ?? ""} placeholder="Event name, keyword…"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-primary/40"/>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-white/60">Sport</label>
              <select name="sport" defaultValue={sp.sport ?? ""}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40">
                {SPORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-medium text-white/60">City</label>
              <input name="city" defaultValue={sp.city ?? ""} placeholder="e.g. Mumbai"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-primary/40"/>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-white/60">From</label>
              <input type="date" name="from" defaultValue={sp.from ?? ""}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"/>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-white/60">To</label>
              <input type="date" name="to" defaultValue={sp.to ?? ""}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"/>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-white/60">Min ₹</label>
                <input name="min" defaultValue={sp.min ?? ""} inputMode="numeric"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"/>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-white/60">Max ₹</label>
                <input name="max" defaultValue={sp.max ?? ""} inputMode="numeric"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"/>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button type="submit"
                className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                Apply
              </button>
              {hasFilters && (
                <Link href="/events"
                  className="whitespace-nowrap rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white/85 hover:bg-white/10">
                  Clear
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-4 flex items-center justify-between text-xs text-white/60">
          <div>
            results: <span className="font-semibold text-white">{events.length}</span>
            {total > events.length && <span className="ml-2 text-white/50">of {total}</span>}
          </div>
          {pages > 1 && (
            <nav className="flex items-center gap-2">
              <Link href={buildPageHref(Math.max(1, page - 1))}
                    className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-white/80 hover:bg-white/10">
                Prev
              </Link>
              <span className="text-white/70">Page <span className="text-white">{page}</span> / {pages}</span>
              <Link href={buildPageHref(Math.min(pages, page + 1))}
                    className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-white/80 hover:bg-white/10">
                Next
              </Link>
            </nav>
          )}
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
                  image={e.coverImage ?? undefined}
                  location={e.location ?? undefined}
                  sport={String(e.sport)}
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

/* UI Pieces */

function EventCard(props: {
  slug: string; title: string; image?: string; location?: string;
  sport: string; start: Date; end?: Date; price: number; currency: string;
}) {
  const img = props.image && props.image.trim() !== "" ? props.image : "/placeholder.jpg";
  const date = formatDateRange(props.start, props.end);
  const priceLabel = props.price > 0 ? `₹${formatMoney(props.price)}` : "Free";

  return (
    <Link href={`/events/${props.slug}`}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_15px_50px_-20px_rgba(0,0,0,0.6)] transition hover:-translate-y-0.5 hover:bg-white/[0.06]">
      <div className="relative aspect-[16/10]">
        <Image src={img} alt={props.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105"
               sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <Chip>{props.location ?? "TBA"}</Chip>
          <Chip>{props.sport}</Chip>
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-ink shadow">
            {priceLabel}
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
      <p className="mt-1 text-sm text-white/70">Try different filters or clear all.</p>
      <div className="mt-4">
        <Link href="/events"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">
          Clear all
        </Link>
      </div>
    </div>
  );
}

/* utils */

function formatMoney(n: number) {
  try { return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n); }
  catch { return String(n); }
}
function formatDate(d: Date) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function formatDateRange(start: Date, end?: Date) {
  if (!start) return "";
  if (!end) return formatDate(start);
  const s = new Date(start), e = new Date(end);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) return `${s.toLocaleString(undefined, { month: "short" })} ${s.getDate()}–${e.getDate()}, ${e.getFullYear()}`;
  return `${formatDate(s)} – ${formatDate(e)}`;
}
