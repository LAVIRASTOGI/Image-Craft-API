import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  generateImage,
  removeBackground,
} from "../controllers/imageController.js";
import authUser from "../middlewares/auth.js";

const imageRouter = express.Router();

// Use /tmp directory which is writable in serverless environments
const uploadsDir = path.join("/tmp", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(
        file.originalname
      )}`
    );
  },
});

// Configure file filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

// Initialize multer with storage and limits
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter: fileFilter,
});

// Routes
imageRouter.post("/generate-image", authUser, generateImage);

// For removeBackground, first handle the file upload, then check auth, then process
imageRouter.post(
  "/remove-background",
  authUser, // Check auth first
  upload.single("image"), // Then handle file upload
  removeBackground // Then process the request
);

// imageRouter.post("/tonize-image", authUser, tonizeImage);

export default imageRouter;
