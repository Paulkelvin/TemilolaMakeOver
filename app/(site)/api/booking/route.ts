import { NextResponse } from "next/server";
import { sendBookingNotification, sendBookingConfirmation } from "@/lib/email";
import { writeClient } from "@/sanity/write-client";

interface BookingPayload {
  name: string;
  phone: string;
  email?: string;
  service: string;
  eventType?: string;
  eventDate: string;
  location: string;
  travelZone?: string;
  travelFee?: number | null;
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
    b.name.trim().length <= 100 &&
    typeof b.phone === "string" &&
    b.phone.trim().length >= 7 &&
    b.phone.trim().length <= 20 &&
    typeof b.service === "string" &&
    b.service.trim().length > 0 &&
    typeof b.eventDate === "string" &&
    b.eventDate.trim().length > 0 &&
    typeof b.location === "string" &&
    b.location.trim().length > 0 &&
    typeof b.faces === "string" &&
    (b.email === undefined ||
      b.email === "" ||
      (typeof b.email === "string" && b.email.includes("@"))) &&
    (b.message === undefined ||
      b.message === "" ||
      (typeof b.message === "string" && b.message.length <= 2000))
  );
}

function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const requestOrigin = new URL(request.url).origin;
  if (origin === requestOrigin) return true;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://temilolomakeup.com";
  const allowed = [siteUrl, "http://localhost:3000", "http://localhost:3001"];
  return allowed.some((u) => origin === u.replace(/\/$/, ""));
}

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function POST(request: Request) {
  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json(
        { error: "Request origin not allowed." },
        { status: 403 }
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();

    if (!validate(body)) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

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

    await Promise.allSettled([
      sendBookingNotification(body),
      sendBookingConfirmation(body),
    ]);

    let sanityBookingId: string | null = null;
    try {
      const doc = await writeClient.create({
        _type: "booking",
        clientName: body.name,
        phone: body.phone,
        email: body.email ?? "",
        service: body.service,
        eventType: body.eventType ?? "",
        eventDate: body.eventDate,
        eventTime: body.preferredTime ?? "",
        eventLocation: body.location,
        travelZone: body.travelZone ?? "",
        travelFee: typeof body.travelFee === "number" ? body.travelFee : 0,
        numberOfFaces: Number(body.faces) || 1,
        message: body.message ?? "",
        status: "pending",
        submittedAt: new Date().toISOString(),
      });
      sanityBookingId = doc._id;
    } catch (err: unknown) {
      console.error("[Sanity booking save failed]", err);
    }

    return NextResponse.json({
      success: true,
      message:
        "Your booking request has been received. We'll confirm availability and send the next steps.",
      sanityBookingId,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process your request. Please try WhatsApp." },
      { status: 500 }
    );
  }
}
