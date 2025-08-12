"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Slide = {
  title: string;
  subtitle: string;
  image: string; // public/…
  href?: string;
};

const SLIDES: Slide[] = [
  {
    title: "Race season, powered by you",
    subtitle: "Find events, grab plans, and meet experts.",
    image: "/banners/hero-run.jpg",        // ✅ you already have these
    href: "/events",
  },
  {
    title: "Tri season is here",
    subtitle: "Train smarter with our plans.",
    image: "/banners/tri.jpg",
    href: "/training",
  },
  {
    title: "Courts near you",
    subtitle: "Pickleball, football turfs, and more.",
    image: "/banners/pickleball.jpg",
    href: "/arenas",
  },
];

// tiny inline chevrons (no packages)
function ChevronLeft({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
function ChevronRight({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export default function PromoCarousel() {
  const [i, setI] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = () => setI((p) => (p + 1) % SLIDES.length);
  const prev = () => setI((p) => (p - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    // autoplay
    timer.current = setInterval(next, 4500);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  return (
    <div
      className="relative h-[340px] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_15px_60px_-20px_rgba(0,0,0,0.6)]"
      onMouseEnter={() => timer.current && clearInterval(timer.current)}
      onMouseLeave={() => (timer.current = setInterval(next, 4500))}
    >
      {/* image */}
      <Image
        src={SLIDES[i].image}
        alt={SLIDES[i].title}
        fill
        sizes="(max-width:768px) 100vw, 600px"
        className="object-cover"
        priority
      />

      {/* overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/55 via-black/35 to-transparent" />

      {/* copy */}
      <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-8">
        <h3 className="max-w-lg text-2xl font-bold sm:text-3xl">{SLIDES[i].title}</h3>
        <p className="mt-2 max-w-md text-white/85">{SLIDES[i].subtitle}</p>

        {SLIDES[i].href && (
          <a
            href={SLIDES[i].href}
            className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-black hover:bg-white"
          >
            Explore
            <span className="inline-block translate-x-[1px]">→</span>
          </a>
        )}
      </div>

      {/* bottom-center controls */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-3">
        <button
          onClick={prev}
          className="pointer-events-auto rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
          aria-label="Previous"
        >
          <ChevronLeft />
        </button>
        <div className="flex items-center gap-2">
          {SLIDES.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 w-6 rounded-full ${idx === i ? "bg-white" : "bg-white/40"}`}
              aria-hidden
            />
          ))}
        </div>
        <button
          onClick={next}
          className="pointer-events-auto rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
          aria-label="Next"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
