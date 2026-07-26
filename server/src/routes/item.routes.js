const express = require("express");
const {
  createItem,
  getItems,
  getItemById,
  updateItemStatus,
  getMyItems,
  deleteItem,
} = require("../controllers/item.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", protect, getItems);
router.get("/:id", protect, getItemById);
router.post("/", protect, createItem);
router.patch("/:id/status", protect, updateItemStatus);
router.get("/mine", protect, getMyItems);
router.delete("/:id", protect, adminOnly, deleteItem);

module.exports = router;
