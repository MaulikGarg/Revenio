const express = require("express");
const {
  createClaim,
  getClaimsForItem,
  updateClaimStatus,
  deleteClaim,
} = require("../controllers/claim.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/item/:itemId", protect, getClaimsForItem);
router.post("/", protect, createClaim);
router.patch("/:id", protect, updateClaimStatus);
router.delete("/:id", protect, adminOnly, deleteClaim);

module.exports = router;
