import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }

    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === "charge.success") {
      const { reference, amount, currency, customer, metadata } = event.data;

      console.log("[Paystack Webhook] Payment confirmed", {
        reference,
        amount: amount / 100,
        currency,
        email: customer?.email,
        metadata,
      });

      const webhookUrl = process.env.BOOKING_WEBHOOK_URL;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "deposit_confirmed",
            reference,
            amount: amount / 100,
            currency,
            email: customer?.email,
            metadata,
          }),
        }).catch((err) => console.error("Booking webhook failed:", err));
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
