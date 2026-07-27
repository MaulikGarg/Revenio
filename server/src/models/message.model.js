const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    attachedClaim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim",
      default: null,
    },
    attachedSuggestion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Suggestion",
      default: null,
    },
    attachedReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      default: null,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    body: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", messageSchema);
