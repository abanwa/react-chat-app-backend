const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("Connected to DB");
    });

    connection.on("error", (error) => {
      console.log(`Something went wrong with MongoDB connection ${error}`);
    });
  } catch (err) {
    console.log(`Something is wrong ${err.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
