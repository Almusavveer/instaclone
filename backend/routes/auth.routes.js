// 📦 Import Router from Express
const { Router } = require("express");
// 📦 Import auth controller functions
const {
  register,
  login,
  logout,
  getUser,
  refreshToken,
  logoutAll,
} = require("../controllers/auth.controllers");
// 📝 Comment: login import can be used from destructuring above
// const {login}=require("../controllers/auth.controllers")
// 📦 Import post controller function
const { createpost } = require("../controllers/post.controllers");
// 📦 Import middleware for token verification
const { verifyToken } = require("../middleware/token.middleware");

const { getPosts ,getMyPosts } = require("../controllers/post.controllers");
// 🔌 Initialize router
const router = Router();

// 📝 POST route for user registration (no authentication required)
router.post("/register", register);
// 🔑 POST route for user login (no authentication required)
router.post("/login", login);
// ✍️ POST route for creating a new post (authentication required)
router.post("/create-post", verifyToken, createpost);
// 👤 GET route for fetching user profile (authentication required)
router.get("/user", verifyToken, getUser);
// 🚪 POST route for user logout (no authentication required)
router.post("/logout", logout);
// 🔄 GET route for refreshing access token (no authentication required)
router.get("/refresh-token", refreshToken);
// 🚪 POST route for logging out all active sessions (authentication required)
router.post("/logout-all", verifyToken, logoutAll);
// 📄 GET route for fetching all posts (authentication required)
router.get("/posts", verifyToken, getPosts);
// 📄 GET route for fetching current user's posts (authentication required)
router.get("/my-posts", verifyToken, getMyPosts);

module.exports = router;
