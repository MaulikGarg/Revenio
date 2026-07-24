const User = require("../models/user.model");

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

module.exports = { getUsers, manageUserBlock };
