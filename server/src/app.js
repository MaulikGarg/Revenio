const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { notFound, errorHandler } = require("./middleware/error.middleware");

const authRoutes = require("./routes/auth.routes");
const itemRoutes = require("./routes/item.routes");
const claimRoutes = require("./routes/claim.routes");
const reportRoutes = require("./routes/report.routes");
const adminRoutes = require("./routes/admin.routes");
const uploadRoutes = require("./routes/upload.routes");

const app = express();
// '*' for wildcard if client url doesnt load
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "API is running.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

app.use(notFound);

app.use(errorHandler);

module.exports = app;
