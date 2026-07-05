import { PhasePlaceholder } from "@/components/command-center/PhasePlaceholder";

export default function CustomersPage() {
  return (
    <PhasePlaceholder
      title="Customers"
      dek="A per-person lens on the same booking data — de-duplicated by email/phone, no separate customer records to maintain."
      phase="Phase 3"
      willShow={[
        "Customer locations, popular services/styles/occasions",
        "Average spend and returning-customer rate (needs booking.amountPaid)",
        "Review trends over time",
      ]}
    />
  );
}
