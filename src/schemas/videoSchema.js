import { z } from "zod";
import { videoFileSchema } from "../schemas/videoFileSchema.js";

export const uploadVideoSchema = z.object({
  title: z.string().trim().min(5, "Title is required"),
  description: z.string().trim().min(20, "Description is required"),
  videoFile: z.array(videoFileSchema).nonempty("Video File is required"),
  thumbnail: z.array(videoFileSchema).nonempty("Video Thumbnail is required"),
});

export const updateVideoSchema = z.object({
  title: z.string().trim().min(5, "Title is required"),
  description: z.string().trim().min(20, "Description is required"),
});
