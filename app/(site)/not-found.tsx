import Link from "next/link";
import { createPageMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/Container";

export const metadata = createPageMetadata({
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist.",
});

export default function NotFound() {
  return (
    <section className="min-h-[60vh] flex items-center">
      <Container className="text-center py-20">
        <h1 className="font-display text-5xl md:text-7xl font-medium text-text-primary">
          404
        </h1>
        <p className="mt-4 text-lg text-text-muted">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-accent-rose text-white font-medium text-sm px-6 py-3 hover:bg-accent-rose-dark transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-full border border-border text-text-primary font-medium text-sm px-6 py-3 hover:bg-bg-blush transition-colors"
          >
            View Services
          </Link>
        </div>
      </Container>
    </section>
  );
}
