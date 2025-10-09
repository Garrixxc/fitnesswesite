import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function TrainingPage() {
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
      compareAt: true,
      isPremium: true,
      coverImage: true,
      description: true,
    },
    take: 30,
  });

  return (
    <main className="min-h-screen bg-[rgb(var(--brand-surface))]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-3xl font-extrabold text-white">Training plans</h1>
        <p className="mt-1 text-white/70">Structured plans by sport & level.</p>

        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => (
            <li key={p.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
              <div className="relative h-36 w-full bg-white/[0.03]">
                {p.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverImage} alt={p.title} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <span className="rounded-full border border-white/15 bg-black/50 px-2 py-0.5">{String(p.sport)}</span>
                  <span className="rounded-full border border-white/15 bg-black/50 px-2 py-0.5">{String(p.level)}</span>
                  <span className="rounded-full border border-white/15 bg-black/50 px-2 py-0.5">{p.weeks} weeks</span>
                  {p.isPremium ? <span className="rounded-full bg-primary/20 px-2 py-0.5 text-primary">Premium</span> : null}
                </div>
                <h3 className="mt-2 font-semibold text-white">{p.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-white/70">{p.description}</p>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-white">
                    {p.compareAt ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-white/60 line-through">
                          ₹{new Intl.NumberFormat("en-IN").format(p.compareAt)}
                        </span>
                        <span className="text-lg font-bold">
                          ₹{new Intl.NumberFormat("en-IN").format(p.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold">
                        {p.price > 0 ? `₹${new Intl.NumberFormat("en-IN").format(p.price)}` : "Free"}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/training/${p.slug}`}
                    className="rounded-md border border-white/10 bg-white/[0.06] px-3 py-1.5 text-white/90 hover:bg-white/[0.12]"
                  >
                    View
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
