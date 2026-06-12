import { z } from "zod";

export const registerUserSchema = z.object({
  fullname: z.string().min(2, "FullName is required"),
  username: z
    .string()
    .min(3, "Username must be atleast 3 characters")
    .max(30, "Username must be at most 30 characters"),
  email: z.email("Invalid email format"),
  password: z.string().min(6, "Password must be atleast 6 characters"),
  avatarUrl: z.url("Invalid avatar URL").optional(),
  coverImageUrl: z.url("Invalid cover Image URL").optional(),
});
