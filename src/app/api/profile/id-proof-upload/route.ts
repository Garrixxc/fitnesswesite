import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

const MAX = 5 * 1024 * 1024; // 5MB
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const f = form.get("file");
    const type = String(form.get("type") ?? "GOVT_ID").slice(0, 40);

    if (!(f instanceof File)) {
      return NextResponse.json({ error: "File required" }, { status: 400 });
    }
    if (!ALLOWED.has(f.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }
    if (f.size > MAX) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const baseDir = path.join(process.cwd(), "private", "idproof");
    await mkdir(baseDir, { recursive: true });

    const safeName = f.name.replace(/\s+/g, "_").replace(/[^\w.\-]/g, "");
    const filename = `${Date.now()}_${randomUUID()}_${safeName}`;
    const fullPath = path.join(baseDir, filename);

    const buf = Buffer.from(await f.arrayBuffer());
    await writeFile(fullPath, buf, { mode: 0o600 }); // private perms

    // Upsert profile and store only filename + type (keep file path private)
    await prisma.athleteProfile.upsert({
      where: { userId },
      update: {
        idProofType: type,
        idProofFile: filename,
        // do NOT set idProofVerifiedAt here; that’s for admins
      },
      create: {
        userId,
        idProofType: type,
        idProofFile: filename,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Upload failed" }, { status: 500 });
  }
}
