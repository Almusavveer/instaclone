const { Router } = require("express");
const router = Router();
const {
  followUser,
  getFollowers,
  getFollowing,
  countStats,
    getFollowersAndFollowing
  
           // ← new controller for stats
} = require("../controllers/follow.controlles");  // adjust path if needed
const {
  likePost,
  unlikePost,
  checkIfLiked,
  getLikeCount,
  getUserPosts,
  getPostById,
   getLikedPosts
} = require("../controllers/post.controllers"); // adjust path if needed

const { verifyToken } = require("../middleware/token.middleware");

// Existing routes
router.post("/following", verifyToken, followUser);
router.get("/getallfollower", verifyToken, getFollowers);
router.get("/getallfollowering", verifyToken, getFollowing);
router.get("/getallfolloweringcount", verifyToken, countStats);

router.post("/:postId/like", verifyToken, likePost);
router.delete("/:postId/like", verifyToken, unlikePost);
router.get("/:postId/like/status", verifyToken, checkIfLiked);
router.get("/:postId/likes/count", getLikeCount); 
router.get("/liked-posts", verifyToken, getLikedPosts);

router.get("/user-posts/:userId", verifyToken, getUserPosts);

router.get("/:postId",verifyToken,getPostById);


router.get(
  "/follow/details",verifyToken,
  getFollowersAndFollowing
);

module.exports = router;