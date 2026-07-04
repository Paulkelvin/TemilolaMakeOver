import { createPageMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/Container";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { PaymentVerifier } from "./PaymentVerifier";

export const metadata = createPageMetadata({
  title: "Payment Confirmation",
  description: "Verify your deposit payment status.",
  path: "/payment/verify",
  noindex: true,
});

export default function PaymentVerifyPage() {
  return (
    <SectionWrapper>
      <Container size="narrow" className="py-16 min-h-[60vh] flex items-center">
        <PaymentVerifier />
      </Container>
    </SectionWrapper>
  );
}
