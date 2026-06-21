"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center p-1 rounded hover:bg-white/10 transition-colors"
      aria-label={`Copy ${text}`}
      type="button"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-accent-gold" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-white/40 hover:text-white/70" />
      )}
    </button>
  );
}
