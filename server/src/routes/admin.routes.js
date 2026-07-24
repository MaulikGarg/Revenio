const express = require("express");
const {
  getUsers,
  manageUserBlock,
} = require("../controllers/admin.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/users", protect, adminOnly, getUsers);
router.patch("/users/:id/block", protect, adminOnly, manageUserBlock);

module.exports = router;
