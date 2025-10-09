import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const rawBody = await req.text(); // IMPORTANT: read raw body
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (signature !== expected) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  try {
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const entity = event.payload?.payment?.entity || event.payload?.order?.entity;
      const razorpayOrderId = entity?.order_id ?? entity?.id;

      // Find our Payment by order id
      const pay = await prisma.payment.findFirst({
        where: { razorpayOrderId },
      });
      if (!pay) return NextResponse.json({ ok: true }); // no-op

      // Update status + store references
      await prisma.payment.update({
        where: { id: pay.id },
        data: {
          status: "PAID",
          razorpayPaymentId: entity?.id ?? null,
          razorpaySignature: signature,
        },
      });

      // SIDE-EFFECTS: e.g., create Registration if it was an Event payment
      if (pay.refType === "EVENT") {
        // Avoid duplicates (unique on [userId,eventId] already in your schema)
        await prisma.registration.upsert({
          where: { userId_eventId: { userId: pay.userId, eventId: pay.refId } },
          create: {
            userId: pay.userId,
            eventId: pay.refId,
            status: "PAID",
          },
          update: { status: "PAID" },
        });
      }

      // Add your own side-effects for COACH/PLAN/CLUB here…

      return NextResponse.json({ ok: true });
    }

    if (event.event === "payment.failed") {
      const entity = event.payload?.payment?.entity;
      const razorpayOrderId = entity?.order_id;
      if (razorpayOrderId) {
        const pay = await prisma.payment.findFirst({ where: { razorpayOrderId } });
        if (pay) {
          await prisma.payment.update({
            where: { id: pay.id },
            data: { status: "FAILED" },
          });
        }
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true }); // ignore other events for now
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
