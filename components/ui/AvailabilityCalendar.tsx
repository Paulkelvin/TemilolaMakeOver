"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TimeSlotPicker } from "./TimeSlotPicker";

interface AvailabilityCalendarProps {
  blockedDates: string[];
  onSelectDate: (date: string) => void;
  selectedDate?: string;
  selectedTime?: string;
  onSelectTime?: (time: string) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function AvailabilityCalendar({
  blockedDates,
  onSelectDate,
  selectedDate,
  selectedTime,
  onSelectTime,
}: AvailabilityCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const goNext = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const goPrev = useCallback(() => {
    if (!canGoPrev) return;
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, [canGoPrev]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="rounded-xl border border-border bg-card p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          className={cn(
            "p-1.5 rounded-full transition-colors",
            canGoPrev
              ? "hover:bg-bg-blush text-text-primary"
              : "text-text-muted/30 cursor-not-allowed"
          )}
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-display text-sm font-medium text-text-primary">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={goNext}
          className="p-1.5 rounded-full hover:bg-bg-blush text-text-primary transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DAYS.map((d) => (
          <span key={d} className="text-[10px] font-medium text-text-muted uppercase py-1">
            {d}
          </span>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <span key={`e-${i}`} />;

          const dateStr = toDateString(viewYear, viewMonth, day);
          const dateObj = new Date(viewYear, viewMonth, day);
          const isPast = dateObj < today;
          const isBlocked = blockedSet.has(dateStr);
          const isSelected = selectedDate === dateStr;
          const isDisabled = isPast || isBlocked;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                "w-full h-10 flex items-center justify-center rounded-lg text-sm transition-all",
                isSelected && "bg-accent-rose text-white font-semibold",
                !isSelected && !isDisabled && "hover:bg-bg-blush text-text-primary",
                isBlocked && !isSelected && "bg-red-50 text-text-muted/40 line-through cursor-not-allowed",
                isPast && !isBlocked && "text-text-muted/30 cursor-not-allowed",
              )}
              title={isBlocked ? "Unavailable" : isPast ? "Past date" : undefined}
            >
              {day}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedDate && onSelectTime && (
          <TimeSlotPicker
            selectedTime={selectedTime ?? ""}
            onSelectTime={onSelectTime}
          />
        )}
      </AnimatePresence>

      <div className="mt-3 flex items-center gap-4 text-[10px] text-text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-bg-blush border border-border" />
          Available
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-red-50 border border-red-100" />
          Unavailable
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-accent-rose" />
          Selected
        </span>
      </div>
    </div>
  );
}
