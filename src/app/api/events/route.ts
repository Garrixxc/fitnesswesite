import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { revalidatePath } from "next/cache";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

function toInt(v: string | null | undefined) {
  if (!v) return null;
  const n = Math.floor(Number(v));
  return Number.isFinite(n) ? n : null;
}

function parseISOOrFail(s?: string | null, name = "date") {
  if (!s) throw new Error(`${name} required`);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid ${name}`);
  return d;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const title = String(form.get("title") ?? "").trim();
    const sport = (String(form.get("sport") ?? "RUN").toUpperCase()) as
      | "RUN" | "CYCLING" | "SWIM" | "TRIATHLON" | "TREK" | "OTHER";
    const location = String(form.get("location") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const currency = (String(form.get("currency") ?? "INR").trim() || "INR").toUpperCase();

    if (title.length < 3) return NextResponse.json({ error: "Title too short" }, { status: 400 });
    if (description.length < 5) return NextResponse.json({ error: "Description too short" }, { status: 400 });

    const startDate = parseISOOrFail(String(form.get("startDate")), "start date");
    const endDateStr = String(form.get("endDate") ?? "").trim();
    const endDate = endDateStr ? parseISOOrFail(endDateStr, "end date") : null;

    const distanceKm = form.get("distanceKm") ? Number(String(form.get("distanceKm"))) : null;
    const price = toInt(String(form.get("price"))) ?? 0;   // rupees
    const capacity = toInt(String(form.get("capacity")));

    // single file (optional)
    let coverImage: string | null = null;
    const file = form.get("coverFile");
    if (file instanceof File) {
      if (!ALLOWED.has(file.type)) {
        return NextResponse.json({ error: "File must be JPG/PNG/WEBP/PDF" }, { status: 400 });
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: "File too large (max 2MB)" }, { status: 400 });
      }
      const buf = Buffer.from(await file.arrayBuffer());
      const safe = file.name.replace(/\s+/g, "_").replace(/[^\w.\-]/g, "");
      const fname = `${Date.now()}-${safe}`;
      const fs = await import("fs/promises");
      await fs.mkdir("public/uploads", { recursive: true });
      await fs.writeFile(`public/uploads/${fname}`, buf);
      coverImage = `/uploads/${fname}`;
    }

    const slug =
      `${slugify(title, { lower: true, strict: true })}-${Math.random().toString(36).slice(2, 6)}`;

    const created = await prisma.event.create({
      data: {
        title,
        slug,
        sport,
        distanceKm: Number.isFinite(distanceKm ?? NaN) ? distanceKm : null,
        startDate,
        endDate,
        location,
        description,
        price,
        currency, // stays "INR"
        capacity,
        coverImage,
        organizerId: undefined, // optional
      },
      select: { slug: true },
    });

    revalidatePath("/events");
    const loc = `/events/${created.slug}`;
    return new NextResponse(JSON.stringify({ ok: true, slug: created.slug }), {
      status: 201,
      headers: { "Content-Type": "application/json", Location: loc },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed to create event" }, { status: 400 });
  }
}
