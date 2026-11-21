const mongoose = require("mongoose");

let connecting = null;

/**
 * Connects Mongoose once per serverless instance and hands every caller the same connection.
 * Await it before any model query: on a cold instance Mongoose would otherwise queue the query
 * until it times out, which is longer than the function is allowed to run.
 */
const connectDb = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);

  if (!connecting) {
    connecting = mongoose
      .connect(process.env.MONGODB_URI, {
        // Fail with an error the logs can show, well inside the function's time limit.
        serverSelectionTimeoutMS: 5000,
      })
      .catch((err) => {
        // Let the next request try again instead of reusing a failed attempt.
        connecting = null;
        console.error("[db] connection failed:", err);
        throw err;
      });
  }

  return connecting;
};

module.exports = connectDb;
