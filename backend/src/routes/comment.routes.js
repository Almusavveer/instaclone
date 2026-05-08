// 📦 Import Router from Express
const { Router } = require("express");

// 📦 Import post controller function
const router = Router();

const { verifyToken } = require("../middleware/token.middleware");
const {getComments,addComment,deleteComment} = require("../controllers/comment.controllers");

// 📝 Comment: POST route for adding a comment to a post (authentication required
router.post(
  "/:postId/comment",
  verifyToken,
  addComment
);

router.get(
  "/:postId/comments",
  getComments
);

router.delete(
  "/:postId/comment/:commentId",
  verifyToken,
  deleteComment
);

module.exports = router;