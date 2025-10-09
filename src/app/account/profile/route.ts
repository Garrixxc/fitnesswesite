import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    const body = await req.json();
    const {
      name,
      phone,
      city,
      state,
      country,
      gender,
      tshirtSize,
      bloodGroup,
      dob,
      emergencyName,
      emergencyPhone,
      medicalNotes,
    } = body ?? {};

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (typeof name === "string" && name.trim() !== "") {
      await prisma.user.update({ where: { id: user.id }, data: { name: name.trim() } });
    }

    // upsert profile
    await prisma.athleteProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        phone: phone || null,
        city: city || null,
        state: state || null,
        country: country || null,
        gender: (gender as any) ?? "NA",
        tshirtSize: (tshirtSize as any) ?? "M",
        bloodGroup: (bloodGroup as any) ?? "UNKNOWN",
        dob: dob ? new Date(dob) : null,
        emergencyName: emergencyName || null,
        emergencyPhone: emergencyPhone || null,
        medicalNotes: medicalNotes || null,
      },
      update: {
        phone: phone || null,
        city: city || null,
        state: state || null,
        country: country || null,
        gender: (gender as any) ?? "NA",
        tshirtSize: (tshirtSize as any) ?? "M",
        bloodGroup: (bloodGroup as any) ?? "UNKNOWN",
        dob: dob ? new Date(dob) : null,
        emergencyName: emergencyName || null,
        emergencyPhone: emergencyPhone || null,
        medicalNotes: medicalNotes || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Failed to save profile" }, { status: 400 });
  }
}
