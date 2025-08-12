import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

// limits (2MB)
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_PDF_BYTES = 2 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    // text fields
    const title = String(form.get("title") ?? "").trim();
    const sport = (String(form.get("sport") ?? "RUN").toUpperCase()) as
      | "RUN"
      | "CYCLING"
      | "SWIM"
      | "TRIATHLON"
      | "TREK"
      | "OTHER";
    const distanceStr = String(form.get("distanceKm") ?? "").trim();
    const startDateStr = String(form.get("startDate") ?? "").trim();
    const endDateStr = String(form.get("endDate") ?? "").trim();
    const location = String(form.get("location") ?? "").trim();
    const addressJson = String(form.get("addressJson") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const priceStr = String(form.get("price") ?? "0").trim();
    const currency = String(form.get("currency") ?? "INR").trim();
    const capacityStr = String(form.get("capacity") ?? "").trim();

    if (title.length < 3) return NextResponse.json({ error: "Title too short" }, { status: 400 });
    if (description.length < 5) return NextResponse.json({ error: "Description too short" }, { status: 400 });
    if (!startDateStr) return NextResponse.json({ error: "Start date required" }, { status: 400 });

    // parse numbers
    const distanceKm = distanceStr ? Number(distanceStr) : null;
    const price = Number(priceStr || 0);
    const capacity = capacityStr ? Number(capacityStr) : null;

    // handle files (optional)
    let coverImage: string | null = null;
    let brochureUrl: string | null = null;

    const cover = form.get("coverImage");
    if (cover && cover instanceof File) {
      if (!["image/jpeg", "image/png"].includes(cover.type)) {
        return NextResponse.json({ error: "Cover must be JPG or PNG" }, { status: 400 });
      }
      if (cover.size > MAX_IMAGE_BYTES) {
        return NextResponse.json({ error: "Cover image too large (max 2MB)" }, { status: 400 });
      }

      // store in public/uploads/
      const buf = Buffer.from(await cover.arrayBuffer());
      const fileName = `${Date.now()}-${cover.name.replace(/\s+/g, "_")}`;
      const filePath = `public/uploads/${fileName}`;
      await import("fs/promises").then((fs) => fs.writeFile(filePath, buf));
      coverImage = `/uploads/${fileName}`;
    }

    const brochure = form.get("brochureFile");
    if (brochure && brochure instanceof File) {
      if (brochure.type !== "application/pdf") {
        return NextResponse.json({ error: "Brochure must be a PDF" }, { status: 400 });
      }
      if (brochure.size > MAX_PDF_BYTES) {
        return NextResponse.json({ error: "Brochure too large (max 2MB)" }, { status: 400 });
      }
      const buf = Buffer.from(await brochure.arrayBuffer());
      const fileName = `${Date.now()}-${brochure.name.replace(/\s+/g, "_")}`;
      const filePath = `public/uploads/${fileName}`;
      await import("fs/promises").then((fs) => fs.writeFile(filePath, buf));
      brochureUrl = `/uploads/${fileName}`;
    }

    // pick an organizer (placeholder until auth)
    const organizer =
      (await prisma.user.findFirst({ where: { role: "ORGANIZER" } })) ??
      (await prisma.user.findFirst());
    if (!organizer) {
      return NextResponse.json({ error: "No organizer user found. Seed an organizer first." }, { status: 400 });
    }

    const slug =
      slugify(title, { lower: true, strict: true }) +
      "-" +
      Math.random().toString(36).slice(2, 6);

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        sport,
        distanceKm,
        startDate: new Date(startDateStr),
        endDate: endDateStr ? new Date(endDateStr) : null,
        location,
        addressJson: addressJson ? (addressJson as any) : null,
        description,
        coverImage,
        brochureUrl,
        organizerId: organizer.id,
        price,
        currency: currency || "INR",
        capacity,
      },
    });

    return NextResponse.json({ ok: true, event }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? "Failed to create event" }, { status: 400 });
  }
}
