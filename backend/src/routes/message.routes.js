const express = require("express");

const {
  sendMessage,
  sendChatRequest,
  acceptChatRequest,
  getNotifications,
 checkChatStatus,
 getMessages
} = require("../controllers/message.controllers");

const { verifyToken } = require("../middleware/token.middleware");

const router = express.Router();

/* =========================
   CHAT REQUEST SYSTEM
========================= */

// send request
router.post("/chat-request", verifyToken, sendChatRequest);

// accept request
router.post("/accept-request", verifyToken, acceptChatRequest);

// get notifications (chat requests)
router.get("/notifications", verifyToken, getNotifications);

/* =========================
   MESSAGES
========================= */

// send message (ONLY if accepted)
router.post("/send", verifyToken, sendMessage);

router.get("/status/:receiverId", verifyToken, checkChatStatus);

router.get("/messages/:receiverId", verifyToken, getMessages);

module.exports = router;