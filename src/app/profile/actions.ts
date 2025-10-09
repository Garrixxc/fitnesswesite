"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function computePct(p: {
  city?: string | null;
  state?: string | null;
  country?: string | null;
  gender?: string | null;
  bloodGroup?: string | null;
  tshirtSize?: string | null;
  phone?: string | null;
  emergencyName?: string | null;
  emergencyPhone?: string | null;
  idProofFilePath?: string | null;
}) {
  const required = [
    p.city, p.state, p.country, p.gender, p.bloodGroup, p.tshirtSize,
    p.phone, p.emergencyName, p.emergencyPhone, p.idProofFilePath, // idProofFilePath gates 100%
  ];
  const filled = required.filter(Boolean).length;
  return Math.round((filled / required.length) * 100);
}

export async function saveProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not authenticated." };

  const userId = session.user.id;

  const name = (formData.get("name") as string) || null;
  const city = (formData.get("city") as string) || null;
  const state = (formData.get("state") as string) || null;
  const country = (formData.get("country") as string) || null;
  const phone = (formData.get("phone") as string) || null;
  const dobStr = (formData.get("dob") as string) || null;
  const gender = (formData.get("gender") as string) || "NA";
  const bloodGroup = (formData.get("bloodGroup") as string) || "UNKNOWN";
  const tshirtSize = (formData.get("tshirtSize") as string) || "M";
  const emergencyName = (formData.get("emergencyName") as string) || null;
  const emergencyPhone = (formData.get("emergencyPhone") as string) || null;
  const medicalNotes = (formData.get("medicalNotes") as string) || null;

  await prisma.user.update({
    where: { id: userId },
    data: { name: name || undefined },
  });

  await prisma.athleteProfile.upsert({
    where: { userId },
    update: {
      city, state, country, phone,
      gender: gender as any,
      bloodGroup: bloodGroup as any,
      tshirtSize: tshirtSize as any,
      emergencyName, emergencyPhone, medicalNotes,
      dob: dobStr ? new Date(dobStr) : null,
    },
    create: {
      userId, city, state, country, phone,
      gender: gender as any,
      bloodGroup: bloodGroup as any,
      tshirtSize: tshirtSize as any,
      emergencyName, emergencyPhone, medicalNotes,
      dob: dobStr ? new Date(dobStr) : null,
    },
  });

  // pull fresh for pct
  const fresh = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: {
      city: true, state: true, country: true, gender: true, bloodGroup: true,
      tshirtSize: true, phone: true, emergencyName: true, emergencyPhone: true,
      idProofFilePath: true,
    },
  });

  return { ok: true, pct: computePct(fresh ?? {}) };
}
