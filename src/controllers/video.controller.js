import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";

const uploadVideos = asyncHandler(async (req, res) => {
  const { title, description, duration } = req.body;
  const parsedDuration = Number(duration);
  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    !title.trim() ||
    !description.trim() ||
    isNaN(parsedDuration) ||
    parsedDuration <= 0
  ) {
    throw new ApiError(400, "All fields are compulsory or required");
  }

  const videoFilePath = req.files?.videoFile?.[0]?.path;
  const thumbnailPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFilePath || !thumbnailPath) {
    throw new ApiError(400, "Video file and thumbnail are required");
  }

  try {
    const [videoFile, thumbnailFile] = await Promise.all([
      UploadOnCloudinary(videoFilePath),
      UploadOnCloudinary(thumbnailPath),
    ]);
    // Run all these promises in parallel, and wait until ALL are done

    if (!videoFile || !thumbnailFile) {
      throw new ApiError(400, "Upload failed");
    }

    const video = await Video.create({
      videoFile: videoFile.url,
      thumbnail: thumbnailFile.url,
      title: title.trim(),
      description: description.trim(),
      duration: parsedDuration,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, video, "Video Uploaded Successfully"));
  } catch (error) {
    throw new ApiError(
      error?.statusCode || 500,
      error?.message || "Video upload failed"
    );
  }
});

const getAllVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find();
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos Fectched Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const id = req.params.videoId;
  const video = await Video.findById(id);
  console.log("Requested ID:", req.params.videoId);

  if (!video) {
    throw new ApiError(404, "Video Not Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Fetched Successfully"));
});

export { uploadVideos, getAllVideos, getVideoById };
