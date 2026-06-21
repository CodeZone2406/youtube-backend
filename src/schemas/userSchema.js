import { z } from "zod";
import { userFileSchema } from "../schemas/userFileSchema.js";

const stringEmptyUndefined = (val) =>
  val.trim() === "" ? `${val} should not be empty` : val;

export const registerUserSchema = z.object({
  fullname: z
    .string()
    .min(2, "FullName is required")
    .transform(stringEmptyUndefined),
  username: z
    .string()
    .min(3, "Username must be atleast 3 characters")
    .max(30, "Username must be at most 30 characters")
    .transform(stringEmptyUndefined),
  email: z
    .string()
    .email("Invalid email format")
    .transform(stringEmptyUndefined),
  password: z
    .string()
    .min(6, "Password must be atleast 6 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[!@#$%^&*]/, "Must contain special character")
    .transform(stringEmptyUndefined),
  avatar: z.array(userFileSchema).nonempty("Avatar image is required"),
  coverImage: z.array(userFileSchema).nonempty("Cover image is required"),
});

export const loginUserSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .optional()
      .transform(stringEmptyUndefined),
    email: z
      .email("Invalid email format")
      .optional()
      .transform(stringEmptyUndefined),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
  .transform(stringEmptyUndefined)
  .refine((data) => data.username || data.email, {
    message: "Either username or email is required",
    path: ["email"], // Shows error on email field
  });

export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(1, "Current password is required")
      .transform(stringEmptyUndefined),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[0-9]/, "Must contain number")
      .regex(/[!@#$%^&*]/, "Must contain special character"),
  })
  .transform(stringEmptyUndefined)
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export const updateUserProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be atleast 3 characters")
    .optional()
    .transform(stringEmptyUndefined),
  email: z
    .email("Invalid Email format")
    .optional()
    .transform(stringEmptyUndefined),
});

export const verifyEmailSchema = z.object({
  email: z
    .email("Invalid Email format")
    .optional()
    .transform(stringEmptyUndefined),
  otp: z.preprocess(
    (val) => {
      if (typeof val === "number") return String(val);
      if (typeof val === "string") return val.trim();
      return val;
    },
    z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits")
  ),
});
