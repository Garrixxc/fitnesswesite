// Server-safe UI only (no client handlers needed)
import Link from "next/link";
import Image from "next/image";

type Club = {
  slug: string;
  name: string;
  city?: string | null;
  sports: string[];
  members?: number | null;
  description?: string | null;
  logoUrl?: string | null;
  coverImage?: string | null;
};

export default function ClubCard({ club }: { club: Club }) {
  const cover =
    club.coverImage && club.coverImage.trim() !== ""
      ? club.coverImage
      : "/placeholder.jpg";

  return (
    <Link
      href={`/clubs/${club.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]
                 shadow-[0_20px_60px_-30px_rgba(0,0,0,.6)] transition-all
                 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
    >
      {/* media */}
      <div className="relative aspect-[16/9]">
        <Image
          src={cover}
          alt={club.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {/* logo bubble */}
        {club.logoUrl && (
          <div className="absolute left-3 top-3 h-10 w-10 overflow-hidden rounded-full border border-white/20 bg-black/50 backdrop-blur">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={club.logoUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        {/* meta chips */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
          {club.sports.slice(0, 2).map((s) => (
            <span
              key={s}
              className="inline-flex items-center rounded-full border border-white/20 bg-black/50 px-2 py-0.5 text-xs text-white/85 backdrop-blur"
            >
              {s}
            </span>
          ))}
          {club.city && (
            <span className="inline-flex items-center rounded-full border border-white/20 bg-black/50 px-2 py-0.5 text-xs text-white/85 backdrop-blur">
              {club.city}
            </span>
          )}
        </div>
      </div>

      {/* body */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="line-clamp-1 font-semibold text-white">{club.name}</h3>
          <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-ink">
            {club.members ?? 0}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-white/70">
          {club.description ?? "—"}
        </p>

        <span className="mt-3 inline-block text-sm text-primary/90 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          View club →
        </span>
      </div>
      {/* subtle animated border glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-40"
           style={{ background: "radial-gradient(600px 200px at 20% 0%, rgba(99,91,255,.25), transparent 60%)" }} />
    </Link>
  );
}
