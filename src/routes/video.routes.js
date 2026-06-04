import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  uploadVideos,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  getUserVideos,
  togglePublishStatus,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/upload-videos").post(
  verifyJWT,
  (req, res, next) => {
    next();
  },
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  (req, res, next) => {
    next();
  },
  uploadVideos
);

// Get all videos
router.route("/").get(getAllVideos);

// Get a specific video
router.route("/:videoId").get(getVideoById);

// Update video details (title, description)
router.route("/:videoId").patch(verifyJWT, updateVideo);

// Delete a video
router.route("/:videoId").delete(verifyJWT, deleteVideo);

// Get videos by a specific user
router.route("/user/:userId").get(getUserVideos);

// Toggle video publish status
router.route("/:videoId/toggle-publish").patch(verifyJWT, togglePublishStatus);

// // Like/Unlike a video
// router.route("/:videoId/toggle-like").post(verifyJWT, toggleVideoLike);

// // Get video statistics
// router.route("/:videoId/stats").get(getVideoStats);

export default router;
