import "dotenv/config";
import express from "express";
import cors from "cors";
import userRouter from "./routes/userRoutes.js";
import connectDB from "./configs/mongodb.js";
import imageRouter from "./routes/imageRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

// Setup __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App Config
const PORT = process.env.PORT || 4000;
const app = express();
await connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "https://image-craft-blond.vercel.app",
];

// Set up CORS middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Allow cookies and credentials in requests
  })
);

// Initialize Middlewares
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/user", userRouter);
app.use("/api/image", imageRouter);

app.get("/", (req, res) => res.send("API Working"));

app.listen(PORT, () => console.log("Server running on port " + PORT));
