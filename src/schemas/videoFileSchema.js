import { z } from "zod";

export const videoFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string().refine(
    (type) =>
      [
        "video/mp4",
        "video/quicktime", // MOV
        "video/x-ms-wmv", // WMV
        "video/webm",
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(type),
    {
      message:
        "Unsupported file type. Please upload MP4, MOV, WMV, WebM, JPEG, PNG, or WEBP files.",
    }
  ),
  destination: z.string(),
  filename: z.string(),
  path: z.string(),
});
