import { NextResponse } from "next/server";

const subscribers = new Set<string>();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const normalised = email.trim().toLowerCase();
    subscribers.add(normalised);

    console.log("[Newsletter Signup]", {
      email: normalised,
      subscribedAt: new Date().toISOString(),
      totalSubscribers: subscribers.size,
    });

    const webhookUrl = process.env.NEWSLETTER_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalised, subscribedAt: new Date().toISOString() }),
      }).catch((err) => console.error("Newsletter webhook failed:", err));
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
