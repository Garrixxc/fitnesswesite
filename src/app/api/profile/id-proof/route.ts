import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id as string | undefined;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    const proofType = String(form.get("type") ?? "").trim().toUpperCase(); // e.g., PASSPORT

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: "Only JPG/PNG/PDF allowed" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 2MB)" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/\s+/g, "_").replace(/[^\w.\-]/g, "");
    const fname = `${Date.now()}_${userId}_${safeName}`;
    const destDir = "private/idproof";
    const destPath = `${destDir}/${fname}`;

    const fs = await import("fs/promises");
    await fs.mkdir(destDir, { recursive: true });

    // Write file
    await fs.writeFile(destPath, buf, { mode: 0o600 }); // 0600 for privacy

    // If user had an older file, you may delete it here (optional):
    const existing = await prisma.athleteProfile.findUnique({
      where: { userId },
      select: { idProofFilePath: true },
    });
    if (existing?.idProofFilePath && existing.idProofFilePath !== destPath) {
      try { await fs.unlink(existing.idProofFilePath); } catch {}
    }

    // Save metadata (reset verification)
    await prisma.athleteProfile.upsert({
      where: { userId },
      create: { userId, idProofType: proofType || null, idProofFilePath: destPath, idProofVerifiedAt: null },
      update: { idProofType: proofType || null, idProofFilePath: destPath, idProofVerifiedAt: null },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Upload failed" }, { status: 400 });
  }
}
