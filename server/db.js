const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/interview";

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log("======================================");
    console.log(` MongoDB Connected Successfully`);
    console.log(` Host: ${conn.connection.host}`);
    console.log(` Database: ${conn.connection.name}`);
    console.log("======================================");
  } catch (error) {
    isConnected = false;
    console.error("❌ MongoDB Connection Error:", error.message);
    console.log("⚠️  Server will continue running in fallback mode.");
  }
}

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.log("⚠️ MongoDB Disconnected");
});

mongoose.connection.on("reconnected", () => {
  isConnected = true;
  console.log("🔄 MongoDB Reconnected");
});

function getDBStatus() {
  return {
    connected: isConnected,
    state: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    database: mongoose.connection.name || "interview",
    host: mongoose.connection.host || "127.0.0.1",
  };
}

module.exports = { connectDB, getDBStatus };
