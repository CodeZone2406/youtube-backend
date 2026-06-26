import { z } from "zod";
import { userFileSchema } from "../schemas/userFileSchema.js";

export const registerUserSchema = z.object({
  fullname: z.string().trim().min(2, "FullName is required"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be atleast 3 characters")
    .max(30, "Username must be at most 30 characters"),
  email: z.string().trim().email("Invalid email format"),
  password: z
    .string()
    .trim()
    .min(6, "Password must be atleast 6 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[!@#$%^&*]/, "Must contain special character"),
  avatar: z.array(userFileSchema).nonempty("Avatar image is required"),
  coverImage: z.array(userFileSchema).nonempty("Cover image is required"),
});

export const loginUserSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .optional(),
    email: z.string().trim().email("Invalid email format").optional(),
    password: z
      .string()
      .trim()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.username || data.email, {
    message: "Either username or email is required",
    path: ["email"], // Shows error on email field
  });

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().trim().min(1, "Current password is required"),
    newPassword: z
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[0-9]/, "Must contain number")
      .regex(/[!@#$%^&*]/, "Must contain special character"),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export const updateUserProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be atleast 3 characters")
    .optional(),
  email: z.string().trim().email("Invalid email format").optional(),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
  otp: z.preprocess(
    (val) => {
      if (typeof val === "number") return String(val);
      if (typeof val === "string") return val.trim();
      return val;
    },
    z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits")
  ),
});
