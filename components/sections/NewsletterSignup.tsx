"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("success");
    setEmail("");
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8 text-center">
      <h3 className="font-display text-xl md:text-2xl font-medium text-text-primary">
        Beauty tips in your inbox
      </h3>
      <p className="mt-2 text-sm text-text-muted leading-relaxed">
        Get bridal prep guides, glam tips, and exclusive offers. No spam — just
        beauty.
      </p>

      {status === "success" ? (
        <div className="mt-4 py-3 px-4 rounded-xl bg-accent-rose/10 text-sm text-accent-rose font-medium">
          You&apos;re subscribed! Check your inbox soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 flex gap-2">
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 min-w-0 rounded-full border border-border bg-bg-cream px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-accent-rose focus:ring-1 focus:ring-accent-rose/30 transition-colors"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-accent-rose hover:bg-accent-rose-dark text-white px-5 py-2.5 text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Subscribe</span>
          </button>
        </form>
      )}
    </div>
  );
}
