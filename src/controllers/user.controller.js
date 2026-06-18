import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefreshTokens } from "../services/token.services.js";
import jwt from "jsonwebtoken";
import { deleteFromCloudinary } from "../utils/DeleteFile.js";
import mongoose from "mongoose";
import crypto from "crypto";
import otpModel from "../models/otp.models.js";
import { generateOTP, generateOTPHtml } from "../utils/otpGenerator.js";
import { sendEmail } from "../services/email.service.js";
import sessionModel from "../models/session.models.js";
import {
  registerUserSchema,
  loginUserSchema,
  changePasswordSchema,
} from "../schemas/userSchema.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empy fields
  // check if user already exists : username and email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  //  check if for user creation
  // return response

  const dataToValidate = {
    ...req.body,
    avatar: req.files?.avatar,
    coverImage: req.files?.coverImage,
  };

  const validateResult = registerUserSchema.safeParse(dataToValidate);

  if (!validateResult.success) {
    throw new ApiError(
      400,
      "Validation Failed",
      validateResult.error.flatten()
    );
  }

  const { fullname, email, username, password } = validateResult.data;
  // const { fullname, email, username, password } = req.body;

  // if (
  //   [fullname, email, username, password].some((field) => field?.trim() === "")
  // ) {
  //   throw new ApiError(400, "All fields are compulsory or required");
  // }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  const avatar = await UploadOnCloudinary(avatarLocalPath);

  const coverImage = coverImageLocalPath
    ? await UploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const otp = generateOTP();
  const otpHtml = generateOTPHtml(otp);

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  await otpModel.create({
    email,
    user: user._id,
    otpHash,
  });

  await sendEmail({
    from: "arbaazansari9258@gmail.com",
    to: email,
    subject: "OTP Verification",
    html: otpHtml,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered Successfully!!"));
});

function getCloudinaryPublicId(localfilePathURL) {
  if (!localfilePathURL) return null;
  const urlParts = url.split("/");
  const lastPart = urlParts.pop().split("?")[0];
  return lastPart.split(".")[0];
}

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  // find the user
  // password check
  // generate access and refresh token
  // send in the form of secure cookies
  // send a response for successful login

  const validateResult = loginUserSchema.safeParse(req.body);

  if (!validateResult.success) {
    // Create an object where the key is the field and the value is the error message
    const errorMap = validateResult.error.errors.reduce((acc, err) => {
      const fieldName = err.path.join(".");
      acc[fieldName] = err.message;
      return acc;
    }, {});

    throw new ApiError(400, "Validation failed", errorMap);
  }

  const { email, username, password } = validateResult.data;
  // const { email, username, password } = req.body;

  // if (!password) {
  //   throw new ApiError(400, "Password is required");
  // }

  // if (!email && !username) {
  //   throw new ApiError(400, "Username or email is required");
  // }

  const user = await User.findOne({
    $or: [email ? { email } : null, username ? { username } : null].filter(
      Boolean
    ),
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await sessionModel.create({
    user: user._id,
    refreshTokenHash,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const loggedInUser = await User.findById(user._id).select("-password");

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser },
        "User logged in successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    throw new ApiError(400, "Refresh token not found");
  }

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionModel.findOne({
    refreshTokenHash,
    revoke: false,
  });

  if (!session) {
    return res.status(400).json({
      message: "Invalid refresh token",
    });
  }

  session.revoke = true;
  await session.save();

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshTOKEN =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshTOKEN) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshTOKEN,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshTOKEN !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentUserPassword = asyncHandler(async (req, res) => {
  const validateResult = changePasswordSchema.safeParse(req.body);
  if (!validateResult.success) {
    throw new ApiError(400, "Validation failed", validateResult.error.format());
  }
  // const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(401, "All Fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname: fullname,
        email: email,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const Currentuser = await User.findById(req.user?._id);
  const avatarPublicId = Currentuser.avatar
    ? getCloudinaryPublicId(Currentuser.avatar)
    : null;

  // Todo - Create a Utility function to Delete the old Avatar before uploading new avatar to cloudinary
  if (avatarPublicId) {
    await deleteFromCloudinary(avatarPublicId);
    fs.unlink(avatarLocalPath);
  }

  const avatar = await UploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Image Updated Successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image file is required");
  }

  const coverImage = await UploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on cover Image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image Updated Successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username not found or is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscriberCount: 1,
        channelsSubscribedToCount: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel Does Not Exists");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User Channel fetched Successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "User's watch History fetched successfully"
      )
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { otp, email } = req.body;

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  const otpDoc = await otpModel.findOne({
    email,
    otpHash,
  });

  if (!otpDoc) {
    return res.status(400).json(new ApiError(400, "Invalid OTP"));
  }

  const user = await User.findByIdAndUpdate(
    otpDoc.user,
    {
      verified: true,
    },
    { new: true }
  );

  await otpModel.deleteMany({
    user: otpDoc.user,
  });

  const verifiedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, verifiedUser, "Email Verified Successfully"));
});

const logOutAllDevices = asyncHandler(async (req, res) => {
  // Clear user's refresh token from database
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  // Revoke all sessions for this user
  await sessionModel.updateMany(
    { user: req.user._id, revoke: false },
    { $set: { revoke: true } }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logged Out From All Devices Successfully"));
});

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentUserPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  verifyEmail,
  logOutAllDevices,
};
