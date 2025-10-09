// src/app/api/profile/id/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const type = String(form.get("type") ?? "GOVT_ID");
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "No file received." }, { status: 400 });
    }

    // basic validation
    const allowed = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
    ];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: "Unsupported file type." },
        { status: 400 }
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: "File too large (max 5 MB)." },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const filename = `${Date.now()}_${safeName}`;
    const dir = path.join(process.cwd(), "private", "idproof", userId);
    const absPath = path.join(dir, filename);
    const relPath = `/private/idproof/${userId}/${filename}`;

    await mkdir(dir, { recursive: true });
    await writeFile(absPath, bytes);

    // Store path on profile (note the field name!)
    await prisma.athleteProfile.upsert({
      where: { userId },
      update: {
        idProofType: type,
        idProofFilePath: relPath,   // ✅ write to idProofFilePath
        // reset verification until you build reviewer flow
        idProofVerifiedAt: null,
      },
      create: {
        userId,
        idProofType: type,
        idProofFilePath: relPath,   // ✅ create with path too
      },
    });

    return NextResponse.json({ ok: true, path: relPath });
  } catch (err: any) {
    // Make Prisma / generic errors human-friendly
    const raw = String(err?.message || err);
    const pretty =
      raw.includes("Unknown arg")
        ? "Server field mismatch. Please make sure the database field is named idProofFilePath."
        : raw.includes("permission")
        ? "Server cannot write the file. Check folder permissions."
        : raw;
    return NextResponse.json({ ok: false, error: pretty }, { status: 500 });
  }
}
