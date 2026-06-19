import { z } from "zod";

export const bookingSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(7, "Please enter a valid phone number"),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Please enter a valid email"
    ),
  service: z.string().min(1, "Please select a service"),
  eventType: z.string().min(1, "Please select an event type"),
  eventDate: z.string().min(1, "Please select your event date"),
  eventLocation: z.string().min(2, "Please enter your event location"),
  numberOfFaces: z
    .number({ message: "Please enter number of faces" })
    .min(1, "At least 1 face is required"),
  preferredTime: z.string().optional(),
  message: z.string().optional(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
