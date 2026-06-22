import { siteConfig } from "@/lib/site-config";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

export interface PaystackInitPayload {
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
}

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: "success" | "abandoned" | "failed";
    reference: string;
    amount: number;
    currency: string;
    customer: { email: string };
    metadata: Record<string, unknown>;
    paid_at: string;
  };
}

function getSecretKey(): string {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }
  return PAYSTACK_SECRET_KEY;
}

export function generateReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `TM-${timestamp}-${random}`.toUpperCase();
}

export async function initializeTransaction(
  payload: PaystackInitPayload
): Promise<PaystackInitResponse> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      amount: payload.amount * 100,
      currency: payload.currency ?? siteConfig.currency,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Failed to initialize Paystack transaction");
  }

  return res.json();
}

export async function verifyTransaction(
  reference: string
): Promise<PaystackVerifyResponse> {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Failed to verify transaction");
  }

  return res.json();
}
