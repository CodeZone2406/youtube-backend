import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

router.route("/register").post(
    (req, res, next) => {
        // console.log("📍 Route hit - Content-Type:", req.headers['content-type']);
        next();
    },
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    (req, res, next) => {
        // console.log("📦 After multer - req.files:", req.files);
        next();
    },
    registerUser
)



export default router