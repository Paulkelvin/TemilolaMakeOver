"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

interface VerifyResult {
  status: "success" | "abandoned" | "failed";
  reference: string;
  amount: number;
  currency: string;
}

export function PaymentVerifier() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [state, setState] = useState<"loading" | "success" | "failed" | "error">("loading");
  const [result, setResult] = useState<VerifyResult | null>(null);

  useEffect(() => {
    if (!reference) {
      setState("error");
      return;
    }

    fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setState("success");
          setResult(data);
        } else {
          setState("failed");
          setResult(data);
        }
      })
      .catch(() => setState("error"));
  }, [reference]);

  if (state === "loading") {
    return (
      <div className="w-full text-center">
        <Loader2 className="w-10 h-10 text-accent-rose animate-spin mx-auto" />
        <p className="mt-4 text-text-muted">Verifying your payment...</p>
      </div>
    );
  }

  if (state === "success" && result) {
    return (
      <div className="w-full rounded-2xl border border-border bg-card p-8 md:p-10 text-center shadow-card">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="font-display text-2xl md:text-3xl text-text-primary">
          Payment Received!
        </h1>
        <p className="mt-3 text-text-muted leading-relaxed">
          Your deposit of <strong className="text-text-primary">{formatPrice(result.amount)}</strong> has
          been confirmed. Your booking date is now secured.
        </p>
        <div className="mt-6 rounded-xl bg-bg-blush border border-border p-5 text-left text-sm">
          <div className="flex justify-between py-1">
            <span className="text-text-muted">Reference</span>
            <span className="font-medium text-text-primary">{result.reference}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-text-muted">Amount</span>
            <span className="font-medium text-text-primary">{formatPrice(result.amount)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-text-muted">Status</span>
            <span className="font-medium text-green-600">Confirmed</span>
          </div>
        </div>
        <p className="mt-6 text-sm text-text-muted">
          We&apos;ll reach out on WhatsApp to confirm the details. Save your reference number.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-accent-rose text-white font-medium text-sm px-6 py-3 hover:bg-accent-rose-dark transition-colors"
          >
            Back to Home
          </Link>
          <a
            href={`https://wa.me/${siteConfig.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-border text-text-primary font-medium text-sm px-6 py-3 hover:bg-bg-blush transition-colors"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-8 md:p-10 text-center shadow-card">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
        <XCircle className="w-8 h-8 text-red-500" />
      </div>
      <h1 className="font-display text-2xl md:text-3xl text-text-primary">
        Payment {state === "failed" ? "Not Completed" : "Verification Failed"}
      </h1>
      <p className="mt-3 text-text-muted leading-relaxed">
        {state === "failed"
          ? "Your payment was not completed. No money was deducted. You can try again or contact us."
          : "We couldn't verify your payment. Please contact us with your reference number."}
      </p>
      {reference && (
        <p className="mt-4 text-sm text-text-muted">
          Reference: <span className="font-medium text-text-primary">{reference}</span>
        </p>
      )}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/book"
          className="inline-flex items-center justify-center rounded-full bg-accent-rose text-white font-medium text-sm px-6 py-3 hover:bg-accent-rose-dark transition-colors"
        >
          Try Again
        </Link>
        <a
          href={`https://wa.me/${siteConfig.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full border border-border text-text-primary font-medium text-sm px-6 py-3 hover:bg-bg-blush transition-colors"
        >
          Contact Us on WhatsApp
        </a>
      </div>
    </div>
  );
}
