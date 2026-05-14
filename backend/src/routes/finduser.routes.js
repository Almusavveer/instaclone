const { Router } = require("express");
const router = Router();
const { search ,anotheruserprofile} = require("../controllers/post.controllers");
const {unfollowUser,getFollowStatus}=require("../controllers/follow.controlles")
const { verifyToken } = require("../middleware/token.middleware");
router.get("/search", verifyToken, search);
router.get("/:userId", verifyToken, anotheruserprofile);
router.delete("/follow", verifyToken, unfollowUser);
router.get("/follow/status", verifyToken, getFollowStatus);

module.exports = router;
