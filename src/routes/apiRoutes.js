const express = require("express");
const router = express.Router();
const storage = require("../db/storage");
const shortenerService = require("../services/shortenerService");
const { shortenLimiter } = require("../middleware/rateLimiter");
const config = require("../config/env");

// Create Short URL
router.post(["/v1/shorten", "/shorten"], shortenLimiter, async (req, res) => {
  try {
    const { originalUrl, customSlug, title, tags, expiresAt, maxClicks, passcode, utm } = req.body;

    const result = await shortenerService.shorten({
      originalUrl,
      customSlug,
      title,
      tags,
      expiresAt,
      maxClicks,
      passcode,
      utm
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Bulk Shorten
router.post("/v1/bulk-shorten", shortenLimiter, async (req, res) => {
  try {
    const { items } = req.body;
    const results = await shortenerService.bulkShorten(items);
    res.json({ results });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List URLs with search, filter, pagination
router.get(["/v1/links", "/urls"], async (req, res) => {
  try {
    const search = req.query.search || "";
    const status = req.query.status || "all";
    const tag = req.query.tag || "";
    const limit = parseInt(req.query.limit || "50", 10);
    const offset = parseInt(req.query.offset || "0", 10);
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder || "desc";

    const { total, list } = await storage.listUrls({ search, status, tag, limit, offset, sortBy, sortOrder });

    const formattedList = list.map((item) => ({
      ...item,
      shortUrl: `${config.baseUrl}/${item.shortCode}`,
      isExpired: shortenerService.isExpired(item)
    }));

    // For legacy endpoint compatibility, if calling /api/urls return simple array
    if (req.path === "/urls") {
      return res.json(formattedList);
    }

    res.json({
      total,
      limit,
      offset,
      links: formattedList
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch links list." });
  }
});

// Get Link Details
router.get("/v1/links/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;
    const item = await storage.findByShortCode(shortCode);
    if (!item) {
      return res.status(404).json({ error: "Short URL not found." });
    }

    res.json({
      ...item,
      shortUrl: `${config.baseUrl}/${item.shortCode}`,
      isExpired: shortenerService.isExpired(item)
    });
  } catch (err) {
    res.status(500).json({ error: "Server error fetching link." });
  }
});

// Update Link
router.put("/v1/links/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { originalUrl, title, tags, isPaused, expiresAt, maxClicks, passcode } = req.body;

    const existing = await storage.findByShortCode(shortCode);
    if (!existing) {
      return res.status(404).json({ error: "Short URL not found." });
    }

    const updateData = {};
    if (originalUrl) {
      const normalized = shortenerService.normalizeUrl ? shortenerService.normalizeUrl(originalUrl) : originalUrl;
      updateData.originalUrl = normalized || originalUrl;
    }
    if (title !== undefined) updateData.title = title;
    if (tags !== undefined) updateData.tags = tags;
    if (isPaused !== undefined) updateData.isPaused = Boolean(isPaused);
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt;
    if (maxClicks !== undefined) updateData.maxClicks = maxClicks;
    if (passcode !== undefined) updateData.passcode = passcode;

    const updated = await storage.updateUrl(shortCode, updateData);
    res.json({
      ...updated,
      shortUrl: `${config.baseUrl}/${shortCode}`
    });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to update link." });
  }
});

// Delete Link
router.delete("/v1/links/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;
    const deleted = await storage.deleteUrl(shortCode);
    if (!deleted) {
      return res.status(404).json({ error: "Short URL not found or already deleted." });
    }
    res.json({ message: "Link deleted successfully.", shortCode });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete link." });
  }
});

// Get Link Analytics
router.get("/v1/links/:shortCode/analytics", async (req, res) => {
  try {
    const { shortCode } = req.params;
    const analytics = await storage.getAnalytics(shortCode);
    if (!analytics) {
      return res.status(404).json({ error: "Link analytics not found." });
    }
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analytics." });
  }
});

// QR Code Generation
router.get("/v1/links/:shortCode/qr", async (req, res) => {
  try {
    const { shortCode } = req.params;
    const format = (req.query.format || "png").toLowerCase();

    if (format === "svg") {
      const svg = await shortenerService.generateQrCode(shortCode, "svg");
      res.type("image/svg+xml").send(svg);
    } else {
      const dataUrl = await shortenerService.generateQrCode(shortCode, "png");
      res.json({ dataUrl, shortCode });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Global Platform Statistics
router.get("/v1/stats", async (req, res) => {
  try {
    const stats = await storage.getGlobalStats();
    res.json({
      ...stats,
      baseUrl: config.baseUrl,
      version: "2.0.0"
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch global stats." });
  }
});

module.exports = router;
