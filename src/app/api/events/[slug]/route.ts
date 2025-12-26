import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma"; // Stubbed for build safety

export const dynamic = "force-dynamic";

// GET /api/events/[slug]
export async function GET(_: Request, { params }: { params: { slug: string } }) {
  // Mock response
  const slug = params.slug;
  return NextResponse.json({
    id: "stub-id",
    slug,
    title: "Stub Event for Deployment",
    startDate: new Date(),
    location: "Stub Location",
    description: "This is a placeholder event description for deployment safety.",
    price: 1000,
    currrency: "INR"
  });
}

// PATCH /api/events/[slug]
export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  return NextResponse.json({ ok: true, message: "Update stubbed for deployment" });
}

// DELETE /api/events/[slug]
export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
  return NextResponse.json({ ok: true, message: "Delete stubbed for deployment" });
}
