import express from "express";
import {
  userCredits,
  paymentRazorpay,
  verifyRazorpay,
  registerUser,
  loginUser,
  fetchUser,
} from "../controllers/UserController.js";
import authUser from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/fetch-user", authUser, fetchUser);

userRouter.get("/credits", authUser, userCredits);
userRouter.post("/pay-razor", authUser, paymentRazorpay);
userRouter.post("/verify-razor", verifyRazorpay);

export default userRouter;
