"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/command-center";

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/cc-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      // Hard navigation, not router.push — guarantees the destination is
      // rendered server-side with the freshly-set session cookie/role.
      window.location.href = next;
    } else {
      setLoading(false);
      setError("Incorrect password.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 340,
          border: "1px solid var(--cc-border)",
          borderRadius: 12,
          padding: 28,
          background: "var(--cc-surface-2)",
        }}
      >
        <h1 style={{ margin: "0 0 6px", fontSize: "1.25rem", fontFamily: "var(--cc-sans)" }}>
          Business Command Center
        </h1>
        <p style={{ margin: "0 0 20px", fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>
          Enter your password to continue.
        </p>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid var(--cc-border)",
            background: "var(--cc-surface)",
            color: "var(--cc-text)",
            fontSize: "0.9375rem",
            marginBottom: 12,
          }}
        />
        {error && (
          <p style={{ color: "var(--cc-critical)", fontSize: "0.8125rem", margin: "0 0 12px" }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || !password}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "none",
            background: "var(--cc-accent)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.9375rem",
            cursor: loading || !password ? "not-allowed" : "pointer",
            opacity: loading || !password ? 0.7 : 1,
          }}
        >
          {loading ? "Checking…" : "Log in"}
        </button>
      </form>
    </div>
  );
}

export default function CcLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
