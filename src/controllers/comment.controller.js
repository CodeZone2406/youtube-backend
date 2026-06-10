import { Comment } from "../models/comment.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.models.js";
import mongoose from "mongoose";

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const videoId = req.params.videoId;
  const userId = req.user._id;

  if (!content || !content.trim()) {
    throw new ApiError(400, "Comment cannot be empty");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video Not Found");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: userId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment created Successfully"));
});

const getComment = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not Found");
  }

  const comments = await Comment.find({ video: videoId })
    .populate("owner", "username avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const getCommentByUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const commentByUser = await Comment.find({ owner: userId }).sort({
    createdAt: -1,
  });
  return res
    .status(200)
    .json(
      new ApiResponse(200, commentByUser, "User Comments Fetched Successfully")
    );
});

const updateComment = asyncHandler(async (req, res) => {
  const commentId = req.params.commentId;
  const { updatedContent } = req.body;

  if (!updatedContent || !updatedContent.trim()) {
    throw new ApiError(400, "Comment cannot be empty");
  }

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const updatedComment = await Comment.findOneAndUpdate(
    {
      _id: commentId,
      owner: req.user._id,
    },
    {
      $set: { content: updatedContent },
    },
    {
      new: true,
    }
  );

  if (!updatedComment) {
    throw new ApiError(404, "Comment not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment Updated Successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const commentId = req.params.commentId;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const deletedComment = await Comment.findOneAndDelete({
    _id: commentId,
    owner: req.user._id,
  });

  if (!deletedComment) {
    throw new ApiError(404, "Comment not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedComment, "Comment Deleted Successfully"));
});

export {
  addComment,
  getComment,
  getCommentByUser,
  updateComment,
  deleteComment,
};
