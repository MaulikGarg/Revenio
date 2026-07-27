const User = require("../models/user.model");
const Item = require("../models/item.model");
const Claim = require("../models/claim.model");
const Report = require("../models/report.model");
const Suggestion = require("../models/suggestion.model");
const Message = require("../models/suggestion.model");

// admin only, returns all users
// GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// block/unblock user, admin only
// PATCH /api/admin/users/:id/block
const manageUserBlock = async (req, res, next) => {
  try {
    const { blocked } = req.body; // true/false
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.blocked = blocked ? true : false;
    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// POWERRRRR COMMAND
// deletes everything resolved
const cleanupResolved = async (req, res, next) => {
  try {
    const returnedItems = await Item.find({ status: "returned" }).select("_id");
    const returnedItemIds = returnedItems.map((i) => i._id);
    const claimsFromReturned = await Claim.deleteMany({
      itemId: { $in: returnedItemIds },
    });
    const claimIdsFromReturned = claimsFromReturned.map((c) => c._id);

    const suggestionsFromReturned = await Suggestion.deleteMany({
      $or: [
        { foundItem: { $in: returnedItemIds } },
        { lostItem: { $in: returnedItemIds } },
      ],
    });
    const suggestionIdsFromReturned = suggestionsFromReturned.map((s) => s._id);
    const rejectedClaims = await Claim.find({ status: "rejected" }).select(
      "_id",
    );
    const rejectedClaimIds = rejectedClaims.map((c) => c._id);

    const dismissedSuggestions = await Suggestion.find({
      status: "dismissed",
    }).select("_id");
    const dismissedSuggestionIds = dismissedSuggestions.map((s) => s._id);

    const messagesDeleted = await Message.deleteMany({
      $or: [
        {
          attachedClaim: {
            $in: [...claimIdsFromReturned, ...rejectedClaimIds],
          },
        },
        {
          attachedSuggestion: {
            $in: [...suggestionIdsFromReturned, ...dismissedSuggestionIds],
          },
        },
      ],
    });

    const itemsDeleted = await Item.deleteMany({ status: "returned" });

    // PURGE ZA LEFTOVERS!
    const reportsDeleted = await Report.deleteMany({
      status: { $in: ["reviewed", "dismissed"] },
    });
    const rejectedClaimsDeleted = await Claim.deleteMany({
      status: "rejected",
    });
    const dismissedSuggestionsDeleted = await Suggestion.deleteMany({
      status: "dismissed",
    });

    res.status(200).json({
      success: true,
      message: "Cleanup complete",
      deleted: {
        items: itemsDeleted.deletedCount,
        claimsFromReturnedItems: claimsFromReturned.deletedCount,
        suggestionsFromReturnedItems: suggestionsFromReturned.deletedCount,
        reports: reportsDeleted.deletedCount,
        rejectedClaims: rejectedClaimsDeleted.deletedCount,
        dismissedSuggestions: dismissedSuggestionsDeleted.deletedCount,
        messages: messagesDeleted.deletedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { getUsers, manageUserBlock, cleanupResolved };
