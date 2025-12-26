// src/app/api/auth/[...nextauth]/route.ts
import { NextResponse } from "next/server";
// import { handlers } from "@/auth"; // Stubbed for build safety

export const dynamic = "force-dynamic";

// Stub handlers
const stubHandler = () => NextResponse.json({ message: "Auth stubbed for deployment" });
export const GET = stubHandler;
export const POST = stubHandler;
