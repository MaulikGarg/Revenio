const express = require("express");
const {
  createItem,
  getItems,
  getItemById,
  updateItemStatus,
} = require("../controllers/item.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", getItems);
router.get("/:id", getItemById);
router.post("/", protect, createItem);
router.patch("/:id/status", protect, updateItemStatus);

module.exports = router;
