const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

const connDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`Mongo DB connected successfully : ${conn.connection.host}`);
  } catch (error) {
    console.log(`MongoDB connection error: ${error}`);
    process.exit(1);
  }
};

module.exports = connDB;
