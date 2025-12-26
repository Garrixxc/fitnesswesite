import { NextResponse } from "next/server";

// Stub implementation - Payment model not yet in schema
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  const event = JSON.parse(rawBody);

  console.log(`[RAZORPAY WEBHOOK STUB] Event: ${event.event}, Signature: ${signature.substring(0, 20)}...`);

  // TODO: Implement payment webhook processing when Payment model is added to schema
  return NextResponse.json({
    ok: true,
    stub: true,
    message: "Webhook processing pending Payment schema addition"
  });
}
