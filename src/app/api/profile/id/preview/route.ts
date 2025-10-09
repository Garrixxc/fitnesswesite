import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const prof = await prisma.athleteProfile.findUnique({
    where: { userId: session.user.id },
    select: { idProofFilePath: true },
  });

  const rel = prof?.idProofFilePath;
  if (!rel) return new Response("No file", { status: 404 });

  const abs = path.join(process.cwd(), rel.replace(/^\/+/, "")); // normalize
  const buf = await readFile(abs);

  // naive content-type detection based on extension
  const ext = path.extname(abs).toLowerCase();
  const type =
    ext === ".png" ? "image/png" :
    ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
    ext === ".webp" ? "image/webp" :
    ext === ".pdf" ? "application/pdf" :
    "application/octet-stream";

  return new Response(buf, { status: 200, headers: { "content-type": type } });
}
