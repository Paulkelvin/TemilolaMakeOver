"use client";

import { useState, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  bookingSchema,
  type BookingFormValues,
} from "@/lib/validations/booking";
import { getBookingWhatsAppUrl } from "@/lib/whatsapp-form";
import { services } from "@/data/services";
import { travelZones as defaultTravelZones, type TravelZone } from "@/data/travel-zones";
import { bookPageCopy } from "@/data/copy";
import { Button } from "@/components/ui/Button";
import { trackEvent, analyticsEvents } from "@/lib/analytics";
import { cn, formatPrice } from "@/lib/utils";
import { FormField, inputStyles } from "./FormField";
import { PayDepositButton } from "@/components/ui/PayDepositButton";
import { AvailabilityCalendar } from "@/components/ui/AvailabilityCalendar";
import { MapPin } from "lucide-react";

interface BookingFormProps {
  className?: string;
  preselectedService?: string;
  preselectedDate?: string;
  preselectedTime?: string;
  blockedDates?: string[];
  travelZones?: TravelZone[];
}

export function BookingForm({ className, preselectedService, preselectedDate, preselectedTime, blockedDates = [], travelZones: zonesProp }: BookingFormProps) {
  const zones = zonesProp?.length ? zonesProp : defaultTravelZones;

  function getZoneFee(zoneId: string): number | null {
    const zone = zones.find((z) => z.id === zoneId);
    if (!zone || zone.fee === -1) return null;
    return zone.fee;
  }

  function getZoneLabel(zoneId: string): string {
    return zones.find((z) => z.id === zoneId)?.label ?? zoneId;
  }
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState(1);
  const [showCalendar, setShowCalendar] = useState(!preselectedDate);
  const submittedData = useRef<BookingFormValues | null>(null);
  const sanityBookingId = useRef<string | null>(null);
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
      preferredTime: preselectedTime ?? "",
      message: "",
      service: matchedService?.name ?? "",
      eventDate: preselectedDate ?? "",
      travelZone: "",
      eventLocation: "",
    },
  });

  const watchedDate = watch("eventDate");
  const watchedTime = watch("preferredTime");
  const watchedService = watch("service");
  const watchedZone = watch("travelZone");

  const selectedService = useMemo(
    () => services.find((s) => s.name === watchedService),
    [watchedService]
  );

  const travelFee = useMemo(() => {
    if (!watchedZone) return null;
    return getZoneFee(watchedZone);
  }, [watchedZone]);

  const isQuoteOnly = watchedZone
    ? zones.find((z) => z.id === watchedZone)?.fee === -1
    : false;

  const estimatedTotal = useMemo(() => {
    if (!selectedService?.priceFrom) return null;
    if (travelFee === null) return null;
    return selectedService.priceFrom + travelFee;
  }, [selectedService, travelFee]);

  const depositAmount = estimatedTotal ? Math.round(estimatedTotal * 0.5) : null;

  const step1Fields = ["name", "phone", "service", "eventDate"] as const;

  async function goToStep2() {
    const valid = await trigger(step1Fields as unknown as (keyof BookingFormValues)[]);
    if (valid) {
      setStep(2);
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } else {
      setTimeout(() => {
        const firstError = formRef.current?.querySelector("[aria-invalid='true'], .border-red-400");
        if (firstError) (firstError as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    }
  }

  async function onSubmit(data: BookingFormValues) {
    setStatus("loading");
    setErrorMsg("");

    const honeypotEl = document.getElementById("website_url") as HTMLInputElement | null;
    if (honeypotEl?.value) return;

    const zoneLabel = getZoneLabel(data.travelZone);
    const zoneFee = getZoneFee(data.travelZone);

    const payload = {
      name: data.name,
      phone: data.phone,
      service: data.service,
      eventDate: data.eventDate,
      location: data.eventLocation || zoneLabel,
      travelZone: data.travelZone,
      travelFee: zoneFee,
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

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error ?? "Something went wrong");
      }

      trackEvent(analyticsEvents.formSubmit, { location: "booking_page" });
      submittedData.current = data;
      sanityBookingId.current = resData.sanityBookingId ?? null;
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
    window.open(getBookingWhatsAppUrl(data, zones), "_blank", "noopener,noreferrer");
  }

  if (status === "success") {
    const svc = services.find(
      (s) => s.name === submittedData.current?.service
    );
    const zone = submittedData.current?.travelZone;
    const fee = zone ? getZoneFee(zone) : null;
    const total = svc?.priceFrom && fee !== null
      ? svc.priceFrom + fee
      : svc?.priceFrom ?? null;
    const deposit = total ? Math.round(total * 0.5) : null;
    const zoneIsQuote = zone
      ? zones.find((z) => z.id === zone)?.fee === -1
      : false;

    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-card p-8 md:p-10 text-center shadow-card",
          className
        )}
      >
        <div className="w-16 h-16 rounded-full bg-accent-rose/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-accent-rose" aria-hidden>✓</span>
        </div>
        <h3 className="font-display text-2xl text-text-primary">Booking received!</h3>
        <p className="mt-2 text-sm text-text-muted">
          We&apos;ll confirm your date and send next steps within 24 hours.
        </p>

        {zoneIsQuote ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-2">
            <p className="text-sm font-medium text-amber-800">
              Outside Lagos — custom quote
            </p>
            <p className="text-xs text-amber-700">
              We&apos;ll send you a full quote including travel and accommodation within 24 hours.
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-border bg-white p-5 space-y-4 text-left shadow-sm">
            {deposit && fee !== null && svc?.priceFrom && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Payment Summary</p>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">{svc.name}</span>
                  <span className="text-text-primary">{formatPrice(svc.priceFrom)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Travel</span>
                  <span className={fee === 0 ? "text-green-600 font-medium" : "text-text-primary"}>
                    {fee === 0 ? "Free" : formatPrice(fee)}
                  </span>
                </div>
                <div className="border-t border-dashed border-border pt-2 flex justify-between text-sm font-semibold">
                  <span>Estimated Total</span>
                  <span>{formatPrice(total!)}</span>
                </div>
                <div className="bg-accent-rose/10 rounded-md px-3 py-2.5 flex justify-between items-center">
                  <span className="text-xs font-semibold text-accent-rose">50% Deposit Due Now</span>
                  <span className="text-lg font-bold text-accent-rose">{formatPrice(deposit)}</span>
                </div>
              </div>
            )}
            <p className="text-xs text-text-muted text-center">
              Pay your deposit now to lock in your date
            </p>
            {deposit && submittedData.current ? (
              <PayDepositButton
                email=""
                name={submittedData.current.name}
                service={svc!.name}
                depositAmount={deposit}
                eventDate={submittedData.current.eventDate}
                sanityBookingId={sanityBookingId.current}
                className="w-full"
              />
            ) : (
              <p className="text-xs text-text-muted italic text-center">
                Payment details will be included in your confirmation message.
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          className="mt-5 text-xs text-text-muted hover:text-accent-rose transition-colors"
          onClick={() => setStatus("idle")}
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cn(
        "rounded-2xl border border-border bg-card p-5 md:p-8 shadow-card overflow-hidden scroll-mt-24 max-w-full",
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
            {(() => {
              const { onChange, ...phoneRest } = register("phone");
              return (
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  {...phoneRest}
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/[^\d+\s]/g, "");
                    onChange(e);
                  }}
                  className={cn(inputStyles, errors.phone && "border-red-400")}
                  placeholder="+234 8012345678"
                  aria-invalid={!!errors.phone}
                />
              );
            })()}
          </FormField>
        </div>

        <FormField label="Pick Your Date" htmlFor="eventDate" error={errors.eventDate?.message} required>
          <input type="hidden" {...register("eventDate")} />
          {!showCalendar && watchedDate ? (
            <div className="rounded-xl border border-accent-rose/30 bg-accent-rose/5 p-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-accent-rose mb-0.5">
                  {watchedTime ? "Date & time selected" : "Date selected"}
                </p>
                <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                  <span className="text-accent-rose">✓</span>
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

        <FormField label="Event Area" htmlFor="travelZone" error={errors.travelZone?.message} required>
          <select
            id="travelZone"
            {...register("travelZone", {
              onChange: (e) => {
                const zone = zones.find((z) => z.id === e.target.value);
                if (zone) {
                  setValue("eventLocation", zone.label, { shouldValidate: true });
                }
              },
            })}
            className={cn(inputStyles, errors.travelZone && "border-red-400")}
            aria-invalid={!!errors.travelZone}
          >
            <option value="">Where is your event?</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.label}
                {zone.fee === 0 ? " — Travel included" : zone.fee === -1 ? " — Quote on request" : ` — +${formatPrice(zone.fee)} travel`}
              </option>
            ))}
          </select>
          <input type="hidden" {...register("eventLocation")} />
        </FormField>

        {/* Travel fee indicator */}
        {watchedZone && (
          <div className={cn(
            "rounded-xl p-4 flex items-start gap-3",
            isQuoteOnly
              ? "border border-amber-200 bg-amber-50"
              : "border border-accent-rose/20 bg-accent-rose/5"
          )}>
            <MapPin className={cn(
              "w-4 h-4 mt-0.5 shrink-0",
              isQuoteOnly ? "text-amber-600" : "text-accent-rose"
            )} />
            <div className="text-xs space-y-1">
              {isQuoteOnly ? (
                <>
                  <p className="font-medium text-amber-800">Outside Lagos — custom quote</p>
                  <p className="text-amber-700">
                    We&apos;ll include travel and accommodation costs in your personalised quote.
                  </p>
                </>
              ) : (
                <div className="w-full space-y-2">
                  <p className="text-text-muted text-xs">
                    {zones.find(z => z.id === watchedZone)?.areas}
                  </p>
                  {selectedService?.priceFrom && travelFee !== null && (
                    <div className="bg-white rounded-lg border border-border p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">{selectedService.name}</span>
                        <span className="text-text-primary">{formatPrice(selectedService.priceFrom)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Travel</span>
                        <span className={travelFee === 0 ? "text-green-600 font-medium" : "text-text-primary"}>
                          {travelFee === 0 ? "Free" : formatPrice(travelFee)}
                        </span>
                      </div>
                      <div className="border-t border-dashed border-border pt-2 flex justify-between text-sm font-semibold">
                        <span className="text-text-primary">Estimated Total</span>
                        <span className="text-text-primary">{formatPrice(estimatedTotal!)}</span>
                      </div>
                      {depositAmount && (
                        <div className="bg-accent-rose/10 rounded-md px-3 py-2 flex justify-between items-center">
                          <span className="text-xs font-semibold text-accent-rose">50% Deposit to Book</span>
                          <span className="text-base font-bold text-accent-rose">{formatPrice(depositAmount)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

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
