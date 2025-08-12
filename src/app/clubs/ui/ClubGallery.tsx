"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Club = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  sports: ("RUN" | "CYCLING" | "SWIM" | "TRIATHLON" | "OTHER")[];
  memberCount: number;
  description: string | null;
  logoUrl: string | null;
  coverImage: string | null;
};

export default function ClubGallery({
  initialClubs,
  cities,
  sports,
}: {
  initialClubs: Club[];
  cities: string[];
  sports: string[]; // enums as strings already
}) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string | "">("");
  const [sport, setSport] = useState<string | "">("");

  const filtered = useMemo(() => {
    return initialClubs.filter((c) => {
      const q = query.trim().toLowerCase();
      const matchesQ =
        q.length === 0 ||
        c.name.toLowerCase().includes(q) ||
        (c.city ?? "").toLowerCase().includes(q);

      const matchesCity = !city || (c.city ?? "") === city;
      const matchesSport = !sport || c.sports.includes(sport as any);

      return matchesQ && matchesCity && matchesSport;
    });
  }, [initialClubs, query, city, sport]);

  return (
    <div className="mt-4">
      {/* Filters */}
      <div className="mb-5 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:grid-cols-4">
        <input
          placeholder="Search club or city…"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-primary/50"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-primary/50"
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-primary/50"
        >
          <option value="">All sports</option>
          {sports.map((s) => (
            <option key={s} value={s}>
              {labelForSport(s)}
            </option>
          ))}
        </select>

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white/70">
          <span>{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
          {(city || sport || query) && (
            <button
              onClick={() => {
                setCity("");
                setSport("");
                setQuery("");
              }}
              className="rounded-lg bg-white/10 px-2 py-1 text-white hover:bg-white/15"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center text-white/60">
          No clubs match your filters yet.
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <li key={c.id}>
              <ClubCard club={c} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ClubCard({ club }: { club: Club }) {
  return (
    <Link
      href={`/clubs/${club.slug ?? ""}`}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.6)]"
    >
      <div className="relative aspect-[16/9]">
        <Image
          src={club.coverImage || "/placeholder.jpg"}
          alt={club.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        {/* Logo badge */}
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-2 py-1 backdrop-blur">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`${club.name} logo`}
            src={club.logoUrl || "/placeholder.jpg"}
            className="h-6 w-6 rounded-full object-cover"
          />
          <span className="text-xs font-semibold text-white/90">{club.city ?? "—"}</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 text-white font-semibold">{club.name}</h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-white/60">
          <span>{club.memberCount.toLocaleString()} members</span>
          <span>•</span>
          <span className="flex flex-wrap gap-1">
            {club.sports.slice(0, 3).map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/80"
              >
                {labelForSport(s)}
              </span>
            ))}
            {club.sports.length > 3 && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
                +{club.sports.length - 3}
              </span>
            )}
          </span>
        </div>

        {club.description && (
          <p className="mt-2 line-clamp-2 text-sm text-white/70">{club.description}</p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-white/50">View details</span>
          <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 group-hover:bg-white/10">
            Visit →
          </span>
        </div>
      </div>
    </Link>
  );
}

function labelForSport(s: string) {
  switch (s) {
    case "RUN":
      return "Running";
    case "CYCLING":
      return "Cycling";
    case "SWIM":
      return "Swimming";
    case "TRIATHLON":
      return "Triathlon";
    default:
      return "Other";
  }
}
