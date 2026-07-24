const express = require("express");
const {
  createClaim,
  getClaimsForItem,
  updateClaimStatus,
} = require("../controllers/claim.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/item/:itemId", protect, getClaimsForItem);
router.post("/", protect, createClaim);
router.patch("/:id", protect, updateClaimStatus);

module.exports = router;
