import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRazorpay } from "@/lib/razorpay";

// Body: { refType: "EVENT"|"COACH"|"PLAN"|"CLUB"|"OTHER", refId: string, userId: string }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { refType, refId, userId } = body as {
      refType: "EVENT" | "COACH" | "PLAN" | "CLUB" | "OTHER";
      refId: string;
      userId: string;
    };

    // 1) Look up amount & purpose based on refType
    // You can expand these lookups as needed.
    let amountPaise = 0;
    let purpose = "";
    let currency = "INR";
    let metadata: Record<string, any> = { refType, refId };

    if (refType === "EVENT") {
      const ev = await prisma.event.findUnique({ where: { id: refId } });
      if (!ev) return NextResponse.json({ error: "Event not found" }, { status: 404 });
      amountPaise = (ev.price ?? 0) * 100;
      purpose = `Event: ${ev.title}`;
      metadata.slug = ev.slug;
    } else if (refType === "PLAN") {
      const plan = await prisma.trainingPlan.findUnique({ where: { id: refId } });
      if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      amountPaise = (plan.price ?? 0) * 100;
      purpose = `Training Plan: ${plan.title}`;
    } else if (refType === "COACH") {
      const coach = await prisma.coach.findUnique({ where: { id: refId } });
      if (!coach) return NextResponse.json({ error: "Coach not found" }, { status: 404 });
      amountPaise = (coach.monthlyRate ?? 0) * 100;
      purpose = `Coach: ${coach.name} (1 month)`;
    } else if (refType === "CLUB") {
      // Example: joining fees if you add one later
      amountPaise = 5000; // ₹50 as placeholder
      purpose = "Club membership";
    } else {
      amountPaise = 1000;
      purpose = "Generic payment";
    }

    // Optional: zero price (free) short-circuit
    if (amountPaise <= 0) {
      const free = await prisma.payment.create({
        data: {
          userId,
          refType,
          refId,
          purpose,
          amount: 0,
          currency,
          status: "PAID",
          metadata,
        },
      });
      // Trigger side-effects here (e.g., auto-register)
      return NextResponse.json({ ok: true, free: true, paymentId: free.id });
    }

    // 2) Create Payment row (INITIATED)
    const payment = await prisma.payment.create({
      data: {
        userId,
        refType,
        refId,
        purpose,
        amount: amountPaise,
        currency,
        status: "INITIATED",
        metadata,
      },
    });

    // 3) Create Razorpay Order
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency,
      receipt: payment.id, // we’ll use this to map back
      payment_capture: 1,
    });

    // 4) Save order id on Payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: { razorpayOrderId: order.id },
    });

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      amount: amountPaise,
      currency,
      paymentId: payment.id,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      purpose,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
