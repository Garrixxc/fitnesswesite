import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

// Stub implementation - EventForm component interface mismatch
export default async function EditEvent({ params }: { params: { slug: string } }) {
  const e = await prisma.event.findUnique({ where: { slug: params.slug } });
  if (!e) return notFound();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-black">
      <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">Edit Event</h1>
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center text-white/70">
          <p className="text-lg">Event editing functionality pending component interface updates.</p>
          <p className="mt-2 text-sm">Event: <span className="font-semibold text-white">{e.title}</span></p>
          <a href="/events" className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
            Back to Events
          </a>
        </div>
      </div>
    </main>
  );
}
