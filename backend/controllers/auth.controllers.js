// 📦 Import required modules
const User = require("../model/user");
const Session = require("../model/session");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
// 📝 Register a new user with hashed password and JWT tokens.
async function register(req, res) {
  try {
    // ✅ Extract and validate user input
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔍 Check if the user already exists in database
    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔐 Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // 💾 Store hash in your password DB
    const user = await User.create({ name, email, password: hashedPassword });

    // 🔄 Create longer-lived refresh token (7 days)
    const refreshToken = jwt.sign(
      {
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
    // 🎫 Hash the refresh token for storage
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    // 📋 Create session record in database
    const session = await Session.create({
      user: user._id,
      refreshToken: hashedToken,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    // 🍪 Set refresh token cookie (secure)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ⚡ Create short-lived access token (15 minutes)
    const accessToken = jwt.sign(
      {
        email: user.email,
        sessionId: session._id, // Include session ID in access token
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );
    return res.status(201).json({
      message: "User registered successfully",
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// 🔑 Authenticate existing user and issue a JWT token
async function login(req, res) {
  // ✅ Extract credentials
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // 🔍 Check if user exists
  const userExists = await User.findOne({ email });
  if (!userExists) {
    return res.status(400).json({
      message: "Aapka account nahi bna hua hai!",
    });
  }

  // 🔐 Verify password
  const match = await bcrypt.compare(password, userExists.password);
  if (!match) {
    return res.status(401).json({ message: "wrong password" });
  }

  // 🔄 Create longer-lived refresh token (7 days)
  const refreshToken = jwt.sign(
    {
      email: userExists.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  const session = await Session.create({
    user: userExists._id,
    refreshToken: hashedToken,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // ⚡ Create short-lived access token (15 minutes)
  const accessToken = jwt.sign(
    {
      email: userExists.email,
      sessionId: session._id, // Include session ID in access token
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  return res.status(200).json({
    message: "Login successful",
    user: userExists,
    refreshToken: refreshToken,
    accessToken: accessToken,
  });
}

// 🚪 Clear authentication token cookie on logout
async function logout(req, res) {
  // 🍪 Retrieve refresh token from cookies
  const refreshToken = req.cookies.refreshToken;
  console.log("Refresh Token on Logout:", refreshToken); // Debugging log
  if (!refreshToken) {
    return res.status(400).json({ message: "No refresh token provided" });
  }
  // 🎫 Hash token for lookup
  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  console.log("Hashed Token on Logout:", hashedToken); // Debugging log
  // 🔍 Find and validate session
  const session = await Session.findOne({
    refreshToken: hashedToken,
    revoked: false,
  });
  if (!session) {
    return res.status(400).json({ message: "Invalid refresh token" });
  }

  // ✔️ Mark session as revoked
  session.revoked = true;

  await session.save();

  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "Logout successful" });
}

// 👤 Return the authenticated user's profile, excluding the password
async function getUser(req, res) {
  try {
    // 🔍 Fetch user data without password
    const user = await User.findOne({ email: req.user }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ name: user.name, email: user.email });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// 🔄 Refresh access token using valid refresh token
async function refreshToken(req, res) {
  // 🍪 Extract refresh token from cookies
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(400).json({ message: "No refresh token provided" });
  }
  // 🎫 Hash token for lookup
  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  // 🔍 Find active session
  const session = await Session.findOne({
    refreshToken: hashedToken,
    revoked: false,
  });

  if (!session) {
    return res.status(400).json({ message: "Invalid refresh token" });
  }
  // ⏰ Check if token expired
  if (session.expiresAt < new Date()) {
    session.revoked = true;
    await session.save();
    return res.status(400).json({ message: "Refresh token expired" });
  }
  // 🔍 Get user details
  const userExists = await User.findById(session.user);
  if (!userExists) {
    return res.status(400).json({ message: "User not found" });
  }

  // 🔄 Generate new refresh token (7 days)
  const newRefreshToken = jwt.sign(
    {
      email: userExists.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
  // 🎫 Hash new refresh token
  const newHashedToken = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  // 📋 Create new session record
  session.refreshToken = newHashedToken;
  session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  session.revoked = false;
  await session.save();

  // ⚡ Generate new access token (15 minutes)
  const accessToken = jwt.sign(
    {
      email: userExists.email,
      sessionId: session._id, // Include session ID in access token
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  // 🍪 Set new refresh token cookie
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  // ✅ Return success response with tokens
  return res.status(200).json({
    message: "Token refreshed successfully",
    accessToken,
    refreshToken: newRefreshToken,
  });
}
// logout from all devices
async function logoutAll(req, res) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(400).json({ message: "No refresh token provided" });
  }
  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

   // 🔍 Find session to get user ID and updateing the revoked
  const session = await Session.updateMany(
    {
      refreshToken: hashedToken,
      revoked: false,
    },
    { revoked: true },
  );

  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "Logged out from all devices successfully" });
}
module.exports = { register, login, logout, getUser, refreshToken , logoutAll};
