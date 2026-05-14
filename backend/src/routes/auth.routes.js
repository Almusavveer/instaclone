// 📦 Import Router from Express
const { Router } = require("express");
// 📦 Import auth controller functions
const {
  register,
  login,
  logout,
  getUser,
  rotaterefreshToken,
  logoutAll,
  updateProfile,
  getCurrentUser,
} = require("../controllers/auth.controllers");
const upload = require("../middleware/multer");
// 📝 Comment: login import can be used from destructuring above
// const {login}=require("../controllers/auth.controllers")
// 📦 Import post controller function
const { createpost ,deletePost ,editPost} = require("../controllers/post.controllers");
// 📦 Import middleware for token verification
const { verifyToken ,verifyTokenfrontend} = require("../middleware/token.middleware");

const { getPosts ,getMyPosts } = require("../controllers/post.controllers");
// 🔌 Initialize router
const router = Router();

// 📝 POST route for user registration (no authentication required)
router.post("/register", upload.single("avatar"), register);
// 🔑 POST route for user login (no authentication required)
router.post("/login", login);
// ✍️ POST route for creating a new post (authentication required)
router.post("/create-post", verifyToken,  upload.single("image") ,createpost);
// 👤 GET route for fetching user profile (authentication required)
router.get("/user", verifyToken, getUser);
// 🚪 POST route for user logout (no authentication required)
router.post("/logout", logout);
// 🔄 GET route for refreshing access token (no authentication required)
router.get("/refresh-token", rotaterefreshToken);
// 🚪 POST route for logging out all active sessions (authentication required)
router.post("/logout-all", verifyToken, logoutAll);
// 📄 GET route for fetching all posts (authentication required)
router.get("/posts", verifyToken, getPosts);
// 📄 GET route for fetching current user's posts (authentication required)
router.get("/my-posts", verifyToken, getMyPosts);
router.get("/verify", verifyTokenfrontend, (req, res) => {
  // Because verifyTokenfrontend called next(), we reach here
  res.status(200).json({ valid: true, user: req.user });
});

router.put(
  "/update-profile",
  verifyToken,
  upload.single("avatar"),
  updateProfile
);

router.get(
  "/me",
  verifyToken,
  getCurrentUser
);

router.delete(
  "/delete/:postId",
  verifyToken,
  deletePost
);

router.put(
  "/edit",
  verifyToken,
  editPost
);
module.exports = router;
