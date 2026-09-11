const express = require("express");
const path = require("path");
const config = require("./src/config/env");
const storage = require("./src/db/storage");
const apiRoutes = require("./src/routes/apiRoutes");
const redirectRoutes = require("./src/routes/redirectRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Register API Routes
app.use("/api", apiRoutes);

// Register Redirect Router (Catches /:shortCode)
app.use("/", redirectRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[ServerError]", err.stack || err);
  res.status(500).json({ error: "Internal server error." });
});

async function bootstrap() {
  try {
    const engine = await storage.init();
    app.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(`🚀 URL Shortener & Link Platform is live!`);
      console.log(`🌐 Server URL: ${config.baseUrl}`);
      console.log(`💾 Storage Engine: ${engine.toUpperCase()}`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

if (require.main === module) {
  bootstrap();
}

module.exports = app;
