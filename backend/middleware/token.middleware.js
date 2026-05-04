const jwt = require("jsonwebtoken");
const User = require("../model/user");

function verifyToken(req, res, next) {
 const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // contains id + email

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = { verifyToken };
