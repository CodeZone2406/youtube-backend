import { z } from "zod";

export const addCommentSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(5, "Comment Should be minimum 5 characters")
      .max(500, "Comment Should have maximum 500 characters"),
  })
  .strict();

export const updateCommentSchema = z
  .object({
    updatedContent: z
      .string()
      .trim()
      .min(5, "Comment should be minimum 5 characters")
      .max(500, "Comment should have maximum 500 characters"),
  })
  .strict();
