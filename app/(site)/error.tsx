"use client";

import { Container } from "@/components/ui/Container";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="min-h-[60vh] flex items-center">
      <Container className="text-center py-20">
        <h1 className="font-display text-5xl md:text-7xl font-medium text-text-primary">
          Oops
        </h1>
        <p className="mt-4 text-lg text-text-muted">
          Something went wrong. Please try again.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-full bg-accent-rose text-white font-medium text-sm px-6 py-3 hover:bg-accent-rose-dark transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-border text-text-primary font-medium text-sm px-6 py-3 hover:bg-bg-blush transition-colors"
          >
            Back to Home
          </a>
        </div>
      </Container>
    </section>
  );
}
