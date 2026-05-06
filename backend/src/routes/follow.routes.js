const { Router } = require("express");
const router = Router();
const {
  followUser,
  getFollowers,
  getFollowing,
  countStats,
  
           // ← new controller for stats
} = require("../controllers/follow.controlles");  // adjust path if needed
const {
  likePost,
  unlikePost,
  checkIfLiked,
  getLikeCount,
  getUserPosts
} = require("../controllers/post.controllers"); // adjust path if needed

const { verifyToken } = require("../middleware/token.middleware");

// Existing routes
router.get("/following", verifyToken, followUser);
router.get("/getallfollower", verifyToken, getFollowers);
router.get("/getallfollowering", verifyToken, getFollowing);
router.get("/getallfolloweringcount", verifyToken, countStats);

router.post("/:postId/like", verifyToken, likePost);
router.delete("/:postId/like", verifyToken, unlikePost);
router.get("/:postId/like/status", verifyToken, checkIfLiked);
router.get("/:postId/likes/count", getLikeCount); 

router.get("/user-posts/:userId", verifyToken, getUserPosts);



module.exports = router;