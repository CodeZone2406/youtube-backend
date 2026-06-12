import moongoose, { Schema } from "mongoose";

const playlistSchema = new moongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    vidoes: {
      type: [Schema.ObjectId.types],
      required: true,
      ref: "Video",
      default: [],
    },
    owner: {
      type: Schema.ObjectId.types,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Playlist = moongoose.model("Playlist", playlistSchema);
