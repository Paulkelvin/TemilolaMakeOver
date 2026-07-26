import { NextResponse } from "next/server";
import { sendQuestionNotification, sendQuestionConfirmation } from "@/lib/email";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.gleambytemi.com";
  const allowed = [siteUrl, "http://localhost:3000", "http://localhost:3001"];
  return allowed.some((u) => origin === u.replace(/\/$/, ""));
}

export async function POST(request: Request) {
  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json(
        { error: "Request origin not allowed." },
        { status: 403 }
      );
    }

    const ip = getClientIp(request);

    if (isRateLimited(`ask-question:${ip}`, { windowMs: 60_000, max: 5 })) {
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
