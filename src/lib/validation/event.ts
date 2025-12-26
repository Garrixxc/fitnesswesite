import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(3, "Title is too short"),
  sport: z.enum(["RUN", "CYCLING", "SWIM", "TRIATHLON", "TREK", "OTHER"]).default("RUN"),
  distanceKm: z.coerce.number().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  location: z.string().min(2, "Add city & country"),
  description: z.string().min(5, "Tell people what this is"),
  price: z.coerce.number().int().nonnegative().default(0),  // rupees
  currency: z.string().default("INR"),
  capacity: z.coerce.number().int().positive().optional(),
  // file is handled via FormData, not here
});

export type EventFormValues = z.infer<typeof eventSchema>;
