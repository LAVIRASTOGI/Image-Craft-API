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

    // Calling DeepAI API with axios
    const result = await axios.post(
      "https://api.deepai.org/api/text2img",
      { text: prompt },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": "839d9972-7840-4cb1-a32f-57f38d013844",
        },
      }
    );

    console.log("result", result.data);

    // Get the image URL from the response
    const imageUrl = result.data.output_url;

    if (!imageUrl) {
      return res.json({
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
