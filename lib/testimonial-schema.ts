import { z } from "zod";

export const testimonialSchema = z.object({
  clientName: z.string().trim().min(2, "Client name is required.").max(100),
  designation: z
    .string()
    .trim()
    .min(2, "Designation or company is required.")
    .max(140),
  review: z.string().trim().min(20, "Review is too short.").max(1600),
  rating: z.coerce.number().int().min(1).max(5),
  image: z.string().trim().max(1000),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
