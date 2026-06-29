"use client";

import { useRef } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const dragMoved = useRef(false);

  function handleWheel(e: React.WheelEvent) {
    if (!scrollRef.current) return;
    e.preventDefault();
    scrollRef.current.scrollLeft += e.deltaY + e.deltaX;
  }

  function onMouseDown(e: React.MouseEvent) {
    if (!scrollRef.current) return;
    isDragging.current = true;
    dragMoved.current = false;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    startScrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = "grabbing";
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX.current;
    if (Math.abs(walk) > 3) dragMoved.current = true;
    scrollRef.current.scrollLeft = startScrollLeft.current - walk;
  }

  function onMouseUp() {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  }

  function onClickCapture(e: React.MouseEvent) {
    // suppress click if the user was dragging
    if (dragMoved.current) e.stopPropagation();
  }

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
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClickCapture={onClickCapture}
        className="flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5 select-none"
        style={{ scrollbarWidth: "none", cursor: "grab" }}
      >
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
