"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

interface AvailabilityModalProps {
  blockedDates: string[];
  open: boolean;
  onClose: () => void;
}

export function AvailabilityModal({
  blockedDates,
  open,
  onClose,
}: AvailabilityModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>();
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose]
  );

  function continueBooking() {
    if (!selectedDate) return;
    onClose();
    router.push(`/book?date=${selectedDate}#booking-form`);
  }

  const whatsAppUrl = buildWhatsAppUrl({ intent: "availability" });

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm modal-overlay-enter"
    >
      <div className="relative w-full max-w-md bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-xl p-6 sm:p-8 modal-panel-enter">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-bg-blush text-text-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-display text-xl text-text-primary mb-1 text-center">
          Check Availability
        </h3>
        <p className="text-sm text-text-muted mb-5 text-center">
          Pick a date to see if we&apos;re available, then continue to book.
        </p>

        <AvailabilityCalendar
          blockedDates={blockedDates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <button
          onClick={continueBooking}
          disabled={!selectedDate}
          className={cn(
            "mt-5 w-full rounded-full py-3 font-medium text-sm transition-all duration-300",
            selectedDate
              ? "bg-accent-rose text-white hover:bg-accent-rose-dark shadow-md hover:shadow-lg"
              : "bg-bg-blush text-text-muted cursor-not-allowed"
          )}
        >
          {selectedDate ? "Continue Booking" : "Select a date to continue"}
        </button>

        <div className="mt-4 pt-4 border-t border-border text-center">
          <p className="text-xs text-text-muted mb-2">Rather chat directly?</p>
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#25D366] hover:underline"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Message us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
