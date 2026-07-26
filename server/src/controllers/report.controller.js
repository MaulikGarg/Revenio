const Report = require("../models/report.model");

// Submit a report (abuse, spam, suspicious item/user)
// POST /api/reports
const createReport = async (req, res, next) => {
  try {
    const { targetItem, targetUser, reason } = req.body;

    if (!reason) {
      return res
        .status(400)
        .json({ success: false, message: "Reason is required" });
    }

    if (!targetItem && !targetUser) {
      return res.status(400).json({
        success: false,
        message: "Must report either an item or a user",
      });
    }

    const report = await Report.create({
      reportedBy: req.user._id,
      targetItem,
      targetUser,
      reason,
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

// Get all reports (admin only)
// GET /api/reports
const getReports = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .populate("reportedBy", "name email")
      .populate("targetItem", "title type")
      .populate("targetUser", "name email")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    next(error);
  }
};

// get the reports made by the logged in user along with a target filter
// GET /api/reports/mine?targetItem=x or targetUser=x
const getMyReports = async (req, res, next) => {
  try {
    const { targetItem, targetUser } = req.query;
    const filter = { reportedBy: req.user._id };
    if (targetItem) filter.targetItem = targetItem;
    if (targetUser) filter.targetUser = targetUser;
    const reports = await Report.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};

// Update report status (reviewed/dismissed) admin only
// PATCH /api/reports/:id
const updateReportStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["reviewed", "dismissed"];

    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    report.status = status;
    await report.save();

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReport, getReports, updateReportStatus, getMyReports };
