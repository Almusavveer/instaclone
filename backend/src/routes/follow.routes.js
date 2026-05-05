const { Router } = require("express");
const router = Router();
const {
  followUser,
  getFollowers,
  getFollowing,
  countStats,
           // ← new controller for stats
} = require("../controllers/follow.controlles");  // adjust path if needed
const { verifyToken } = require("../middleware/token.middleware");

// Existing routes
router.get("/following", verifyToken, followUser);
router.get("/getallfollower", verifyToken, getFollowers);
router.get("/getallfollowering", verifyToken, getFollowing);
router.get("/getallfolloweringcount", verifyToken, countStats);




module.exports = router;