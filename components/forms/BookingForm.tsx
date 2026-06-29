"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  bookingSchema,
  type BookingFormValues,
} from "@/lib/validations/booking";
import { getBookingWhatsAppUrl } from "@/lib/whatsapp-form";
import { services } from "@/data/services";
import { bookPageCopy } from "@/data/copy";
import { Button } from "@/components/ui/Button";
import { trackEvent, analyticsEvents } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { FormField, inputStyles } from "./FormField";
import { PayDepositButton } from "@/components/ui/PayDepositButton";
import { AvailabilityCalendar } from "@/components/ui/AvailabilityCalendar";

const eventTypes = [
  "Wedding",
  "Traditional Wedding",
  "Birthday",
  "Party / Event",
  "Photoshoot",
  "Other",
];

interface BookingFormProps {
  className?: string;
  preselectedService?: string;
  preselectedDate?: string;
  preselectedTime?: string;
  blockedDates?: string[];
}

export function BookingForm({ className, preselectedService, preselectedDate, preselectedTime, blockedDates = [] }: BookingFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState(1);
  const [showCalendar, setShowCalendar] = useState(!preselectedDate);
  const submittedData = useRef<BookingFormValues | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const matchedService = preselectedService
    ? services.find((s) => s.slug === preselectedService)
    : undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
    getValues,
    setValue,
    watch,
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      numberOfFaces: 1,
      email: "",
      preferredTime: preselectedTime ?? "",
      message: "",
      service: matchedService?.name ?? "",
      eventDate: preselectedDate ?? "",
    },
  });

  const watchedDate = watch("eventDate");
  const watchedTime = watch("preferredTime");

  const step1Fields = ["name", "phone", "email", "service", "eventType", "eventDate"] as const;

  async function goToStep2() {
    const valid = await trigger(step1Fields as unknown as (keyof BookingFormValues)[]);
    if (valid) {
      setStep(2);
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }

  async function onSubmit(data: BookingFormValues) {
    setStatus("loading");
    setErrorMsg("");

    const honeypotEl = document.getElementById("website_url") as HTMLInputElement | null;
    if (honeypotEl?.value) return;

    const payload = {
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      service: data.service,
      eventType: data.eventType,
      eventDate: data.eventDate,
      location: data.eventLocation,
      faces: String(data.numberOfFaces),
      preferredTime: data.preferredTime,
      message: data.message,
    };

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Something went wrong");
      }

      trackEvent(analyticsEvents.formSubmit, { location: "booking_page" });
      submittedData.current = data;
      setStatus("success");
      reset();
      setStep(1);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Please try again");
    }
  }

  async function sendViaWhatsApp() {
    const valid = await trigger();
    if (!valid) return;
    const data = getValues();
    trackEvent(analyticsEvents.whatsappClick, { location: "booking_form" });
    window.open(getBookingWhatsAppUrl(data), "_blank", "noopener,noreferrer");
  }

  if (status === "success") {
    const selectedService = services.find(
      (s) => s.name === getValues("service")
    );
    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-card p-8 md:p-10 text-center shadow-card",
          className
        )}
      >
        <div className="w-16 h-16 rounded-full bg-accent-rose/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-accent-rose" aria-hidden>
            ✓
          </span>
        </div>
        <h3 className="font-display text-2xl text-text-primary">Thank you!</h3>
        <p className="mt-3 text-text-muted leading-relaxed">
          {bookPageCopy.success}
        </p>

        <div className="mt-6 rounded-xl bg-bg-blush border border-border p-5">
          <p className="text-sm text-text-primary font-medium mb-1 text-left">
            Want to secure your date instantly?
          </p>
          <p className="text-xs text-text-muted leading-relaxed mb-4 text-left">
            Pay your 50% deposit now to lock in your booking. Your date isn&apos;t confirmed until the deposit is received.
          </p>
          {selectedService?.priceFrom && submittedData.current && (
            <PayDepositButton
              email={submittedData.current.email || ""}
              name={submittedData.current.name}
              service={selectedService.name}
              depositAmount={Math.round(selectedService.priceFrom * 0.5)}
              eventDate={submittedData.current.eventDate}
            />
          )}
          {selectedService?.slug && (
            <a
              href={`/services/${selectedService.slug}`}
              className="inline-block mt-3 text-xs font-medium text-accent-rose hover:underline"
            >
              See what&apos;s included in your service →
            </a>
          )}
        </div>

        <Button
          variant="secondary"
          size="md"
          className="mt-6"
          onClick={() => setStatus("idle")}
        >
          Send Another Request
        </Button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cn(
        "rounded-2xl border border-border bg-card p-5 md:p-8 shadow-card overflow-hidden scroll-mt-24",
        className
      )}
    >
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website_url">Website</label>
        <input type="text" id="website_url" name="website_url" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
            "bg-accent-rose text-white"
          )}>
            1
          </span>
          <span className="text-sm font-medium text-text-primary hidden sm:inline">Your Info</span>
        </div>
        <div className={cn(
          "flex-1 h-0.5 rounded-full transition-colors",
          step === 2 ? "bg-accent-rose" : "bg-border"
        )} />
        <div className="flex items-center gap-2">
          <span className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
            step === 2 ? "bg-accent-rose text-white" : "bg-bg-blush text-text-muted"
          )}>
            2
          </span>
          <span className="text-sm font-medium text-text-muted hidden sm:inline">Event Details</span>
        </div>
      </div>

      {/* Step 1: Personal info, date & service selection */}
      <div className={cn("space-y-5", step !== 1 && "hidden")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Name" htmlFor="name" error={errors.name?.message} required>
            <input
              id="name"
              {...register("name")}
              className={cn(inputStyles, errors.name && "border-red-400")}
              placeholder="Your name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
          </FormField>
          <FormField label="Phone Number" htmlFor="phone" error={errors.phone?.message} required>
            <input
              id="phone"
              type="tel"
              {...register("phone")}
              className={cn(inputStyles, errors.phone && "border-red-400")}
              placeholder="+234 ..."
              aria-invalid={!!errors.phone}
            />
          </FormField>
        </div>

        <FormField label="Pick Your Date" htmlFor="eventDate" error={errors.eventDate?.message} required>
          <input type="hidden" {...register("eventDate")} />
          {!showCalendar && watchedDate ? (
            <div className="rounded-xl border border-accent-rose/30 bg-accent-rose/5 p-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                  <span className="text-accent-rose text-base">✓</span>
                  {new Date(watchedDate + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
                {watchedTime && (
                  <p className="text-xs text-text-muted mt-0.5 ml-5">{watchedTime}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowCalendar(true)}
                className="text-xs font-medium text-accent-rose hover:underline shrink-0 mt-0.5"
              >
                Change
              </button>
            </div>
          ) : (
            <AvailabilityCalendar
              blockedDates={blockedDates}
              selectedDate={watchedDate}
              onSelectDate={(date) => {
                setValue("eventDate", date, { shouldValidate: true });
                setShowCalendar(false);
              }}
              selectedTime={watchedTime}
              onSelectTime={(time) => setValue("preferredTime", time)}
            />
          )}
        </FormField>

        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            {...register("email")}
            className={inputStyles}
            placeholder="you@email.com (optional)"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Service Needed" htmlFor="service" error={errors.service?.message} required>
            <select
              id="service"
              {...register("service")}
              className={cn(inputStyles, errors.service && "border-red-400")}
              aria-invalid={!!errors.service}
            >
              <option value="">Select a service</option>
              {services.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Event Type" htmlFor="eventType" error={errors.eventType?.message} required>
            <select
              id="eventType"
              {...register("eventType")}
              className={cn(inputStyles, errors.eventType && "border-red-400")}
              aria-invalid={!!errors.eventType}
            >
              <option value="">Select event type</option>
              {eventTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <Button
          type="button"
          variant="primary"
          size="lg"
          className="w-full"
          onClick={goToStep2}
        >
          Continue
        </Button>
      </div>

      {/* Step 2: Event details & message */}
      <div className={cn("space-y-5", step !== 2 && "hidden")}>
        <div className="rounded-lg bg-accent-rose/5 border border-accent-rose/20 px-4 py-3 text-sm text-text-muted leading-relaxed">
          A <span className="font-medium text-text-primary">50% deposit</span> secures your date after we confirm availability. Payment details are sent with your confirmation.
        </div>
        <FormField
          label="Number of Faces"
          htmlFor="numberOfFaces"
          error={errors.numberOfFaces?.message}
          required
        >
          <input
            id="numberOfFaces"
            type="number"
            min={1}
            {...register("numberOfFaces", { valueAsNumber: true })}
            className={cn(inputStyles, errors.numberOfFaces && "border-red-400")}
            aria-invalid={!!errors.numberOfFaces}
          />
        </FormField>

        <FormField
          label="Event Location"
          htmlFor="eventLocation"
          error={errors.eventLocation?.message}
          required
        >
          <input
            id="eventLocation"
            {...register("eventLocation")}
            className={cn(inputStyles, errors.eventLocation && "border-red-400")}
            placeholder="Venue or area in Lagos"
            aria-invalid={!!errors.eventLocation}
          />
        </FormField>

        <FormField label="Message / Inspiration" htmlFor="message">
          <textarea
            id="message"
            rows={4}
            {...register("message")}
            className={cn(inputStyles, "resize-none")}
            placeholder="Share your vision, reference links, or inspiration..."
          />
        </FormField>

        {status === "error" && (
          <p className="text-sm text-red-600" role="alert">
            {errorMsg}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Sending..." : bookPageCopy.form.submitCta}
          </Button>
          <Button
            type="button"
            variant="whatsapp"
            size="lg"
            className="w-full"
            onClick={sendViaWhatsApp}
          >
            {bookPageCopy.form.whatsappCta}
          </Button>
          <button
            type="button"
            className="text-sm font-medium text-text-muted hover:text-accent-rose transition-colors py-2"
            onClick={() => {
              setStep(1);
              setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
            }}
          >
            ← Back to previous step
          </button>
        </div>
      </div>
    </form>
  );
}
