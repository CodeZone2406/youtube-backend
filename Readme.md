# Video Platform REST API 🎬

A production-ready, backend-only API designed to power a video-sharing platform. This service handles secure user authentication, complex relational data models, and external media processing pipelines for uploading and streaming video content.

🔴 **[Interact with the Live API via Swagger UI](https://youtube-backend-1em8.onrender.com/api-docs)**

## 🚀 Architecture & Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Core Runtime** | Node.js, Express.js | API Gateway and RESTful route handling |
| **Database** | MongoDB Atlas, Mongoose | Relational document storage and aggregation pipelines |
| **Media Pipeline** | Multer, Cloudinary SDK | Multipart form data parsing and cloud asset hosting |
| **Authentication** | JWT (JSON Web Tokens), bcrypt | Secure route access and password hashing |
| **Validation** | Zod | Type-safe schema validation for request payloads |
| **Deployment** | Render | Cloud service hosting |

## ⚙️ Core System Features
* **Authentication & Authorization**: Secure user registration, login, and protected route access using short-lived Access Tokens and rotating Refresh Tokens.
* **Media Upload Pipelines**: Direct integration with Cloudinary to handle user avatars, video thumbnails, and high-bandwidth video file streams.
* **Relational Interactions**: Endpoints designed to track and manage user subscriptions, video likes, watch history, and nested comment threads.
* **Standardized Error Handling**: Centralized middleware ensuring consistent API responses and predictable HTTP status codes across the application.

## 🛠️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/CodeZone2406/youtube-backend.git](https://github.com/CodeZone2406/youtube-backend.git)
   cd youtube-backend
