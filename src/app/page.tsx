import PromoCarousel from "@/app/_components/PromoCarousel";
import SportRail from "@/app/_components/SportRail";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[rgb(9,15,25)] text-white">
      {/* HERO */}
      <section className="relative isolate">
        {/* soft brand glow */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_-10%_-10%,rgba(99,91,255,.25),transparent_60%),radial-gradient(1200px_600px_at_110%_20%,rgba(51,230,166,.18),transparent_60%)]" />
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-14 md:grid-cols-2 lg:gap-16">
          {/* Left copy */}
          <div>
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/85 backdrop-blur">
              India’s home for running & fitness
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-6xl">
              Fuel your performance.<br className="hidden md:block" /> Every step of the way.
            </h1>
            <p className="mt-4 max-w-xl text-white/70">
              Plans that fit your life. Events to test yourself. Experts to keep you strong.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="/events" className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-400">
                Browse Events
              </a>
              <a href="/training" className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
                Explore Training
              </a>
            </div>
          </div>

          {/* Right promo carousel */}
          <PromoCarousel />
        </div>
      </section>

      {/* SPORT RAIL */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Choose your sport</h2>
            <p className="text-sm text-white/60">Jump straight to tailored hubs, plans, and events.</p>
          </div>
        </div>
        <SportRail />
      </section>
    </main>
  );
}
