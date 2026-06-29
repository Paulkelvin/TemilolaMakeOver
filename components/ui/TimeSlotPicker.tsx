"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const TIME_SLOTS = [
  "7:30 AM",
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
  "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM",
];

interface TimeSlotPickerProps {
  selectedTime: string;
  onSelectTime: (time: string) => void;
}

export function TimeSlotPicker({ selectedTime, onSelectTime }: TimeSlotPickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mt-4"
    >
      <p className="text-xs font-medium text-text-muted mb-2.5">
        What time works for you?{" "}
        <span className="text-text-muted/60 font-normal">(optional)</span>
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5" style={{ scrollbarWidth: "none" }}>
        {TIME_SLOTS.map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => onSelectTime(selectedTime === slot ? "" : slot)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border transition-all duration-200",
              selectedTime === slot
                ? "bg-accent-rose text-white border-accent-rose shadow-sm"
                : "bg-bg-blush border-border text-text-muted hover:border-accent-rose hover:text-accent-rose"
            )}
          >
            {slot}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
