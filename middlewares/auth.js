import jwt from "jsonwebtoken";

// User authentication middleware
const authUser = async (req, res, next) => {
  try {
    // Get token from headers or query or body
    const token =
      req.headers.token ||
      req.headers.authorization?.split(" ")[1] ||
      req.query.token ||
      req.body.token;

    console.log("Authentication token:", token ? "Received" : "Missing");

    // Check if the token is missing
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized. Login Again" });
    }

    // Verify the token using the secret key
    const tokenDecode = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key_here"
    );

    // Check if the decoded token contains a user ID
    if (tokenDecode && tokenDecode.id) {
      // Attach user ID to the request as a property (not just in body)
      req.userId = tokenDecode.id;
      req.body.userId = tokenDecode.id; // For backward compatibility
      console.log("User authenticated:", tokenDecode.id);
    } else {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Invalid token payload.",
      });
    }

    // Call the next function in the stack
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({
      success: false,
      message: "Authentication failed. " + error.message,
    });
  }
};

// Export the middleware
export default authUser;
