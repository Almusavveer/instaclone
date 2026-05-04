const jwt = require("jsonwebtoken");
const User = require("../model/user");

async function verifyToken(req, res, next) {
  const token = req.cookies.refreshToken; // Assuming token is sent in cookies

  if (!token) {
    return res.status(401).json({ message: "hi Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 Find user by email
    const user = await User.findOne({ Email: decoded.Email }).select(
      "-password",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found mid" });
    }

    req.user = decoded.email; // now full user data available

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = { verifyToken };
