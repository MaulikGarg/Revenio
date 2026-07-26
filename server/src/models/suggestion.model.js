const mongoose = require("mongoose");

const suggestionSchema = new mongoose.Schema(
  {
    lostItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    foundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    suggestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // the founder
    status: {
      type: String,
      enum: ["pending", "dismissed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Suggestion", suggestionSchema);
