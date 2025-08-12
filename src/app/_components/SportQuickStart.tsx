"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

type Dest =
  | { type: "hub"; slug: string }
  | { type: "eventsByEnum"; enum: string }
  | { type: "eventsSearch"; q: string }
  | { type: "trainingSearch"; q: string };

const SPORTS = [
  { key: "running",      label: "Running",      img: "/uploads/cat-running.jpg",  dest: { type: "hub", slug: "running" } },
  { key: "cycling",      label: "Cycling",      img: "/uploads/cat-cycling.jpg",  dest: { type: "hub", slug: "cycling" } },
  { key: "swimming",     label: "Swimming",     img: "/uploads/cat-swip.jpg",     dest: { type: "eventsByEnum", enum: "SWIM" } },
  { key: "triathlon",    label: "Triathlon",    img: "/uploads/tri.jpg",          dest: { type: "eventsByEnum", enum: "TRIATHLON" } },
  { key: "cricket",      label: "Cricket",      img: "/uploads/hero.jpg",         dest: { type: "eventsSearch", q: "cricket" } },
  { key: "football",     label: "Football",     img: "/uploads/hero.jpg",         dest: { type: "eventsSearch", q: "football" } },
  { key: "yoga",         label: "Yoga",         img: "/uploads/nutrition.jpg",    dest: { type: "trainingSearch", q: "yoga" } },
  { key: "calisthenics", label: "Calisthenics", img: "/uploads/physio.jpg",       dest: { type: "trainingSearch", q: "calisthenics" } },
] as const;

function hrefOf(dest: Dest) {
  switch (dest.type) {
    case "hub": return `/sport/${dest.slug}`;
    case "eventsByEnum": return `/events?sport=${dest.enum}`;
    case "eventsSearch": return `/events?q=${encodeURIComponent(dest.q)}`;
    case "trainingSearch": return `/training?q=${encodeURIComponent(dest.q)}`;
  }
}

export default function SportQuickStart() {
  const router = useRouter();
  const rowRef = useRef<HTMLDivElement>(null);

  const scrollByTiles = (dir: 1 | -1) => {
    const el = rowRef.current;
    if (!el) return;
    // scroll roughly by one “card” worth (includes gap)
    const card = el.querySelector<HTMLElement>("[data-card]");
    const dx = card ? card.offsetWidth + 12 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * dx, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* left mask + arrow */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[rgb(10,13,22)] to-transparent rounded-2xl" />
      <button
        type="button"
        onClick={() => scrollByTiles(-1)}
        aria-label="Previous"
        className="absolute left-1 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 px-2 py-2 text-white hover:bg-black/60"
      >
        ‹
      </button>

      {/* right mask + arrow */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[rgb(10,13,22)] to-transparent rounded-2xl" />
      <button
        type="button"
        onClick={() => scrollByTiles(1)}
        aria-label="Next"
        className="absolute right-1 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 px-2 py-2 text-white hover:bg-black/60"
      >
        ›
      </button>

      {/* scroll row */}
      <div
        ref={rowRef}
        className="
          no-scrollbar relative -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1
          scroll-smooth touch-pan-x
        "
        aria-label="Quick start sports"
      >
        {SPORTS.map((s) => (
          <button
            key={s.key}
            data-card
            onClick={() => router.push(hrefOf(s.dest))}
            className="
              group relative h-44 w-72 flex-none snap-center overflow-hidden
              rounded-2xl border border-white/12 bg-white/5 backdrop-blur
              shadow-[0_10px_40px_-15px_rgba(0,0,0,0.6)]
              transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/30
            "
            aria-label={s.label}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.img}
              alt={s.label}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg"; }}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-black/5" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />

            <div className="absolute inset-x-4 bottom-4 text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-wider text-white/80 backdrop-blur-sm">
                Quick start
              </div>
              <div className="mt-2 text-2xl font-semibold text-white drop-shadow">
                {s.label} <span aria-hidden>→</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* hide scrollbars */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
