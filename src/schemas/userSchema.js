import { z } from "zod";

export const registerUserSchema = z.object({
  fullname: z.string().min(2, "FullName is required"),
  username: z
    .string()
    .min(3, "Username must be atleast 3 characters")
    .max(30, "Username must be at most 30 characters"),
  email: z.email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be atleast 6 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[!@#$%^&*]/, "Must contain special character"),
  avatarUrl: z.url("Invalid avatar URL").optional(),
  coverImageUrl: z.url("Invalid cover Image URL").optional(),
});

export const loginUserSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .optional(),
    email: z.email("Invalid email format").optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.username || data.email, {
    message: "Either username or email is required",
    path: ["email"], // Shows error on email field
  });
