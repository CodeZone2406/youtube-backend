import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("dev"));

// routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";

// routes declaration
app.use("/api/v1/users", userRouter); //http://localhost:8000/api/v1/users
app.use("/api/v1/videos", videoRouter); //http://localhost:8000/api/v1/videos
app.use("/api/v1/comments", commentRouter); //http://localhost:8000/api/v1/comments

export { app };
