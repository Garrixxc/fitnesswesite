// app/api/events/[slug]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getSessionUser, canManageEvent } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Shared select to keep payload small
const EVENT_PUBLIC_SELECT = {
  id: true,
  slug: true,
  title: true,
  sport: true,
  distanceKm: true,
  startDate: true,
  endDate: true,
  location: true,
  addressJson: true,
  description: true,
  coverImage: true,
  brochureUrl: true,
  price: true,
  currency: true,
  capacity: true,
  organizerId: true, // needed for auth check
} as const;

// PATCH body validation (all optional fields)
const PatchSchema = z.object({
  title: z.string().min(3).optional(),
  sport: z.enum(["RUN", "CYCLING", "SWIM", "TRIATHLON", "TREK", "OTHER"]).optional(),
  distanceKm: z.number().nullable().optional(),
  startDate: z.string().optional(), // ISO string
  endDate: z.string().nullable().optional(),
  location: z.string().min(2).optional(),
  addressJson: z.string().optional(),
  description: z.string().min(5).optional(),
  coverImage: z.string().url().nullable().optional(),
  brochureUrl: z.string().url().nullable().optional(),
  price: z.number().int().nonnegative().optional(),
  currency: z.string().optional(),
  capacity: z.number().int().nullable().optional(),
});

// GET /api/events/[slug]  (public)
export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    select: EVENT_PUBLIC_SELECT,
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

// PATCH /api/events/[slug]  (organizer or admin)
export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  const user = await getSessionUser(req);
  const existing = await prisma.event.findUnique({
    where: { slug: params.slug },
    select: { organizerId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!canManageEvent(user, existing.organizerId)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  let body: z.infer<typeof PatchSchema>;
  try {
    body = PatchSchema.parse(await req.json());
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Invalid input" }, { status: 400 });
  }

  // Map date strings to Date
  const data: any = { ...body };
  if (body.startDate) data.startDate = new Date(body.startDate);
  if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;
  if (body.addressJson) data.addressJson = body.addressJson as any; // JSON text

  const updated = await prisma.event.update({
    where: { slug: params.slug },
    data,
    select: EVENT_PUBLIC_SELECT,
  });

  return NextResponse.json(updated);
}

// DELETE /api/events/[slug]  (organizer or admin)
export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
  const user = await getSessionUser(req);
  const existing = await prisma.event.findUnique({
    where: { slug: params.slug },
    select: { id: true, organizerId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!canManageEvent(user, existing.organizerId)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // TODO: if you need to cascade delete registrations/reviews, do it here (in a tx)
  await prisma.event.delete({ where: { id: existing.id } });

  return NextResponse.json({ ok: true });
}
