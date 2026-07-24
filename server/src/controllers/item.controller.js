const Item = require("../models/item.model");
const Claim = require("../models/claim.model");

const createItem = async (req, res, next) => {
  try {
    const {
      type,
      title,
      description,
      category,
      location,
      date,
      photoUrl,
      claimQuestion,
      tags,
    } = req.body;

    const item = await Item.create({
      type,
      title,
      description,
      category,
      location,
      date,
      photoUrl,
      claimQuestion,
      tags,
      postedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

const getItems = async (req, res, next) => {
  try {
    const { type, category, status, q } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (q) filter.$text = { $search: q };

    // populate the "postedBy" in item with poster name and mail
    // this is not async so it does not execute, returns query
    let query = Item.find(filter).populate("postedBy", "name email");

    // if search query exists
    if (q) {
      // select based on mongodb index and sort by its determined relevance
      query = query
        .select({ score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } });
    } else {
      // sort recent otherwise
      query = query.sort({ createdAt: -1 });
    }

    // now send query
    const items = await query;
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "postedBy",
      "name email",
    );

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

const updateItemStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["active", "claimed", "returned"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    // if its one of the allowed persons
    const isPoster = item.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    let isApprovedClaimant = false;

    if (!isPoster && !isAdmin) {
      // is user approved?
      const approvedClaim = await Claim.findOne({
        itemId: item._id,
        claimantId: req.user._id,
        status: "approved",
      });

      isApprovedClaimant = approvedClaim ? true : false;
    }

    // not allow update if its none of the allowed persons
    if (!isPoster && !isAdmin && !isApprovedClaimant) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this item's status",
      });
    }

    item.status = status;
    await item.save();
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

module.exports = { createItem, getItems, getItemById, updateItemStatus };
