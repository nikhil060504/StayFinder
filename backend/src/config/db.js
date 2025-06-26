const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      family: 4, // Use IPv4, skip trying IPv6
    };

    const mongoURI =
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/stayfinder";
    console.log("Attempting to connect to MongoDB at:", mongoURI);

    const conn = await mongoose.connect(mongoURI, options);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection errors after initial connection
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    // Handle application termination
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed through app termination");
        process.exit(0);
      } catch (err) {
        console.error("Error during MongoDB disconnection:", err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    console.error("Full error:", error);

    // Additional error information
    if (error.name === "MongoServerSelectionError") {
      console.error("\nPossible solutions:");
      console.error("1. Make sure MongoDB is running on your system");
      console.error(
        "2. Check if MongoDB is running on the correct port (default: 27017)"
      );
      console.error("3. Verify your MongoDB connection string in .env file");
      console.error("4. Check if your firewall is blocking the connection");
    }

    process.exit(1);
  }
};

module.exports = connectDB;
