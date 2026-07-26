const express = require("express");
const {
  createItem,
  getItems,
  getItemById,
  updateItemStatus,
  getMyLostItems,
} = require("../controllers/item.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", protect, getItems);
router.get("/:id", protect, getItemById);
router.post("/", protect, createItem);
router.patch("/:id/status", protect, updateItemStatus);
router.get("/mine/lost", protect, getMyLostItems);

module.exports = router;
