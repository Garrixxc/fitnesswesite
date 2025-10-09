import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { EventForm } from "@/app/events/create/partials/event-form";

export default async function EditEvent({ params }: { params: { slug: string }}) {
  const e = await prisma.event.findUnique({ where: { slug: params.slug }});
  if (!e) return notFound();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-black">
      <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">Edit Event</h1>
        <div className="mt-6">
          <EventForm
            mode="edit"
            initial={{
              slug: e.slug,
              title: e.title,
              sport: e.sport as any,
              distanceKm: e.distanceKm ?? undefined,
              startDate: e.startDate,
              endDate: e.endDate ?? undefined,
              location: e.location,
              addressJson: e.addressJson ? JSON.stringify(e.addressJson) : "",
              description: e.description,
              price: e.price,
              currency: e.currency,
              requireApproval: e.requireApproval,
              capacity: e.capacity ?? undefined,
              coverImage: e.coverImage ?? "",
              brochureUrl: e.brochureUrl ?? ""
            }}
          />
        </div>
      </div>
    </main>
  );
}
