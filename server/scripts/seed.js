require("dotenv").config();
const mongoose = require("mongoose");
const connDB = require("../src/config/db");
const User = require("../src/models/user.model");
const Item = require("../src/models/item.model");
const Claim = require("../src/models/claim.model");
const Report = require("../src/models/report.model");
const Suggestion = require("../src/models/suggestion.model");

const SEED_TAG = "seed-data";

const CATEGORIES = ["ID Card", "Bottle", "Electronics", "Book", "Bag", "Other"];
const LOCATIONS = [
  "Library",
  "Cafeteria",
  "Gym",
  "Main Building",
  "Parking Lot",
  "Hostel Block A",
];

// helper
async function getOrCreateUser(name, email) {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name, email, role: "student" });
  }
  return user;
}

const seed = async () => {
  await connDB();

  const loser = await getOrCreateUser("Bot Loser", "bot.loser@revenio.test");
  const founder = await getOrCreateUser(
    "Bot Founder",
    "bot.founder@revenio.test",
  );
  const claimer = await getOrCreateUser(
    "Bot Claimer",
    "bot.claimer@revenio.test",
  );

  // --- ITEMS ---
  const lostItems = [];
  const foundItems = [];

  for (let i = 0; i < 10; i++) {
    const category = CATEGORIES[i % CATEGORIES.length];
    lostItems.push({
      type: "lost",
      title: `Lost ${category} #${i + 1}`,
      description: `Seeded lost item description ${i + 1}. [${SEED_TAG}]`,
      category,
      location: LOCATIONS[i % LOCATIONS.length],
      date: new Date(Date.now() - i * 86400000),
      tags: ["test", SEED_TAG],
      postedBy: loser._id,
    });
  }

  for (let i = 0; i < 10; i++) {
    const category = CATEGORIES[i % CATEGORIES.length];
    foundItems.push({
      type: "found",
      title: `Found ${category} #${i + 1}`,
      description: `Seeded found item description ${i + 1}. [${SEED_TAG}]`,
      category,
      location: LOCATIONS[i % LOCATIONS.length],
      date: new Date(Date.now() - i * 86400000),
      claimQuestion: "What color is it?",
      tags: ["test", SEED_TAG],
      postedBy: founder._id,
    });
  }

  const insertedLost = await Item.insertMany(lostItems);
  const insertedFound = await Item.insertMany(foundItems);
  console.log(
    `Seeded ${insertedLost.length} lost items, ${insertedFound.length} found items.`,
  );

  // --- CLAIMS ---
  // claimer submits claims on a few of the found items, mixed statuses
  const claimStatuses = ["pending", "pending", "approved", "rejected"];
  const claimsToInsert = insertedFound
    .slice(0, claimStatuses.length)
    .map((item, i) => ({
      itemId: item._id,
      claimantId: claimer._id,
      answer: "It's blue with a small dent on the side.",
      message: `Seeded claim message ${i + 1}. [${SEED_TAG}]`,
      status: claimStatuses[i],
    }));

  const insertedClaims = await Claim.insertMany(claimsToInsert);
  console.log(`Seeded ${insertedClaims.length} claims.`);

  // reflect the approved claim's effect on its item (mirrors real approve logic)
  const approvedClaim = insertedClaims.find((c) => c.status === "approved");
  if (approvedClaim) {
    await Item.findByIdAndUpdate(approvedClaim.itemId, { status: "claimed" });
  }

  // --- REPORTS ---
  // claimer reports one lost item and reports founder as a user, mixed statuses
  const reportsToInsert = [
    {
      reportedBy: claimer._id,
      targetItem: insertedLost[0]._id,
      reason: `Seeded report: this listing looks like spam. [${SEED_TAG}]`,
      status: "pending",
    },
    {
      reportedBy: claimer._id,
      targetUser: founder._id,
      reason: `Seeded report: user was rude in messages. [${SEED_TAG}]`,
      status: "pending",
    },
    {
      reportedBy: loser._id,
      targetItem: insertedFound[1]._id,
      reason: `Seeded report: duplicate posting. [${SEED_TAG}]`,
      status: "reviewed",
    },
  ];

  const insertedReports = await Report.insertMany(reportsToInsert);
  console.log(`Seeded ${insertedReports.length} reports.`);

  const suggestionsToInsert = [
    {
      lostItem: insertedLost[2]._id,
      foundItem: insertedFound[2]._id,
      suggestedBy: founder._id,
      status: "pending",
    },
    {
      lostItem: insertedLost[3]._id,
      foundItem: insertedFound[3]._id,
      suggestedBy: founder._id,
      status: "dismissed",
    },
  ];

  const insertedSuggestions = await Suggestion.insertMany(suggestionsToInsert);
  console.log(`Seeded ${insertedSuggestions.length} suggestions.`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
