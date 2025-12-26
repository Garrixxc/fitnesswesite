import { NextResponse } from "next/server";

// Stub implementation - Supabase configuration required
export async function POST(req: Request) {
  console.log("[UPLOAD STUB] File upload pending Supabase configuration");

  return NextResponse.json({
    stub: true,
    message: "Upload functionality pending Supabase environment configuration",
  }, { status: 501 });
}
