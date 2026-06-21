import { NextResponse } from "next/server";

interface BookingPayload {
  name: string;
  phone: string;
  email?: string;
  service: string;
  eventType: string;
  eventDate: string;
  location: string;
  faces: string;
  preferredTime?: string;
  message?: string;
}

function validate(body: unknown): body is BookingPayload {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.name === "string" &&
    b.name.trim().length > 0 &&
    typeof b.phone === "string" &&
    b.phone.trim().length > 0 &&
    typeof b.service === "string" &&
    typeof b.eventType === "string" &&
    typeof b.eventDate === "string" &&
    typeof b.location === "string" &&
    typeof b.faces === "string"
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!validate(body)) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    // Log booking for server-side capture (replace with email/webhook via env)
    console.log("[Booking Request]", {
      ...body,
      receivedAt: new Date().toISOString(),
    });

    const webhookUrl = process.env.BOOKING_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).catch((err) => console.error("Webhook failed:", err));
    }

    return NextResponse.json({
      success: true,
      message:
        "Your booking request has been received. We'll confirm availability and send the next steps.",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process your request. Please try WhatsApp." },
      { status: 500 }
    );
  }
}
