import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const clubs = await prisma.club.findMany({
    orderBy: [{ members: "desc" }, { name: "asc" }],
    select: { id: true, slug: true, name: true, city: true, sports: true, members: true },
  });
  return NextResponse.json({ count: clubs.length, clubs });
}
