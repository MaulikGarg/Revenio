const Message = require("../models/message.model");
const Claim = require("../models/claim.model");
const Suggestion = require("../models/suggestion.model");
const Item = require("../models/item.model");
const User = require("../models/user.model");
const Report = require("../models/report.model");

const areEqual = (id1, id2) => {
  if (!id1 || !id2) return false;
  return id1.toString() === id2.toString();
};

// create message because we never "send" a message
// the sending is a virtual illusion, just like this whole wicked world!
// POST /api/messages
const createMessage = async (req, res, next) => {
  try {
    const { attachedClaim, attachedSuggestion, attachedReport, body } =
      req.body;
    if (!attachedClaim && !attachedSuggestion && !attachedReport) {
      return res.status(400).json({
        success: false,
        message: "Message must be attached to a claim/suggestion/report.",
      });
    }

    if (!body) {
      return res.status(400).json({
        success: false,
        message: "Message must have a body.",
      });
    }

    const currentUserId = req.user._id;
    let recipientId = null;

    if (attachedClaim) {
      const claim = await Claim.findById(attachedClaim);
      if (!claim) {
        return res
          .status(404)
          .json({ success: false, message: "Claim not found." });
      }
      const item = await Item.findById(claim.itemId);
      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: "Associated item not found." });
      }

      if (areEqual(currentUserId, item.postedBy)) {
        recipientId = claim.claimantId;
      } else if (areEqual(currentUserId, claim.claimantId)) {
        recipientId = item.postedBy;
      } else {
        return res.status(403).json({
          success: false,
          message: "You must be the item poster or claimant.",
        });
      }
    } else if (attachedSuggestion) {
      const suggestion = await Suggestion.findById(attachedSuggestion);
      if (!suggestion) {
        return res
          .status(404)
          .json({ success: false, message: "Suggestion not found." });
      }
      const lostItem = await Item.findById(suggestion.lostItem);
      if (!lostItem) {
        return res
          .status(404)
          .json({ success: false, message: "Associated item not found." });
      }

      if (areEqual(currentUserId, lostItem.postedBy)) {
        recipientId = suggestion.suggestedBy;
      } else if (areEqual(currentUserId, suggestion.suggestedBy)) {
        recipientId = lostItem.postedBy;
      } else {
        return res.status(403).json({
          success: false,
          message: "You must be the loser or the suggester.",
        });
      }
    } else if (attachedReport) {
      const report = await Report.findById(attachedReport);
      if (!report)
        return res
          .status(404)
          .json({ success: false, message: "Report not found" });

      const isReporter =
        report.reportedBy.toString() === req.user._id.toString();
      const isAdmin = req.user.role === "admin";

      if (!isReporter && !isAdmin) {
        return res
          .status(403)
          .json({ success: false, message: "Not authorized." });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid attachment type.",
      });
    }

    const createdMsg = await Message.create({
      attachedClaim: attachedClaim || null,
      attachedSuggestion: attachedSuggestion || null,
      attachedReport: attachedReport || null,
      senderId: currentUserId,
      recipientId,
      body,
    });
    res.status(201).json({ success: true, data: createdMsg });
  } catch (error) {
    next(error);
  }
};

// GET /api/messages/:type/:id
// Example: /api/messages/claim/60d5ec49..
const getAttachmentMessages = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "admin";
    const { type, id } = req.params;
    const fieldMap = {
      claim: "attachedClaim",
      suggestion: "attachedSuggestion",
      report: "attachedReport",
    };
    const targetField = fieldMap[type.toLowerCase()];

    if (!targetField) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid attachment type. Valid types are: claim, suggestion, report.",
      });
    }

    if (type.toLowerCase() === "report") {
      const report = await Report.findById(id);
      if (!report) {
        return res
          .status(404)
          .json({ success: false, message: "Report not found." });
      }
      const isReporter = areEqual(report.reportedBy, req.user._id);
      if (!isReporter && !isAdmin) {
        return res
          .status(403)
          .json({ success: false, message: "Not authorized." });
      }

      const messages = await Message.find({ attachedReport: id })
        .sort({ createdAt: 1 })
        .populate("senderId", "name");

      return res
        .status(200)
        .json({ success: true, count: messages.length, data: messages });
    }

    const filter = { [targetField]: id };
    // if not admin apply filter
    if (!isAdmin) {
      filter.$or = [{ senderId: req.user._id }, { recipientId: req.user._id }];
    }

    const messages = await Message.find(filter)
      .sort({
        createdAt: 1,
      })
      .populate("senderId", "name")
      .populate("recipientId", "name");

    // we didnt find any messages, either user is an admin or a stalker
    if (messages.length === 0 && !isAdmin) {
      const threadExists = await Message.exists({ [targetField]: id });
      if (threadExists) {
        return res.status(403).json({
          success: false,
          message: "Not Authorized.",
        });
      }
    }

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createMessage, getAttachmentMessages };
