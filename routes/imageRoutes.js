import express from "express";
import { generateImage } from "../controllers/imageController.js";
import authUser from "../middlewares/auth.js";

const imageRouter = express.Router();

imageRouter.post("/generate-image", authUser, generateImage);
// imageRouter.post("/remove-background", authUser, removeBackground);
// imageRouter.post("/tonize-image", authUser, tonizeImage);

export default imageRouter;
