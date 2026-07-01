import { NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference || !/^GLM-[A-Z0-9]+-[A-Z0-9]+$/.test(reference)) {
      return NextResponse.json(
        { error: "No payment reference provided." },
        { status: 400 }
      );
    }

    const result = await verifyTransaction(reference);
    const { status, amount, currency, customer, metadata, paid_at } = result.data;

    console.log("[Paystack Verification]", {
      reference,
      status,
      amount: amount / 100,
      currency,
      email: customer.email,
      metadata,
      paidAt: paid_at,
    });

    const webhookUrl = process.env.BOOKING_WEBHOOK_URL;
    if (webhookUrl && status === "success") {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "deposit_payment",
          reference,
          amount: amount / 100,
          currency,
          email: customer.email,
          metadata,
          paidAt: paid_at,
        }),
      }).catch((err) => console.error("Payment webhook failed:", err));
    }

    return NextResponse.json({
      status,
      reference,
      amount: amount / 100,
      currency,
    });
  } catch (err) {
    console.error("[Paystack Verify Error]", err);
    return NextResponse.json(
      { error: "Unable to verify payment." },
      { status: 500 }
    );
  }
}
