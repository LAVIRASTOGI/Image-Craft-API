import express from "express";
import multer from "multer";
import path from "path";
import {
  generateImage,
  removeBackground,
} from "../controllers/imageController.js";
import authUser from "../middlewares/auth.js";

const imageRouter = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

imageRouter.post("/generate-image", authUser, generateImage);
imageRouter.post(
  "/remove-background",
  upload.single("image"),
  authUser,
  removeBackground
);
// imageRouter.post("/tonize-image", authUser, tonizeImage);

export default imageRouter;
