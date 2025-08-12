import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Validate size (<= 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 2MB)" }, { status: 400 });
    }

    // Validate type
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Decide folder based on type
    const folder = file.type === "application/pdf" ? "pdfs" : "images";
    const safeName = file.name.replace(/\s+/g, "-");
    const path = `${folder}/${Date.now()}-${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error } = await supabase.storage
      .from("event-media")
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (error) throw error;

    const { data } = supabase.storage.from("event-media").getPublicUrl(path);

    return NextResponse.json({
      url: data.publicUrl,
      kind: file.type === "application/pdf" ? "pdf" : "image",
      size: file.size,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 });
  }
}
