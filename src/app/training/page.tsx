// src/app/training/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function TrainingIndexPage() {
  const plans = await prisma.trainingPlan.findMany({
    orderBy: [{ isPremium: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      sport: true,
      level: true,
      weeks: true,
      price: true,
      compareAtPrice: true, // safe even if you didn’t add the column; remove if skipping schema change
      isPremium: true,
      coverImage: true,
      description: true,
    },
  });

  return (
    <main className="min-h-screen bg-[#0B1224] text-white">
      <section className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Training Plans</h1>
          <p className="text-white/60 mt-1">plans: {plans.length}</p>
        </header>

        {plans.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/70">
            No plans yet.{" "}
            <Link href="/training/create" className="underline text-white">
              Create one
            </Link>
            .
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((p) => {
              const isFree = p.price === 0;
              const showStrike =
                typeof p.compareAtPrice === "number" &&
                p.compareAtPrice > p.price &&
                p.price > 0;

              return (
                <li key={p.id}>
                  <Link
                    href={`/training/${p.slug}`}
                    className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.6)] hover:bg-white/[0.06] transition"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.coverImage || "/placeholder.jpg"}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 flex gap-2">
                        <Badge
                          variant={isFree ? "success" : p.isPremium ? "premium" : "neutral"}
                        >
                          {isFree ? "Free" : p.isPremium ? "Premium" : "Standard"}
                        </Badge>
                        <Badge variant="ghost">
                          {p.sport} · {p.level} · {p.weeks} wk
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-2">{p.title}</h3>

                      {p.description ? (
                        <p className="mt-1 text-sm text-white/60 line-clamp-2">
                          {p.description}
                        </p>
                      ) : null}

                      {/* Price row */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm text-white/70">
                          {isFree ? (
                            <span className="text-white font-medium">Free</span>
                          ) : (
                            <div className="flex items-baseline gap-2">
                              {showStrike && (
                                <span className="line-through text-white/40">
                                  {formatINR(p.compareAtPrice as number)}
                                </span>
                              )}
                              <span className="text-white font-semibold">
                                {formatINR(p.price)}
                              </span>
                            </div>
                          )}
                        </div>

                        <span className="text-sm text-[#8EA0FF] group-hover:underline">
                          View plan →
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

/* ---------------- UI bits ---------------- */

function Badge({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: "neutral" | "ghost" | "premium" | "success";
}) {
  const styles = {
    neutral:
      "bg-black/50 text-white/90 border border-white/10",
    ghost:
      "bg-black/30 text-white/80 border border-white/10",
    premium:
      "bg-[#3A2FFF]/70 text-white border border-white/10",
    success:
      "bg-emerald-500/80 text-black border border-emerald-400/40",
  }[variant];

  return (
    <span className={`px-2 py-1 text-xs rounded-full backdrop-blur ${styles}`}>
      {children}
    </span>
  );
}
