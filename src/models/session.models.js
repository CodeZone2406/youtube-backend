import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user is required"],
    },
    refreshTokenHash: {
      type: String,
      required: [true, "Refresh Token Hash is required"],
    },
    ip: {
      type: String,
      required: [true, "Ip is required"],
    },
    userAgent: {
      type: String,
      required: [true, "user Agent is required"],
    },
    revoke: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const sessionModel = mongoose.model("sessions", sessionSchema);

export default sessionModel;
