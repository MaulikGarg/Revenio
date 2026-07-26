const express = require("express");
const {
  createReport,
  getReports,
  updateReportStatus,
  getMyReports,
} = require("../controllers/report.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", protect, createReport);
router.get("/", protect, adminOnly, getReports);
router.get("/mine", protect, getMyReports);
router.patch("/:id", protect, adminOnly, updateReportStatus);

module.exports = router;
