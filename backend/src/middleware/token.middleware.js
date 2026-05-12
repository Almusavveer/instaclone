const jwt = require("jsonwebtoken");
const User = require("../model/user");

function verifyToken(req, res, next) {
 const token = req.cookies.refreshToken;
 
  if (!token) {
    return res.status(401).json({ message: "Unauthorized po" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function verifyTokenfrontend(req, res, next) {  // ✅ add 'next' parameter
  const token = req.headers.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;   // attach user info to request

    next();               // ✅ pass control to the next handler (do NOT send response here)
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = { verifyToken ,verifyTokenfrontend};
