const PAYSTACK_API = "https://api.paystack.co";

function getSecret(): string {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return secret;
}

async function paystackFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${PAYSTACK_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getSecret()}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const data = (await res.json()) as { status: boolean; message: string; data: T };

  if (!res.ok || !data.status) {
    throw new Error(data.message ?? `Paystack error: ${res.status}`);
  }

  return data as T;
}

export interface InitializeTransactionParams {
  email: string;
  amount: number;
  reference: string;
  callback_url: string;
  metadata?: Record<string, unknown>;
}

export interface InitializeTransactionResult {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export async function initializeTransaction(
  params: InitializeTransactionParams
): Promise<InitializeTransactionResult> {
  return paystackFetch<InitializeTransactionResult>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      ...params,
      amount: Math.round(params.amount * 100), // convert to kobo
    }),
  });
}

export interface VerifyTransactionResult {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    customer: {
      email: string;
      first_name?: string;
      last_name?: string;
    };
    metadata?: {
      sanity_booking_id?: string;
      custom_fields?: Array<{
        display_name: string;
        variable_name: string;
        value: string;
      }>;
    };
  };
}

export async function verifyTransaction(reference: string): Promise<VerifyTransactionResult> {
  return paystackFetch<VerifyTransactionResult>(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
}

export function generateReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `GLM-${timestamp}-${random}`;
}
