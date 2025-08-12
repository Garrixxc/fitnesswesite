"use client";
import Link from "next/link";

type Props = {
  slug: string;
  name: string;
  role: "COACH" | "PHYSIO" | "NUTRITIONIST";
  city?: string | null;
  photoUrl?: string | null;
  rating?: number | null;
  consultRate?: number | null;
  sports: string[];
};

export default function ExpertCard({
  slug,
  name,
  role,
  city,
  photoUrl,
  rating,
  consultRate,
  sports,
}: Props) {
  const badge =
    role === "PHYSIO" ? "Physio" : role === "NUTRITIONIST" ? "Nutrition" : "Coach";

  return (
    <Link
      href={`/experts/${slug}`}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.6)] hover:bg-white/7 transition"
    >
      <div className="flex items-center gap-4 p-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={name}
            src={photoUrl || "/placeholder.jpg"}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-white/90">
              {badge}
            </span>
            {rating ? (
              <span className="text-xs text-white/70">★ {rating.toFixed(1)}</span>
            ) : null}
          </div>
          <div className="truncate font-semibold text-white">{name}</div>
          <div className="text-xs text-white/60">
            {city ? `${city} • ` : ""}
            {sports.join(" · ")}
            {consultRate ? ` • ₹${consultRate}` : ""}
          </div>
        </div>
      </div>
    </Link>
  );
}
