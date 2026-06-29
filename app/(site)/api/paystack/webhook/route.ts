import { NextResponse } from "next/server";
import crypto from "crypto";
import { writeClient } from "@/sanity/write-client";
import { sendPaymentConfirmation } from "@/lib/email";

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
      const { reference, amount, currency, customer, metadata, paid_at } = event.data;

      console.log("[Paystack Webhook] Payment confirmed", {
        reference,
        amount: amount / 100,
        currency,
        email: customer?.email,
        metadata,
      });

      const sanityBookingId = metadata?.sanity_booking_id as string | undefined;

      if (sanityBookingId) {
        writeClient
          .patch(sanityBookingId)
          .set({ status: "paid", paidAt: paid_at ?? new Date().toISOString() })
          .commit()
          .catch((err: unknown) => console.error("[Sanity payment update failed]", err));
      }

      const clientEmail = customer?.email as string | undefined;
      const customFields = Array.isArray(metadata?.custom_fields) ? metadata.custom_fields : [];
      const clientName = customFields.find((f: { variable_name: string; value: string }) => f.variable_name === "client_name")?.value ?? "Client";
      const service = customFields.find((f: { variable_name: string; value: string }) => f.variable_name === "service")?.value ?? "Makeup Service";
      const eventDate = customFields.find((f: { variable_name: string; value: string }) => f.variable_name === "event_date")?.value ?? "";

      if (clientEmail) {
        sendPaymentConfirmation({
          name: clientName,
          email: clientEmail,
          service,
          eventDate,
          amountPaid: amount / 100,
          currency: currency ?? "NGN",
          reference,
        }).catch((err: unknown) => console.error("[Payment email failed]", err));
      }

      const webhookUrl = process.env.BOOKING_WEBHOOK_URL;
      if (webhookUrl) {
        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "deposit_confirmed",
            reference,
            amount: amount / 100,
            currency,
            email: clientEmail,
            metadata,
          }),
        }).catch((err: unknown) => console.error("Booking webhook failed:", err));
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
