// server part
import { prisma } from "@/lib/prisma";
import CheckoutClient from "./ui/CheckoutClient";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { type?: string; id?: string; user?: string };
}) {
  const refType = (searchParams.type ?? "OTHER").toUpperCase() as
    | "EVENT"
    | "PLAN"
    | "COACH"
    | "CLUB"
    | "OTHER";
  const refId = searchParams.id ?? "";
  const userId = searchParams.user ?? ""; // replace with auth user id

  if (!refId || !userId) {
    return <div className="p-6 text-white/80">Missing id/user. Please go back.</div>;
  }

  // Fetch item for summary
  let title = "Checkout";
  let price = 0;
  let image: string | null = null;
  if (refType === "EVENT") {
    const ev = await prisma.event.findUnique({ where: { id: refId } });
    if (!ev) return <div className="p-6 text-white/80">Event not found.</div>;
    title = ev.title;
    price = ev.price ?? 0;
    image = ev.coverImage ?? null;
  } else if (refType === "PLAN") {
    const p = await prisma.trainingPlan.findUnique({ where: { id: refId } });
    if (!p) return <div className="p-6 text-white/80">Plan not found.</div>;
    title = p.title;
    price = p.price ?? 0;
    image = p.coverImage ?? null;
  } else if (refType === "COACH") {
    const c = await prisma.coach.findUnique({ where: { id: refId } });
    if (!c) return <div className="p-6 text-white/80">Coach not found.</div>;
    title = `${c.name} — 1 month coaching`;
    price = c.monthlyRate ?? 0;
    image = c.photoUrl ?? null;
  } else {
    title = "Generic payment";
    price = 10; // fallback
  }

  return (
    <main className="min-h-screen bg-[rgb(var(--brand-surface))]">
      <section className="mx-auto max-w-3xl p-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-[0_10px_40px_-15px_rgba(0,0,0,0.6)]">
          <div className="flex gap-4">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={title}
                className="h-24 w-24 rounded-2xl object-cover"
              />
            ) : null}
            <div>
              <h1 className="text-xl font-bold">{title}</h1>
              <p className="mt-1 text-white/70">Amount: ₹{price}</p>
              <p className="text-white/40 text-sm">Type: {refType}</p>
            </div>
          </div>

          <CheckoutClient
            refType={refType}
            refId={refId}
            userId={userId}
            title={title}
            amount={price}
          />
        </div>
      </section>
    </main>
  );
}
