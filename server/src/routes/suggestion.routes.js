const express = require("express");
const {
  createSuggestion,
  getSuggestionsForLostItem,
  dismissSuggestion,
  deleteSuggestion,
  getMySuggestions,
} = require("../controllers/suggestion.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", protect, createSuggestion);
router.get("/mine", protect, getMySuggestions);
router.get("/lost/:lostItemId", protect, getSuggestionsForLostItem);
router.patch("/:id/dismiss", protect, dismissSuggestion);

module.exports = router;
