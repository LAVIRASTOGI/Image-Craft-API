import jwt from "jsonwebtoken";

// User authentication middleware
const authUser = async (req, res, next) => {
  // Extract the token from headers
  const { token } = req.headers;
  console.log("token", token);

  // Check if the token is missing
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not Authorized. Login Again" });
  }

  try {
    // Verify the token using the secret key
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    console.log("tokenDecode", tokenDecode);
    // Check if the decoded token contains a user ID
    if (tokenDecode.id) {
      // Attach user ID to the request body
      req.body.userId = tokenDecode.id;
      console.log("req.body", req.body, req.body.userId);
    } else {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Login Again",
      });
    }

    // Call the next function in the stack
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

// Export the middleware
export default authUser;
