"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AvailabilityModal } from "@/components/ui/AvailabilityModal";

interface CheckAvailabilityButtonProps {
  blockedDates: string[];
  label: string;
  analyticsLabel?: string;
}

export function CheckAvailabilityButton({
  blockedDates,
  label,
  analyticsLabel,
}: CheckAvailabilityButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="primary"
        size="lg"
        onClick={() => setOpen(true)}
        analyticsLabel={analyticsLabel}
      >
        {label}
      </Button>
      <AvailabilityModal
        blockedDates={blockedDates}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
