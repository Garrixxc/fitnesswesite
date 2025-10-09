import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

type Params = { params: { slug: string } };

export async function generateMetadata({ params }: Params) {
  const e = await prisma.event.findUnique({
    where: { slug: params.slug },
    select: { title: true, location: true, startDate: true, endDate: true },
  });
  if (!e) return { title: "Event not found" };
  const date = formatDateRange(e.startDate, e.endDate);
  const title = `${e.title} • ${date}${e.location ? " • " + e.location : ""}`;
  return {
    title,
    description: `Details for ${e.title} — ${date} ${e.location ? "at " + e.location : ""}`,
    openGraph: {
      title,
      description: `Join ${e.title}. ${date}. ${e.location ?? ""}`,
      images: e ? [{ url: "/og-default.jpg" }] : undefined,
    },
  };
}

export default async function EventPage({ params }: Params) {
  const e = await prisma.event.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      title: true,
      description: true,
      sport: true,
      distanceKm: true,
      startDate: true,
      endDate: true,
      location: true,
      coverImage: true,
      currency: true,
      price: true,
      capacity: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!e) return notFound();

  const isPdf = (e.coverImage ?? "").toLowerCase().endsWith(".pdf");
  const priceLabel = e.price > 0 ? `₹${formatMoney(e.price)}` : "Free";
  const cityText = e.location ?? "TBA";
  const dateText = formatDateRange(e.startDate, e.endDate);
  const mapHref = e.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.location)}`
    : undefined;

  return (
    <main className="min-h-screen bg-[rgb(var(--brand-surface))]">
      {/* Header */}
      <section className="relative border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center justify-between">
            <Link href="/events" className="text-sm text-white/70 hover:text-white">
              ← Back to events
            </Link>
            <span className="text-xs text-white/50">
              Updated {formatDateShort(e.updatedAt)}
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-extrabold text-white md:text-4xl">
            {e.title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/70">
            <Badge>{String(e.sport)}</Badge>
            {e.distanceKm ? <Badge>{e.distanceKm} km</Badge> : null}
            <span className="mx-1">•</span>
            <span>{dateText}</span>
            {e.location ? (
              <>
                <span className="mx-1">•</span>
                {mapHref ? (
                  <a
                    className="underline decoration-white/30 underline-offset-4 hover:text-white"
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {cityText}
                  </a>
                ) : (
                  <span>{cityText}</span>
                )}
              </>
            ) : null}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-8 md:grid-cols-[2fr_1fr]">
        {/* Media + description */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
            {e.coverImage ? (
              isPdf ? (
                <div className="p-6">
                  <div className="rounded-lg border border-white/10 bg-black/30 p-4 text-white/80">
                    <p className="text-sm">PDF brochure attached to this event.</p>
                    <a
                      className="mt-2 inline-block rounded-md bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
                      href={e.coverImage}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open brochure
                    </a>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-[16/9]">
                  <Image
                    src={e.coverImage}
                    alt={e.title}
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, (max-width:1200px) 66vw, 800px"
                  />
                </div>
              )
            ) : (
              <div className="flex h-60 w-full items-center justify-center bg-white/[0.04] text-white/40">
                No cover uploaded
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-semibold text-white">About this event</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-white/85">
              {e.description}
            </p>
          </div>
        </div>

        {/* Quick info */}
        <aside className="space-y-4">
          <Card>
            <div className="text-sm text-white/70">Price</div>
            <div className="mt-1 text-2xl font-bold text-white">{priceLabel}</div>
            {e.capacity ? (
              <div className="mt-3 text-sm text-white/70">Capacity: {e.capacity}</div>
            ) : null}
          </Card>

          <Card>
            <div className="text-sm text-white/70">When</div>
            <div className="mt-1 text-white">{dateText}</div>
          </Card>

          <Card>
            <div className="text-sm text-white/70">Where</div>
            <div className="mt-1">
              {mapHref ? (
                <a
                  className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white/60"
                  href={mapHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {cityText}
                </a>
              ) : (
                <span className="text-white">{cityText}</span>
              )}
            </div>
          </Card>

          <Card>
            <div className="text-sm text-white/70">Share</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <ShareLink
                href={`https://wa.me/?text=${encodeURIComponent(
                  `${e.title} — ${dateText} — ${cityText} — ${currentUrl(params.slug)}`
                )}`}
              >
                WhatsApp
              </ShareLink>
              <ShareLink
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `${e.title} — ${dateText} • ${cityText}`
                )}&url=${encodeURIComponent(currentUrl(params.slug))}`}
              >
                X (Twitter)
              </ShareLink>
              <ShareLink href={currentUrl(params.slug)}>Open link</ShareLink>
            </div>
          </Card>
        </aside>
      </section>
    </main>
  );
}

/* ---------- little UI helpers (server-safe) ---------- */

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-black/50 px-2 py-1 text-xs text-white/85 backdrop-blur">
      {children}
    </span>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      {children}
    </div>
  );
}

function ShareLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      className="rounded-md border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white/90 hover:bg-white/[0.12]"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

/* ---------- utils ---------- */

function currentUrl(slug: string) {
  // Adjust if you have an APP_URL env for prod
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") || "http://localhost:3000";
  return `${base}/events/${slug}`;
}

function formatMoney(n: number) {
  try {
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
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
function formatDateRange(start: Date, end?: Date | null) {
  if (!start) return "";
  if (!end) return formatDate(start);
  const s = new Date(start),
    e = new Date(end);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth)
    return `${s.toLocaleString(undefined, { month: "short" })} ${s.getDate()}–${e.getDate()}, ${e.getFullYear()}`;
  return `${formatDate(s)} – ${formatDate(e)}`;
}
function formatDateShort(d: Date) {
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
