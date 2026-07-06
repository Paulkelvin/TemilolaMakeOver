"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronDown } from "lucide-react";
import { AvailabilityCalendar } from "@/components/ui/AvailabilityCalendar";
import { cn } from "@/lib/utils";

interface CheckAvailabilityCardProps {
  blockedDates: string[];
  label?: string;
  description?: string;
}

export function CheckAvailabilityCard({
  blockedDates,
  label = "Check Availability",
  description = "Pick a date & time to get started",
}: CheckAvailabilityCardProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>();
  const [selectedTime, setSelectedTime] = useState("");
  const router = useRouter();

  function continueBooking() {
    if (!selectedDate) return;
    const timeParam = selectedTime ? `&time=${encodeURIComponent(selectedTime)}` : "";
    router.push(`/book?date=${selectedDate}${timeParam}#booking-form`);
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden transition-shadow duration-200 hover:shadow-md">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="group flex w-full items-center gap-3 p-3 text-left"
      >
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-bg-blush">
          <CalendarDays className="h-6 w-6 text-accent-rose" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-rose transition-colors">
            {label}
          </h3>
          <p className="mt-0.5 text-xs text-text-muted">
            {description}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-text-muted/50 flex-shrink-0 mr-1 transition-transform duration-300",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              <AvailabilityCalendar
                blockedDates={blockedDates}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
              />
              <button
                type="button"
                onClick={continueBooking}
                disabled={!selectedDate}
                className={cn(
                  "mt-3 w-full rounded-full py-3 text-sm font-medium transition-all duration-300",
                  selectedDate
                    ? "bg-accent-rose text-white hover:bg-accent-rose-dark shadow-md hover:shadow-lg"
                    : "bg-bg-blush text-text-muted cursor-not-allowed"
                )}
              >
                {selectedDate ? "Continue Booking" : "Select a date to continue"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
