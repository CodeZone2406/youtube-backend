import { z } from "zod";

export const userFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z
    .string()
    .refine(
      (type) => ["image/jpeg", "image/png", "image/webp"].includes(type),
      { message: "Only JPEG, PNG, and WebP images are allowed" }
    ),
  destination: z.string(),
  filename: z.string(),
  path: z.string(),
  size: z.number().max(5 * 1024 * 1024, "File size must be less than 5MB"), // 5MB limit
});
