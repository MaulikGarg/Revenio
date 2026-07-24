require("dotenv").config();

const app = require("./src/app");
const connDB = require("./src/config/db");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
