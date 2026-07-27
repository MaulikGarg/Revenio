const express = require("express");
const {
  createMessage,
  getAttachmentMessages,
} = require("../controllers/message.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();
router.post("/", protect, createMessage);
router.get("/:type/:id", protect, getAttachmentMessages);

module.exports = router;
