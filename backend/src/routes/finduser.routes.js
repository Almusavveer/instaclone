const { Router } = require("express");
const router = Router();
const { search } = require("../controllers/post.controllers");
const { verifyToken } = require("../middleware/token.middleware");
router.get("/search", verifyToken, search);

module.exports = router;
