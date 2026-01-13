import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "./ApiError";
import { ApiResponse } from "./ApiResponse";

const deleteFromCloudinary = async (publicId) => {
    if (!publicId) {
        throw new ApiError(400, "Public ID is not provided");
    }

    try {
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result !== "ok") {
            throw new ApiError(404, "File not found on Cloudinary");
        }

        return new ApiResponse(200, "File deleted successfully");
    } catch (error) {
        throw new ApiError(
            error.statusCode || 500,
            error.message || "Failed to delete file from Cloudinary"
        );
    }
};

export { deleteFromCloudinary };