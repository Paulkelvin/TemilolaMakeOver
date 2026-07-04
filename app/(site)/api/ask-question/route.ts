import { NextResponse } from "next/server";
import { sendQuestionNotification, sendQuestionConfirmation } from "@/lib/email";

interface QuestionPayload {
  name?: string;
  email: string;
  question: string;
}

function validate(body: unknown): body is QuestionPayload {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.email === "string" &&
    b.email.includes("@") &&
    b.email.trim().length <= 200 &&
    typeof b.question === "string" &&
    b.question.trim().length > 0 &&
    b.question.trim().length <= 2000 &&
    (b.name === undefined ||
      b.name === "" ||
      (typeof b.name === "string" && b.name.trim().length <= 100))
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
        { error: "Please enter a valid email and question." },
        { status: 400 }
      );
    }

    const payload: QuestionPayload = {
      name: body.name?.trim() || undefined,
      email: body.email.trim(),
      question: body.question.trim(),
    };

    console.log("[FAQ Question]", {
      ...payload,
      receivedAt: new Date().toISOString(),
    });

    await Promise.allSettled([
      sendQuestionNotification(payload),
      sendQuestionConfirmation(payload),
    ]);

    return NextResponse.json({
      success: true,
      message: "Your question has been sent. We'll reply to your email within 24 hours.",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to send your question. Please try WhatsApp instead." },
      { status: 500 }
    );
  }
}
