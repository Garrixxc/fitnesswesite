import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// Stub implementation - OtpRequest model not yet in schema
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not signed in" }, { status: 401 });
        }

        const { destination, code } = await req.json();
        if (!destination || !code) {
            return NextResponse.json({ error: "Destination and code required" }, { status: 400 });
        }

        // TODO: Implement OTP verification when OtpRequest model is added to schema
        return NextResponse.json({ ok: true, message: "OTP feature pending schema update" });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e?.message ?? "Failed to verify" }, { status: 400 });
    }
}
