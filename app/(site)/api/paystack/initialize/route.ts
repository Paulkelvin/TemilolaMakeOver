import { NextResponse } from "next/server";
import { initializeTransaction, generateReference } from "@/lib/paystack";
import { siteConfig } from "@/lib/site-config";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(`paystack-init:${ip}`, { windowMs: 60_000, max: 3 })) {
      return NextResponse.json(
        { error: "Too many payment attempts. Please try again in a minute." },
        { status: 429 }
      );
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payment is not configured yet. Please pay via bank transfer or WhatsApp." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { email, amount, service, name, eventDate, sanityBookingId } = body;

    if (!email || !amount || !service || !name) {
      return NextResponse.json(
        { error: "Missing required payment details." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address (e.g. name@example.com)" },
        { status: 400 }
      );
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 5000 || numAmount > 2000000) {
      return NextResponse.json(
        { error: "Invalid payment amount." },
        { status: 400 }
      );
    }

    const reference = generateReference();
    const callbackUrl = `${siteConfig.url}/payment/verify?reference=${reference}`;

    const result = await initializeTransaction({
      email,
      amount: numAmount,
      reference,
      callback_url: callbackUrl,
      metadata: {
        sanity_booking_id: sanityBookingId ?? null,
        custom_fields: [
          { display_name: "Client Name", variable_name: "client_name", value: name },
          { display_name: "Service", variable_name: "service", value: service },
          { display_name: "Event Date", variable_name: "event_date", value: eventDate ?? "Not specified" },
          { display_name: "Payment Type", variable_name: "payment_type", value: "Deposit (50%)" },
        ],
      },
    });

    return NextResponse.json({
      authorization_url: result.data.authorization_url,
      reference: result.data.reference,
    });
  } catch (err) {
    console.error("[Paystack Init Error]", err);
    const message = err instanceof Error ? err.message : "";
    const isEmailIssue = /email/i.test(message) || /invalid.*customer/i.test(message);
    return NextResponse.json(
      {
        error: isEmailIssue
          ? "Please enter a valid email address (e.g. name@example.com)"
          : "Unable to initialize payment. Please try again or use WhatsApp.",
      },
      { status: isEmailIssue ? 400 : 500 }
    );
  }
}
