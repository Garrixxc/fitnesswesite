"use client";

import Script from "next/script";
import { useState } from "react";

type Props = {
  refType: "EVENT" | "PLAN" | "COACH" | "CLUB" | "OTHER";
  refId: string;
  userId: string;
  title: string;
  amount: number; // INR
};

export default function CheckoutClient(props: Props) {
  const [loading, setLoading] = useState(false);
  const disabled = props.amount <= 0 || loading;

  async function handlePay() {
    try {
      setLoading(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          refType: props.refType,
          refId: props.refId,
          userId: props.userId,
        }),
      }).then((r) => r.json());

      if (!res.ok) {
        alert(res.error ?? "Failed to create order");
        setLoading(false);
        return;
      }

      // @ts-ignore
      const Razorpay = (window as any).Razorpay;
      const rzp = new Razorpay({
        key: res.key,
        amount: res.amount,
        currency: res.currency,
        name: "FitnessHub",
        description: props.title,
        order_id: res.orderId,
        theme: { color: "#7c3aed" }, // brand color
        handler: function () {
          // We rely on webhook for the real truth.
          // Optionally show a soft success message:
          window.location.href = "/success?src=checkout";
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        prefill: {
          // Optional – set from your user profile if you have it
          name: "",
          email: "",
          contact: "",
        },
        notes: {
          refType: props.refType,
          refId: props.refId,
        },
      });

      rzp.open();
    } catch (e: any) {
      alert(e?.message ?? "Payment error");
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="mt-6 flex items-center justify-between">
        <div className="text-white/60 text-sm">
          UPI • Cards • Netbanking supported
        </div>
        <button
          onClick={handlePay}
          disabled={disabled}
          className={`rounded-xl px-4 py-2 font-medium ${
            disabled
              ? "bg-white/10 text-white/40 cursor-not-allowed"
              : "bg-primary/70 text-white hover:bg-primary/80"
          }`}
        >
          {loading ? "Processing…" : `Pay ₹${props.amount}`}
        </button>
      </div>
    </>
  );
}
