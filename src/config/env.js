const path = require("path");
require("dotenv").config();

const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017",
  dbName: process.env.DB_NAME || "urlShortenerDB",
  storageEngine: (process.env.STORAGE_ENGINE || "auto").toLowerCase(),
  apiKey: process.env.API_KEY || "admin-secret-key",
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  dataDir: path.join(__dirname, "../../data")
};

module.exports = config;
