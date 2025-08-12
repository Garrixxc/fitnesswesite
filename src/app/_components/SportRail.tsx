"use client";
import Image from "next/image";
import { useRef } from "react";

// use your existing /public/uploads images
const SPORTS = [
  { label: "Running", slug: "running", img: "/uploads/cat-running.jpg" },
  { label: "Cycling", slug: "cycling", img: "/uploads/cat-cycling.jpg" },
  { label: "Swimming", slug: "swimming", img: "/uploads/cat-swim.jpg" },
  { label: "Triathlon", slug: "triathlon", img: "/uploads/cat-tri.jpg" },
  { label: "Cricket", slug: "cricket", img: "/uploads/cat-cricket.jpg" },
  { label: "Football", slug: "football", img: "/uploads/cat-football.jpg" },
  { label: "Yoga", slug: "yoga", img: "/uploads/cat-yoga.jpg" },
  { label: "Calisthenics", slug: "calisthenics", img: "/uploads/cat-calisthenics.jpg" },
];

function Arrow({ dir = "left", className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      {dir === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 6l6 6-6 6" />}
    </svg>
  );
}

export default function SportRail() {
  const scroller = useRef<HTMLDivElement>(null);

  const scroll = (x: number) => scroller.current?.scrollBy({ left: x, behavior: "smooth" });

  return (
    <div className="relative">
      {/* rail */}
      <div
        ref={scroller}
        className="flex gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SPORTS.map((s) => (
          <a
            key={s.slug}
            href={`/sport/${s.slug}`}
            className="group relative w-[220px] flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)]"
          >
            <div className="relative h-36 w-full">
              <Image
                src={s.img}
                alt={s.label}
                fill
                sizes="220px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
              <span className="absolute left-3 bottom-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-black">
                {s.label}
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* nav arrows */}
      <div className="mt-4 flex justify-center gap-3">
        <button
          onClick={() => scroll(-300)}
          className="rounded-full border border-white/15 bg-white/5 p-2 text-white hover:bg-white/10"
          aria-label="Scroll left"
        >
          <Arrow dir="left" />
        </button>
        <button
          onClick={() => scroll(300)}
          className="rounded-full border border-white/15 bg-white/5 p-2 text-white hover:bg-white/10"
          aria-label="Scroll right"
        >
          <Arrow dir="right" />
        </button>
      </div>
    </div>
  );
}
