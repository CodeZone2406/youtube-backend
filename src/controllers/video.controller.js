import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/DeleteFile.js";
import mongoose from "mongoose";

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
      owner: req.user._id,
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

const updateVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const videoId = req.params.videoId;

  if (!title && !description) {
    throw new ApiError(400, "At least one field is required!");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title?.trim(),
        description: description?.trim(),
      },
    },
    {
      new: true,
    }
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Details Updated Successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;

  deleteFromCloudinary(videoId);
  const deletedVideo = await Video.findByIdAndDelete(videoId);

  if (!deletedVideo) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Video deleted successfully!"));
});

const getUserVideos = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  // console.log(userId);

  const videos = await Video.find({ owner: userId });
  console.log(videos);
  if (videos.length === 0) {
    throw new ApiError(404, "Video not found for this user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Video Fetched Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found!");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You don't have access to this video!");
  }

  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        `Video ${video.isPublished ? "published" : "unpublished"} successfully`
      )
    );
});

const toggleVideoLike = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;
  const userId = req.user._id;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found!");
  }

  const hasLiked = await video.likes.includes(userId);

  await Video.updateOne(
    {
      _id: video,
    },
    hasLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } }
  );

  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, hasLiked ? "Unliked Video" : "Liked Video", "True")
    );
});

const getVideoStats = asyncHandler(async (req, res) => {
  // Video Stats to Display :
  // thumbnail, title, description, duration, views, owner, and likes count
  const videoId = req.params.videoId;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video Not Found");
  }

  const videoStats = await Video.aggregate([
    // Stage 1: Find the specific video using its _id
    // Input: All videos in the collection
    // Output: Only the video matching videoId
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },

    // Stage 2: Join the users collection
    // owner field contains a User ObjectId
    // MongoDB fetches the corresponding user document
    // Output: owner becomes an array containing the matched user
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },

    // Before $unwind:
    // owner: [
    //   {
    //     _id: "...",
    //     username: "arbaaz"
    //   }
    // ]

    // Stage 3: Convert owner array into a single object
    // Makes it easier to access owner.username, owner.fullName, etc.
    {
      $unwind: "$owner",
    },

    // After $unwind:
    // owner: {
    //   _id: "...",
    //   username: "arbaaz"
    // }

    // Stage 4: Shape the final response
    // - Keep only required fields
    // - Create a new field likesCount
    // - Format owner information
    {
      $project: {
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,

        // Count number of likes in the likes array
        likesCount: {
          $size: "$likes",
        },

        // Return only selected owner fields
        owner: {
          _id: "$owner._id",
          username: "$owner.username",
          fullName: "$owner.fullName",
          avatar: "$owner.avatar",
        },
      },
    },
  ]);

  /*
  Pipeline Flow:

  Videos Collection
        │
        ▼
    $match
        │
        ▼
  Selected Video
        │
        ▼
    $lookup
        │
        ▼
  Video + Owner Array
        │
        ▼
    $unwind
        │
        ▼
  Video + Owner Object
        │
        ▼
    $project
        │
        ▼
  Final API Response

  Example Output:

  {
    "thumbnail": "thumbnail.jpg",
    "title": "MongoDB Aggregation",
    "description": "Learn Aggregation Pipeline",
    "duration": 600,
    "views": 1500,
    "likesCount": 25,
    "owner": {
      "_id": "...",
      "username": "arbaaz",
      "fullName": "Arbaaz Ansari",
      "avatar": "avatar.jpg"
    }
  }
  */
  return res
    .status(200)
    .json(
      new ApiResponse(200, videoStats[0], "Video stats fetched successfully")
    );
});

export {
  uploadVideos,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  getUserVideos,
  togglePublishStatus,
  toggleVideoLike,
  getVideoStats,
};
