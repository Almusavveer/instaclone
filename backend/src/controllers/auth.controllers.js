// 📦 Import required modules
const User = require("../model/user");
const Session = require("../model/session");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const imagekit = require("../db/imagekit")

// 📝 Register a new user with hashed password and JWT tokens.
// async function register(req, res) {
//   try {
//     // ✅ Extract and validate user input
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // 🔍 Check if the user already exists in database
//     const isUserExist = await User.findOne({ email });

//     if (isUserExist) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // 🔐 Hash the password before storing it
//     const hashedPassword = await bcrypt.hash(password, saltRounds);
//     // 💾 Store hash in your password DB
//     const user = await User.create({ name, email, password: hashedPassword });

//     // 🔄 Create longer-lived refresh token (7 days)
//     const refreshToken = jwt.sign(
//       {
//         email: user.email,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "7d",
//       },
//     );
//     // 🎫 Hash the refresh token for storage
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(refreshToken)
//       .digest("hex");
//     // 📋 Create session record in database
//     const session = await Session.create({
//       user: user._id,
//       refreshToken: hashedToken,
//       ip: req.ip,
//       userAgent: req.get("User-Agent"),
//       expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
//     });
//     // 🍪 Set refresh token cookie (secure)
//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     });

//     // ⚡ Create short-lived access token (15 minutes)
//     const accessToken = jwt.sign(
//       {
//         email: user.email,
//         sessionId: session._id, // Include session ID in access token
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "15m",
//       },
//     );
//     return res.status(201).json({
//       message: "User registered successfully",
//       user,
//       accessToken,
//       refreshToken,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// }
async function register(req, res) {
  try {
    // ✅ Extract fields
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // 🔍 Check existing user
    const isUserExist = await User.findOne({
      email,
    });

    if (isUserExist) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // 🖼️ Avatar URL
    let avatarUrl = "";

    // ✅ Upload avatar if exists
    if (req.file) {
      const uploadedImage =
        await imagekit.upload({
          file: req.file.buffer,
          fileName: `${Date.now()}-${req.file.originalname}`,
          folder: "/avatars",
        });

      avatarUrl = uploadedImage.url;
    }

    // 🔐 Hash password
    const hashedPassword =
      await bcrypt.hash(password, saltRounds);

    // 💾 Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar: avatarUrl,
    });

    // 🔄 Refresh token
    const refreshToken = jwt.sign(
      {
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // 🔐 Hash refresh token
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // 📋 Create session
    const session = await Session.create({
      user: user._id,
      refreshToken: hashedToken,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      expiresAt: new Date(
        Date.now() +
          7 * 24 * 60 * 60 * 1000
      ),
    });

    // 🍪 Cookie
    res.cookie(
      "refreshToken",
      refreshToken,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        maxAge:
          7 * 24 * 60 * 60 * 1000,
      }
    );

    // ⚡ Access token
    const accessToken = jwt.sign(
      {
        email: user.email,
        sessionId: session._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    return res.status(201).json({
      message:
        "User registered successfully",
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

// 🔑 Authenticate existing user and issue a JWT token
async function login(req, res) {
    console.log(req.body);

    // ✅ Prevent destructure crash
    if (!req.body) {
      return res.status(400).json({
        message: "Request body missing",
      });
    }  // ✅ Extract credentials
  const { email, password } = req.body;
  console.log("Login Attempt:", email);
  if (!email || !password) {  ``
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

// const refreshToken = req.cookies.refreshToken;
//     res.clearCookie("refreshToken");

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
  const UAParser = require("ua-parser-js");

// 📱 Detect device info
const userAgent = req.get("User-Agent");
const ip = req.ip;

const parser = new UAParser(userAgent);
const ua = parser.getResult();

const deviceType = ua.device.type || "desktop";
const os = ua.os.name || "Unknown";

// optional from frontend
const deviceName = req.body.deviceName || "Unknown Device";

// 🔍 Check existing session (same device)
let existingSession = await Session.findOne({
  user: userExists._id,
  userAgent,
  ip
});

let session;

if (existingSession) {
  // ✅ SAME DEVICE → update
 
  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  existingSession.refreshToken =
    hashedToken;

  existingSession.count += 1;

  existingSession.expiresAt =
    new Date(
      Date.now() +
      7 * 24 * 60 * 60 * 1000
    );

  await existingSession.save();

  session = existingSession;
} else {
  // 🔄 NEW DEVICE → create new session

   const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  session =
    await Session.create({
      user: userExists._id,
      refreshToken:
        hashedToken,
      ip,
      userAgent,
      deviceName,
      deviceType,
      os,
      expiresAt:
        new Date(
          Date.now() +
          7 *
            24 *
            60 *
            60 *
            1000
        ),
    });
}

// ✅ ALWAYS SET COOKIE
res.cookie(
  "refreshToken",
  refreshToken,
  {
    httpOnly: true,
    secure:
      process.env
        .NODE_ENV ===
      "production",

    sameSite: "strict",

    maxAge:
      7 *
      24 *
      60 *
      60 *
      1000,
  });


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
    console.log("Session revoked: wok", session);
  if (!session) {
    return res.status(400).json({ message: "Invalid refresh token" });
  }

  // ✔️ Mark session as revoked
  session.revoked = true;

  await session.save();
 // Debugging log
  res.clearCookie("refreshToken", {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
});
  return res.status(200).json({ message: "Logout successful" });
}

// 👤 Return the authenticated user's profile, excluding the password
async function getUser(req, res) {
  try {
    // 🔍 Fetch user data without password
    const user = await User.findOne({ email: req.user.email }).select(
      "-password",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ name: user.name, email: user.email , avatar:user.avatar});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// 🔄 Refresh access token using valid refresh token
async function rotaterefreshToken(req, res) {
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
  return res
    .status(200)
    .json({ message: "Logged out from all devices successfully" });
}

async function getCurrentUser(
  req,
  res
) {
  try {
    const user =
      await User.findOne({
        email:
          req.user.email,
      }).select(
        "name username bio email avatar"
      );

    if (!user) {
      return res
        .status(404)
        .json({
          message:
            "User not found",
        });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message:
        "Internal Server Error",
    });
  }
}


// ✅ Update Profile
async function updateProfile(
  req,
  res
) {
  try {
    const user =
      await User.findOne({
        email:
          req.user.email,
      });

    if (!user) {
      return res
        .status(404)
        .json({
          message:
            "User not found",
        });
    }

    const {
      name,
      username,
      bio,
      email,
    } = req.body;

    // ✅ Update fields
    user.name =
      name || user.name;

    user.username =
      username ||
      user.username;

    user.bio =
      bio || user.bio;

    user.email =
      email || user.email;

    // 🖼️ Upload avatar
    if (req.file) {
      const uploadedImage =
        await imagekit.upload({
          file: req.file.buffer,

          fileName: `${Date.now()}-${
            req.file
              .originalname
          }`,

          folder: "/avatars",
        });

      user.avatar =
        uploadedImage.url;
    }

    await user.save();

    res.status(200).json({
      message:
        "Profile updated successfully",

      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message:
        "Internal Server Error",
    });
  }
}


module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  getUser,
  rotaterefreshToken,
  logoutAll,
  updateProfile,
};
