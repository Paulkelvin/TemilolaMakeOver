import { NextResponse } from "next/server";
import { initializeTransaction, generateReference } from "@/lib/paystack";
import { siteConfig } from "@/lib/site-config";

const rateLimit = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 3;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) {
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

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 5000 || numAmount > 500000) {
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
    return NextResponse.json(
      { error: "Unable to initialize payment. Please try again or use WhatsApp." },
      { status: 500 }
    );
  }
}
