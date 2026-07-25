const express = require("express");
const upload = require("../middleware/upload.middleware");
const { uploadImage } = require("../controllers/upload.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", protect, upload.single("image"), uploadImage);

module.exports = router;
