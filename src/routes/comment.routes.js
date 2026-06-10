import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  getComment,
  getCommentByUser,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.route("/:videoId/add-comment").post(verifyJWT, addComment);

router.route("/:videoId/get-comment").get(getComment);

router.route("/get-comment-by-user").get(verifyJWT, getCommentByUser);

router
  .route("/:commentId/update-comment")
  .patch(verifyJWT, updateComment);

router
  .route("/:commentId/delete-comment")
  .delete(verifyJWT, deleteComment);

export default router;
