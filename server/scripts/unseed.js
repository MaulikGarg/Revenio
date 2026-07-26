require("dotenv").config();
const mongoose = require("mongoose");
const connDB = require("../src/config/db");
const User = require("../src/models/user.model");
const Item = require("../src/models/item.model");
const Claim = require("../src/models/claim.model");
const Report = require("../src/models/report.model");

const unseed = async () => {
  await connDB();

  // find seed users first, so we can cascade-delete their claims/reports too
  const seedUsers = await User.find({ email: /@revenio\.test$/ });
  const seedUserIds = seedUsers.map((u) => u._id);

  const itemResult = await Item.deleteMany({ tags: "seed-data" });
  console.log(`Deleted ${itemResult.deletedCount} seeded items.`);

  const claimResult = await Claim.deleteMany({
    claimantId: { $in: seedUserIds },
  });
  console.log(`Deleted ${claimResult.deletedCount} seeded claims.`);

  const reportResult = await Report.deleteMany({
    reportedBy: { $in: seedUserIds },
  });
  console.log(`Deleted ${reportResult.deletedCount} seeded reports.`);

  const userResult = await User.deleteMany({ email: /@revenio\.test$/ });
  console.log(`Deleted ${userResult.deletedCount} seed users.`);

  await mongoose.disconnect();
  process.exit(0);
};

unseed().catch((err) => {
  console.error("Unseed failed:", err);
  process.exit(1);
});
