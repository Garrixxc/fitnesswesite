// src/app/api/profile/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const form = await req.formData();

    // simple coercion/guarding
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const city = String(form.get("city") ?? "").trim();
    const state = String(form.get("state") ?? "").trim();
    const country = String(form.get("country") ?? "").trim();
    const dobStr = String(form.get("dob") ?? "").trim();
    const gender = String(form.get("gender") ?? "NA") as any;
    const bloodGroup = String(form.get("bloodGroup") ?? "UNKNOWN") as any;
    const tshirtSize = String(form.get("tshirtSize") ?? "M") as any;
    const emergencyName = String(form.get("emergencyName") ?? "").trim();
    const emergencyPhone = String(form.get("emergencyPhone") ?? "").trim();
    const medicalNotes = String(form.get("medicalNotes") ?? "").trim();

    if (name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name },
      });
    }

    await prisma.athleteProfile.upsert({
      where: { userId: user.id },
      update: {
        phone,
        city,
        state,
        country,
        gender,
        bloodGroup,
        tshirtSize,
        emergencyName,
        emergencyPhone,
        medicalNotes,
        dob: dobStr ? new Date(dobStr) : null,
      },
      create: {
        userId: user.id,
        phone,
        city,
        state,
        country,
        gender,
        bloodGroup,
        tshirtSize,
        emergencyName,
        emergencyPhone,
        medicalNotes,
        dob: dobStr ? new Date(dobStr) : null,
      },
    });

    revalidatePath("/profile");
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Failed to save" }, { status: 400 });
  }
}
