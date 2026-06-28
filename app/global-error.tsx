"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "#FFF8F2",
          color: "#3D2B24",
          margin: 0,
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "3rem", fontWeight: 500 }}>
              Something went wrong
            </h1>
            <p style={{ marginTop: "1rem", color: "#6F5A50" }}>
              We&apos;re sorry — please try again or contact us on WhatsApp.
            </p>
            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "9999px",
                  background: "#B76E79",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Try Again
              </button>
              <a
                href="/"
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "9999px",
                  border: "1px solid #E8DED8",
                  color: "#3D2B24",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
