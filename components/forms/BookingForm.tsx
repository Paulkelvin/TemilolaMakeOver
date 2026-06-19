"use client";

import { useState } from "react";
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
}

export function BookingForm({ className }: BookingFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
    getValues,
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      numberOfFaces: 1,
      email: "",
      preferredTime: "",
      message: "",
    },
  });

  async function onSubmit(data: BookingFormValues) {
    setStatus("loading");
    setErrorMsg("");

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
      setStatus("success");
      reset();
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
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cn(
        "rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5 shadow-card",
        className
      )}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Full Name" htmlFor="name" error={errors.name?.message} required>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Event Date" htmlFor="eventDate" error={errors.eventDate?.message} required>
          <input
            id="eventDate"
            type="date"
            {...register("eventDate")}
            className={cn(inputStyles, errors.eventDate && "border-red-400")}
            aria-invalid={!!errors.eventDate}
          />
        </FormField>
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
        <FormField label="Preferred Time" htmlFor="preferredTime">
          <input
            id="preferredTime"
            {...register("preferredTime")}
            className={inputStyles}
            placeholder="e.g. 8:00 AM"
          />
        </FormField>
      </div>

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
      </div>
    </form>
  );
}
