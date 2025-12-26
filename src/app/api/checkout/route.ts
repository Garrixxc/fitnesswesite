import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Stub implementation - Payment model not yet in schema
// Body: { refType: "EVENT"|"COACH"|"PLAN"|"CLUB"|"OTHER", refId: string, userId: string }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { refType, refId, userId } = body as {
      refType: "EVENT" | "COACH" | "PLAN" | "CLUB" | "OTHER";
      refId: string;
      userId: string;
    };

    // Lookup pricing based on refType
    let amountPaise = 0;
    let purpose = "";

    if (refType === "EVENT") {
      const ev = await prisma.event.findUnique({ where: { id: refId } });
      if (!ev) return NextResponse.json({ error: "Event not found" }, { status: 404 });
      amountPaise = (ev.price ?? 0) * 100;
      purpose = `Event: ${ev.title}`;
    } else {
      amountPaise = 1000;
      purpose = "Generic payment";
    }

    // TODO: Implement payment processing when Payment model is added to schema
    console.log(`[CHECKOUT STUB] ${purpose} - ₹${amountPaise / 100} for user ${userId}`);

    return NextResponse.json({
      ok: true,
      stub: true,
      message: "Payment processing pending schema update",
      amount: amountPaise,
      purpose,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
