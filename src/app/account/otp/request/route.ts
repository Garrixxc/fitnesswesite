import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import crypto from "crypto";

function hash(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    const { destination, purpose } = await req.json();
    if (!destination) return NextResponse.json({ error: "Destination required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const code = (Math.floor(100000 + Math.random() * 900000)).toString();
    const codeHash = hash(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otpRequest.create({
      data: {
        userId: user.id,
        destination,
        purpose: "PHONE_VERIFY",
        codeHash,
        status: "SENT",
        expiresAt,
      },
    });

    // DEV ONLY: log the one-time code
    console.log(`[OTP] ${destination} -> ${code}`);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Failed to send OTP" }, { status: 400 });
  }
}
