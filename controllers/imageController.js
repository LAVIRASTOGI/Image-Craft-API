import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import userModel from "../models/userModel.js";

// Controller function to generate image from prompt
// http://localhost:4000/api/image/generate-image
export const generateImage = async (req, res) => {
  try {
    const { userId, prompt } = req.body;

    // Fetching User Details Using userId
    const user = await userModel.findById(userId);

    if (!user || !prompt) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // Checking User creditBalance
    if (user.creditBalance === 0 || userModel.creditBalance < 0) {
      return res.json({
        success: false,
        message: "No Credit Balance",
        creditBalance: user.creditBalance,
      });
    }

    // DeepAI API key - use environment variable or fallback to hardcoded key
    const apiKey =
      process.env.DEEP_AI_API_KEY || "839d9972-7840-4cb1-a32f-57f38d013844";

    // Calling DeepAI API with axios
    const result = await axios.post(
      "https://api.deepai.org/api/text2img",
      { text: prompt },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
      }
    );

    console.log("result", result.data);

    // Get the image URL from the response
    const imageUrl = result.data.output_url;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Failed to generate image",
      });
    }

    // Deduction of user credit
    await userModel.findByIdAndUpdate(user._id, {
      creditBalance: user.creditBalance - 1,
    });

    // Sending Response
    res.json({
      success: true,
      message: "Image Generated Successfully",
      resultImage: imageUrl,
      creditBalance: user.creditBalance - 1,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Controller function to remove background from image
// http://localhost:4000/api/image/remove-background

export const removeBackground = async (req, res) => {
  try {
    const { userId } = req.body;

    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    // Check if the uploaded file exists
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image file provided" });
    }

    // Fetching User Details Using userId
    const user = await userModel.findById(userId);
    console.log("Found user:", user ? user._id : "Not found");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Checking User creditBalance
    if (user.creditBalance === 0 || user.creditBalance < 0) {
      return res.status(400).json({
        success: false,
        message: "No Credit Balance",
        creditBalance: user.creditBalance,
      });
    }

    // DeepAI API key - use environment variable or fallback to hardcoded key
    const apiKey =
      process.env.DEEP_AI_API_KEY || "839d9972-7840-4cb1-a32f-57f38d013844";

    // Create form data for API request
    const formData = new FormData();

    // Append the file from req.file
    formData.append("image", fs.createReadStream(req.file.path));

    // Calling DeepAI API with axios
    const result = await axios.post(
      "https://api.deepai.org/api/background-remover",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "api-key": apiKey,
        },
      }
    );

    console.log("result", result.data);
    // Get the processed image URL from the response
    const processedImageUrl = result.data.output_url;

    if (!processedImageUrl) {
      return res.status(400).json({
        success: false,
        message: "Failed to remove background",
      });
    }

    // Deduction of user credit
    await userModel.findByIdAndUpdate(user._id, {
      creditBalance: user.creditBalance - 1,
    });

    // Clean up the temporary file
    try {
      fs.unlinkSync(req.file.path);
    } catch (error) {
      console.log("Error deleting temporary file:", error);
    }

    // Sending Response
    res.json({
      success: true,
      message: "Background Removed Successfully",
      resultImage: processedImageUrl,
      creditBalance: user.creditBalance - 1,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
