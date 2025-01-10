const express = require("express");
const router = express.Router();
const {
  getUserMessages,
  getChat,
  sendMessage,
} = require("../controllers/chatController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

// Get chat messages between admin and user
router.get("/:userId/:adminId", requireAuth, getChat);

// Get users who sent messages
router.get("/users", requireAuth, requireAdmin, getUserMessages);

// sending messages for both user and admin
router.post("/send", sendMessage);

module.exports = router;
