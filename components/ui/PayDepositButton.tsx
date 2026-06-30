"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PayDepositButtonProps {
  email: string;
  name: string;
  service: string;
  depositAmount: number;
  eventDate?: string;
  sanityBookingId?: string | null;
  className?: string;
}

export function PayDepositButton({
  email: initialEmail,
  name,
  service,
  depositAmount,
  eventDate,
  sanityBookingId,
  className,
}: PayDepositButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const needsEmail = !initialEmail;

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

  async function handlePay() {
    if (!email || !isValidEmail) {
      setStatus("error");
      setErrorMsg("Please enter a valid email address (e.g. name@example.com)");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount: depositAmount,
          name,
          service,
          eventDate,
          sanityBookingId: sanityBookingId ?? undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Payment initialization failed");
      }

      window.location.href = data.authorization_url;
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error && err.message
          ? err.message
          : "Couldn’t connect to payment. Please try again or pay via bank transfer."
      );
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {needsEmail && (
        <input
          type="email"
          placeholder="Enter your email for payment receipt"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-full border border-border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-accent-rose focus:ring-1 focus:ring-accent-rose/30 transition-colors"
        />
      )}
      <button
        type="button"
        onClick={handlePay}
        disabled={status === "loading"}
        className="w-full flex items-center justify-center gap-2 rounded-full bg-accent-rose hover:bg-accent-rose-dark text-white font-medium text-sm px-6 py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Connecting to Paystack...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            Pay {formatPrice(depositAmount)} Deposit Now
          </>
        )}
      </button>
      {status === "error" && errorMsg && (
        <p className="text-xs text-red-500 text-center">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
