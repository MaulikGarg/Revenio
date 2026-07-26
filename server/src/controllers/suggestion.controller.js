const Suggestion = require("../models/suggestion.model");
const Item = require("../models/item.model");

// Founder suggests one of their found items matches a lost item
// POST /api/suggestions

const createSuggestion = async (req, res, next) => {
  try {
    const { lostItem, foundItem } = req.body;
    const lost = await Item.findById(lostItem);
    const found = await Item.findById(foundItem);
    if (!lost || !found) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
    if (lost.type !== "lost" || found.type !== "found") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid item types" });
    }
    if (found.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only suggest your own found items",
      });
    }
    if (lost.postedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot suggest a match on your own lost post",
      });
    }

    const existingSuggestion = await Suggestion.findOne({
      lostItem,
      foundItem,
      suggestedBy: req.user._id,
      status: "pending",
    });
    if (existingSuggestion) {
      return res.status(400).json({
        success: false,
        message: `You already have a ${existingSuggestion.status} suggestion on this item`,
      });
    }

    const suggestion = await Suggestion.create({
      lostItem,
      foundItem,
      suggestedBy: req.user._id,
    });
    res.status(201).json({ success: true, data: suggestion });
  } catch (error) {
    next(error);
  }
};

// Get suggestions for a lost item
// GET /api/suggestions/lost/:lostItemId
const getSuggestionsForLostItem = async (req, res, next) => {
  try {
    const lost = await Item.findById(req.params.lostItemId);
    if (!lost) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
    if (
      lost.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    const suggestions = await Suggestion.find({
      lostItem: req.params.lostItemId,
      status: "pending",
    })
      .populate(
        "foundItem",
        "title description category location date photoUrl status",
      )
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    next(error);
  }
};

// dismissing a suggestion
// PATCH /api/suggestions/:id/dismiss
const dismissSuggestion = async (req, res, next) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id).populate(
      "lostItem",
    );
    if (!suggestion) {
      return res
        .status(404)
        .json({ success: false, message: "Suggestion not found" });
    }

    if (
      suggestion.lostItem.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    suggestion.status = "dismissed";
    await suggestion.save();

    res.status(200).json({ success: true, data: suggestion });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSuggestion,
  getSuggestionsForLostItem,
  dismissSuggestion,
};
