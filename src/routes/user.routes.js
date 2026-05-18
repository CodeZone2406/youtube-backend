import { Router } from "express";
import {
  changeCurrentUserPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logOutUser,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  verifyEmail,
  logOutAllDevices,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(
  (req, res, next) => {
    // console.log("📍 Route hit - Content-Type:", req.headers['content-type']);
    next();
  },
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  (req, res, next) => {
    // console.log("📦 After multer - req.files:", req.files);
    next();
  },
  registerUser
);

router.route("/login").post(loginUser);
router.route("/verify-email").patch(verifyEmail);

// secured routes
router.route("/logout").post(logOutUser);
router.route("/logout-all-devices").post(verifyJWT, logOutAllDevices);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentUserPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-Account-Details").patch(verifyJWT, updateAccountDetails);

router
  .route("/update-user-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/update-cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

export default router;
