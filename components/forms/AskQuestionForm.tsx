"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { FormField, inputStyles } from "./FormField";
import { Button } from "@/components/ui/Button";
import { trackEvent, analyticsEvents } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function AskQuestionForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !question) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/ask-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, question }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");

      trackEvent(analyticsEvents.faqQuestionSubmit, { location: "faq_page" });
      setStatus("success");
      setName("");
      setEmail("");
      setQuestion("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Please try again");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-accent-rose/10 flex items-center justify-center mx-auto mb-3">
          <span className="text-xl text-accent-rose" aria-hidden>✓</span>
        </div>
        <h3 className="font-display text-xl text-text-primary">Question sent!</h3>
        <p className="mt-2 text-sm text-text-muted">
          We&apos;ll reply to your email within 24 hours.
        </p>
        <button
          type="button"
          className="mt-4 text-xs text-text-muted hover:text-accent-rose transition-colors"
          onClick={() => setStatus("idle")}
        >
          Ask another question
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Name (optional)" htmlFor="askName">
          <input
            id="askName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputStyles}
            placeholder="Your name"
          />
        </FormField>
        <FormField label="Email" htmlFor="askEmail" required>
          <input
            id="askEmail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputStyles}
            placeholder="your@email.com"
          />
        </FormField>
      </div>

      <FormField label="Your Question" htmlFor="askQuestion" required>
        <textarea
          id="askQuestion"
          rows={4}
          required
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className={cn(inputStyles, "resize-none")}
          placeholder="What would you like to know?"
        />
      </FormField>

      {status === "error" && (
        <p className="text-sm text-red-600" role="alert">
          {errorMsg}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={status === "loading"}
      >
        <span className="flex items-center justify-center gap-2">
          <Send className="w-4 h-4" />
          {status === "loading" ? "Sending..." : "Send Question"}
        </span>
      </Button>
    </form>
  );
}
