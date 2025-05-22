import userModel from "../models/userModel.js";
import transactionModel from "../models/transactionModel.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";

// API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // checking for all data to register user
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token, user: { name: user.name } });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token, user: { name: user.name } });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API Controller function to get user available credits data
const userCredits = async (req, res) => {
  try {
    const { userId } = req.body;

    // Fetching userdata using userId
    const user = await userModel.findById(userId);
    res.json({
      success: true,
      credits: user.creditBalance,
      user: { name: user.name },
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API Controller function to fetch user data
const fetchUser = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(userId);
    const user = await userModel.findById(userId);
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// razorpay gateway initialize

// Replace with your Razorpay credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Payment API to add credits
const paymentRazorpay = async (req, res) => {
  try {
    const { userId, planId, amount, credits } = req.body;

    const userData = await userModel.findById(userId);

    // checking for planId and userdata
    if (!userData || !planId) {
      return res.json({ success: false, message: "Missing Details" });
    }

    let date = Date.now();

    // Creating Transaction Data
    const transactionData = {
      userId,
      plan: planId,
      amount,
      credits,
      date,
    };

    // Saving Transaction Data to Database
    const newTransaction = await transactionModel.create(transactionData);

    // Creating options to create razorpay Order
    const options = {
      amount: amount * 100,
      currency: process.env.CURRENCY,
      receipt: newTransaction._id,
    };

    // Creating razorpay Order
    // await razorpayInstance.orders.create(options, (error, order) => {
    //   if (error) {
    //     console.log(error);
    //     return res.json({ success: false, message: error });
    //   }
    //   res.json({ success: true, order });
    // });

    const order = await razorpay.orders.create(options);

    // Read current orders, add new order, and write back to the file
    const orders = [];
    orders.push({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: "created",
    });

    res.json({ success: true, order });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API Controller function to verify razorpay payment
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;

    // Fetching order data from razorpay
    const orderInfo = await razorpay.orders.fetch(razorpay_order_id);

    // Checking for payment status
    if (orderInfo.status === "paid") {
      const transactionData = await transactionModel.findById(
        orderInfo.receipt
      );
      if (transactionData.payment) {
        return res.json({ success: false, message: "Payment Failed" });
      }

      // Adding Credits in user data
      const userData = await userModel.findById(transactionData.userId);
      const creditBalance = userData.creditBalance + transactionData.credits;
      await userModel.findByIdAndUpdate(userData._id, { creditBalance });

      // Marking the payment true
      await transactionModel.findByIdAndUpdate(transactionData._id, {
        payment: true,
      });

      res.json({ success: true, message: "Credits Added" });
    } else {
      res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  userCredits,
  fetchUser,
  paymentRazorpay,
  verifyRazorpay,
};
