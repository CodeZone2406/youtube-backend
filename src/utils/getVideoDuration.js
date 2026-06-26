import ffmpeg from "fluent-ffmpeg";
import ffprobe from "ffprobe-static";
ffmpeg.setFfprobePath(ffprobe.path);
import fs from "fs";

export const getVideoDuration = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error("File does not exist"));
    }

    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);

      const duration = Number(metadata?.format?.duration ?? 0);
      resolve(duration);
    });
  });
};
