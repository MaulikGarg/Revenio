const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["lost", "found"], required: true },
    title: { type: String, required: true },
    // required because item must have identifiable context
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["ID Card", "Bottle", "Electronics", "Book", "Bag", "Other"],
      required: true,
    },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    photoUrl: { type: String },
    // active means either its been found but unclaimed, or looking
    status: {
      type: String,
      enum: ["active", "claimed", "returned"],
      default: "active",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    claimQuestion: { type: String },
    tags: [{ type: String, lowercase: true }],
  },
  { timestamps: true },
);

// for easier searching, we index!
itemSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Item", itemSchema);
