import { Container } from "@/components/ui/Container";

export default function Loading() {
  return (
    <section className="min-h-[60vh] flex items-center">
      <Container className="text-center py-20">
        <div className="inline-flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent-rose animate-bounce [animation-delay:0ms]" />
          <div className="w-2 h-2 rounded-full bg-accent-rose animate-bounce [animation-delay:150ms]" />
          <div className="w-2 h-2 rounded-full bg-accent-rose animate-bounce [animation-delay:300ms]" />
        </div>
      </Container>
    </section>
  );
}
