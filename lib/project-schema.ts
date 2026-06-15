import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^https?:\/\/\S+$/i.test(value),
    "Please enter a valid URL."
  );

export const projectSchema = z.object({
  title: z.string().trim().min(2, "Project title is required.").max(120),
  category: z.string().trim().min(2, "Category is required.").max(80),
  shortDescription: z
    .string()
    .trim()
    .min(10, "Add a short project description.")
    .max(240),
  fullDescription: z
    .string()
    .trim()
    .min(20, "Add a fuller project description.")
    .max(4000),
  image: z.string().trim().min(1, "Project image URL is required.").max(1000),
  liveUrl: optionalUrl,
  techStack: z
    .array(z.string().trim().min(1).max(50))
    .min(1, "Add at least one technology.")
    .max(20),
  featured: z.boolean(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
