const express = require("express");
const {
  createSuggestion,
  getSuggestionsForLostItem,
  dismissSuggestion,
} = require("../controllers/suggestion.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", protect, createSuggestion);
router.get("/lost/:lostItemId", protect, getSuggestionsForLostItem);
router.patch("/:id/dismiss", protect, dismissSuggestion);

module.exports = router;
