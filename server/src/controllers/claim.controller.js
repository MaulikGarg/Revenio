const Claim = require("../models/claim.model");
const Item = require("../models/item.model");

// POST /api/claims
const createClaim = async (req, res, next) => {
  try {
    const { itemId, answer, message } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    // disallow self claim DUHH
    if (item.postedBy.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot claim your own item" });
    }

    // if item status is not active, cant claim
    if (item.status !== "active") {
      return res.status(400).json({
        success: false,
        message: `This item is already ${item.status}`,
      });
    }

    // check if user has already made a claim on this item
    const existingClaim = await Claim.findOne({
      itemId,
      claimantId: req.user._id,
      status: { $in: ["pending", "approved"] },
    });

    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: `You already have a ${existingClaim.status} claim on this item`,
      });
    }

    const claim = await Claim.create({
      itemId,
      claimantId: req.user._id,
      answer,
      message,
    });

    res.status(201).json({ success: true, data: claim });
  } catch (error) {
    next(error);
  }
};

// get all claims for the item
// GET /api/claims/item/:itemId
const getClaimsForItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    // auth
    const isPoster = item.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isPoster && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    // get claims sorted by recent first
    const claims = await Claim.find({ itemId: req.params.itemId })
      .populate("claimantId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: claims.length, data: claims });
  } catch (error) {
    next(error);
  }
};

// for poster/admin to update claim status
// PATCH /api/claims/:id
const updateClaimStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["approved", "rejected"];

    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res
        .status(404)
        .json({ success: false, message: "Claim not found" });
    }

    const item = await Item.findById(claim.itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Associated item not found" });
    }

    const isPoster = item.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isPoster && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    claim.status = status;
    await claim.save();

    // if its approved mark as claimed to not allow other claims
    if (status === "approved") {
      item.status = "claimed";
      await item.save();

      // auto reject all other claims
      await Claim.updateMany(
        {
          itemId: item._id,
          _id: { $ne: claim._id }, // exclude the one we just approved
          status: "pending",
        },
        { status: "rejected" },
      );
    }

    res.status(200).json({ success: true, data: claim });
  } catch (error) {
    next(error);
  }
};

module.exports = { createClaim, getClaimsForItem, updateClaimStatus };
