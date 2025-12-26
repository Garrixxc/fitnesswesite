import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Stub implementation - OtpRequest model not yet in schema
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not signed in" }, { status: 401 });
        }

        const { destination, purpose } = await req.json();
        if (!destination) {
            return NextResponse.json({ error: "Destination required" }, { status: 400 });
        }

        // TODO: Implement OTP request logic when OtpRequest model is added to schema
        const code = (Math.floor(100000 + Math.random() * 900000)).toString();
        console.log(`[OTP STUB] ${destination} -> ${code}`);

        return NextResponse.json({ ok: true, message: "OTP feature pending schema update" });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e?.message ?? "Failed to send OTP" }, { status: 400 });
    }
}
