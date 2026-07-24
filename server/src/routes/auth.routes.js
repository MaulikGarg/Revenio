const express = require("express");
const { googleLogin, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/google", googleLogin);
router.get("/me", protect, getMe);

module.exports = router;
