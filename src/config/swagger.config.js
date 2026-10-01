import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "YouTube Backend API",
    version: "1.0.0",
    description:
      "API documentation for the YouTube clone backend. Every successful response follows the ApiResponse shape: { statusCode, data, message, success }.",
  },
  servers: [
    {
      url: "http://localhost:8000",
      description: "Local development server",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "accessToken",
      },
    },
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          statusCode: {
            type: "integer",
            example: 200,
          },
          data: {
            nullable: true,
            description: "The actual response payload for the request.",
          },
          message: {
            type: "string",
            example: "Success",
          },
          success: {
            type: "boolean",
            example: true,
          },
        },
        required: ["statusCode", "data", "message", "success"],
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          statusCode: {
            type: "integer",
            example: 400,
          },
          message: {
            type: "string",
            example: "Validation Failed",
          },
          errors: {
            type: "array",
            items: {
              type: "object",
            },
          },
          stack: {
            type: "string",
            nullable: true,
          },
        },
        required: ["success", "statusCode", "message", "errors"],
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          fullname: { type: "string" },
          username: { type: "string" },
          email: { type: "string" },
          avatar: { type: "string", nullable: true },
          coverImage: { type: "string", nullable: true },
        },
      },
      Video: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          videoFile: { type: "string" },
          thumbnail: { type: "string" },
          duration: {
            type: "object",
            properties: {
              seconds: { type: "number" },
              formatted: { type: "string" },
            },
          },
          owner: { type: "string" },
          isPublished: { type: "boolean" },
          likes: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      Comment: {
        type: "object",
        properties: {
          _id: { type: "string" },
          content: { type: "string" },
          video: { type: "string" },
          owner: { type: "string" },
        },
      },
    },
  },
};

const swaggerSpec = swaggerJSDoc({
  definition: swaggerDefinition,
  apis: [],
});

swaggerSpec.paths = {
  "/api/v1/users/register": {
    post: {
      tags: ["Users"],
      summary: "Register a new user",
      description:
        "Creates a user account and sends a verification OTP to the user's email.",
      security: [],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["fullname", "email", "username", "password"],
              properties: {
                fullname: { type: "string", example: "Arbaaz Ansari" },
                email: { type: "string", format: "email", example: "user@example.com" },
                username: { type: "string", example: "arbaaz" },
                password: { type: "string", format: "password", example: "StrongPass123" },
                avatar: { type: "string", format: "binary" },
                coverImage: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "User registered successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        400: {
          description: "Validation error or missing avatar file",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        409: {
          description: "User already exists",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/users/login": {
    post: {
      tags: ["Users"],
      summary: "Login user",
      description: "Authenticates a user and returns access and refresh tokens in secure cookies.",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email"],
              properties: {
                email: { type: "string", example: "user@example.com" },
                username: { type: "string", example: "arbaaz" },
                password: { type: "string", format: "password", example: "StrongPass123" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Login successful",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        401: {
          description: "Invalid credentials",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        404: {
          description: "User not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/users/verify-email": {
    patch: {
      tags: ["Users"],
      summary: "Verify email with OTP",
      description: "Verifies the user email using the submitted one-time password.",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "otp"],
              properties: {
                email: { type: "string", format: "email" },
                otp: { type: "string", example: "123456" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Email verified successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        400: {
          description: "Invalid OTP or validation failed",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/users/logout": {
    post: {
      tags: ["Users"],
      summary: "Logout current user",
      description: "Revokes the current refresh token and clears auth cookies.",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Logout successful",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        400: {
          description: "Refresh token missing or invalid",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/users/logout-all-devices": {
    post: {
      tags: ["Users"],
      summary: "Logout from all devices",
      description: "Ends all active sessions for the authenticated user.",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Logged out from all devices",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/users/refresh-token": {
    post: {
      tags: ["Users"],
      summary: "Refresh access token",
      description: "Issues a new access token and refresh token pair using the refresh token.",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Token refreshed successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        401: {
          description: "Unauthorized or expired refresh token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/users/change-password": {
    post: {
      tags: ["Users"],
      summary: "Change password",
      description: "Updates the authenticated user's password.",
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["oldPassword", "newPassword"],
              properties: {
                oldPassword: { type: "string", format: "password" },
                newPassword: { type: "string", format: "password" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Password changed successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        400: {
          description: "Validation or password mismatch",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/users/current-user": {
    get: {
      tags: ["Users"],
      summary: "Get current authenticated user",
      description: "Returns the identity and profile information of the logged-in user.",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Current user fetched successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/users/update-Account-Details": {
    patch: {
      tags: ["Users"],
      summary: "Update account details",
      description: "Updates the authenticated user's fullname and email profile fields.",
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                fullname: { type: "string" },
                email: { type: "string", format: "email" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "User details updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        400: {
          description: "Validation failed",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/users/update-user-avatar": {
    patch: {
      tags: ["Users"],
      summary: "Update user avatar",
      description: "Uploads a new avatar image and replaces the current profile image.",
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                avatar: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Avatar updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        400: {
          description: "Avatar file missing or upload issue",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/users/update-cover-image": {
    patch: {
      tags: ["Users"],
      summary: "Update cover image",
      description: "Uploads a cover image for the authenticated user.",
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                coverImage: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Cover image updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        400: {
          description: "Cover image file missing or upload issue",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/videos/upload-videos": {
    post: {
      tags: ["Videos"],
      summary: "Upload a new video",
      description: "Uploads a video file and thumbnail for the current user.",
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["title", "description", "videoFile", "thumbnail"],
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                videoFile: { type: "string", format: "binary" },
                thumbnail: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Video uploaded successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        400: {
          description: "Validation or upload failure",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/videos": {
    get: {
      tags: ["Videos"],
      summary: "List all videos",
      description: "Fetches all videos in the database.",
      responses: {
        200: {
          description: "Videos fetched successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/videos/{videoId}": {
    get: {
      tags: ["Videos"],
      summary: "Get a video by ID",
      description: "Returns the details of a specific video.",
      parameters: [
        {
          in: "path",
          name: "videoId",
          required: true,
          schema: { type: "string" },
          description: "MongoDB video ID",
        },
      ],
      responses: {
        200: {
          description: "Video fetched successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        404: {
          description: "Video not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
    patch: {
      tags: ["Videos"],
      summary: "Update video details",
      description: "Changes the video title and description for the authenticated owner.",
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "videoId",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Video updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        400: {
          description: "Validation failed",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
    delete: {
      tags: ["Videos"],
      summary: "Delete a video",
      description: "Deletes a video belonging to the authenticated user.",
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "videoId",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Video deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        404: {
          description: "Video not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/videos/user/{userId}": {
    get: {
      tags: ["Videos"],
      summary: "Get videos by user ID",
      description: "Returns all videos uploaded by a user.",
      parameters: [
        {
          in: "path",
          name: "userId",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Videos fetched successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        404: {
          description: "No videos found for the user",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/videos/{videoId}/toggle-publish": {
    patch: {
      tags: ["Videos"],
      summary: "Toggle publish status",
      description: "Publishes or unpublishes a video owned by the authenticated user.",
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "videoId",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Publish status toggled successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        403: {
          description: "User is not the owner of the video",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/videos/{videoId}/toggle-like": {
    post: {
      tags: ["Videos"],
      summary: "Like or unlike a video",
      description: "Toggles the authenticated user's like status on a video.",
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "videoId",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Like state updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        404: {
          description: "Video not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/videos/{videoId}/video-stats": {
    get: {
      tags: ["Videos"],
      summary: "Get video stats",
      description: "Returns a summary of video metrics such as likes, views, owner, and media details.",
      parameters: [
        {
          in: "path",
          name: "videoId",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Video stats fetched successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        404: {
          description: "Video not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/videos/users/{userId}/videos": {
    get: {
      tags: ["Videos"],
      summary: "Fetch user videos with filters",
      description: "Returns a paginated and filtered list of videos for a user.",
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "userId",
          required: true,
          schema: { type: "string" },
        },
        {
          in: "query",
          name: "page",
          schema: { type: "integer", default: 1 },
        },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", default: 10 },
        },
        {
          in: "query",
          name: "search",
          schema: { type: "string" },
        },
        {
          in: "query",
          name: "sortBy",
          schema: { type: "string" },
        },
        {
          in: "query",
          name: "sortType",
          schema: { type: "string", enum: ["asc", "desc"] },
        },
        {
          in: "query",
          name: "isPublished",
          schema: { type: "boolean" },
        },
      ],
      responses: {
        200: {
          description: "Filtered videos fetched successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/comments/{videoId}/add-comment": {
    post: {
      tags: ["Comments"],
      summary: "Add a comment to a video",
      description: "Creates a new comment for a specific video by the authenticated user.",
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "videoId",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["content"],
              properties: {
                content: { type: "string", example: "Great video!" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Comment created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        400: {
          description: "Validation failed or invalid video ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        404: {
          description: "Video not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/comments/{videoId}/get-comment": {
    get: {
      tags: ["Comments"],
      summary: "Get comments for a video",
      description: "Returns all comments posted on a particular video.",
      parameters: [
        {
          in: "path",
          name: "videoId",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Comments fetched successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        400: {
          description: "Invalid video ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        404: {
          description: "Video not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/comments/get-comment-by-user": {
    get: {
      tags: ["Comments"],
      summary: "Get comments by authenticated user",
      description: "Returns all comments created by the logged-in user.",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "User comments fetched successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/comments/{commentId}/update-comment": {
    patch: {
      tags: ["Comments"],
      summary: "Update a comment",
      description: "Updates a comment if it belongs to the authenticated user.",
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "commentId",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["updatedContent"],
              properties: {
                updatedContent: { type: "string", example: "Updated comment text" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Comment updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        400: {
          description: "Validation or invalid comment ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        404: {
          description: "Comment not found or unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/comments/{commentId}/delete-comment": {
    delete: {
      tags: ["Comments"],
      summary: "Delete a comment",
      description: "Deletes a comment if it belongs to the authenticated user.",
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "commentId",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Comment deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        400: {
          description: "Invalid comment ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        404: {
          description: "Comment not found or unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
};

export { swaggerSpec };
