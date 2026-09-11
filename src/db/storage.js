const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");
const config = require("../config/env");

let activeEngine = "local-file";
let mongoClient = null;
let mongoDb = null;
let mongoUrlsCollection = null;
let mongoAnalyticsCollection = null;

// Local storage files setup
const DATA_DIR = config.dataDir;
const URLS_FILE = path.join(DATA_DIR, "urls.json");
const ANALYTICS_FILE = path.join(DATA_DIR, "analytics.json");

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function readJsonFile(filePath, defaultValue = []) {
  try {
    if (!fs.existsSync(filePath)) return defaultValue;
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return defaultValue;
  }
}

function writeJsonFile(filePath, data) {
  try {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
  }
}

class Storage {
  async init() {
    const engineConfig = (process.env.STORAGE_ENGINE || config.storageEngine || "auto").toLowerCase();
    if (engineConfig === "mongodb" || engineConfig === "auto") {
      try {
        mongoClient = new MongoClient(config.mongodbUri, {
          serverSelectionTimeoutMS: 2000
        });
        await mongoClient.connect();
        mongoDb = mongoClient.db(config.dbName);
        mongoUrlsCollection = mongoDb.collection("urls");
        mongoAnalyticsCollection = mongoDb.collection("analytics");

        await mongoUrlsCollection.createIndex({ shortCode: 1 }, { unique: true });
        await mongoUrlsCollection.createIndex({ createdAt: -1 });
        await mongoAnalyticsCollection.createIndex({ shortCode: 1 });

        activeEngine = "mongodb";
        console.log(`[Storage] Connected to MongoDB database: ${config.dbName}`);
        return activeEngine;
      } catch (err) {
        if (config.storageEngine === "mongodb") {
          console.error("[Storage] Failed to connect to MongoDB:", err.message);
          throw err;
        }
        console.warn("[Storage] Could not connect to MongoDB. Falling back to Embedded Local File Storage.");
      }
    }

    ensureDir(DATA_DIR);
    if (!fs.existsSync(URLS_FILE)) writeJsonFile(URLS_FILE, []);
    if (!fs.existsSync(ANALYTICS_FILE)) writeJsonFile(ANALYTICS_FILE, []);
    activeEngine = "local-file";
    console.log(`[Storage] Operating on Embedded Storage: ${DATA_DIR}`);
    return activeEngine;
  }

  getEngine() {
    return activeEngine;
  }

  async createUrl(doc) {
    const record = {
      title: doc.title || "",
      originalUrl: doc.originalUrl,
      shortCode: doc.shortCode,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: doc.updatedAt || new Date().toISOString(),
      clicks: doc.clicks || 0,
      tags: doc.tags || [],
      customAlias: Boolean(doc.customAlias),
      expiresAt: doc.expiresAt || null,
      maxClicks: doc.maxClicks ? parseInt(doc.maxClicks, 10) : null,
      passcode: doc.passcode || null,
      isPaused: Boolean(doc.isPaused),
      utm: doc.utm || null
    };

    if (activeEngine === "mongodb") {
      await mongoUrlsCollection.insertOne(record);
      return record;
    } else {
      const urls = readJsonFile(URLS_FILE, []);
      urls.unshift(record);
      writeJsonFile(URLS_FILE, urls);
      return record;
    }
  }

  async findByShortCode(shortCode) {
    if (activeEngine === "mongodb") {
      return await mongoUrlsCollection.findOne({ shortCode });
    } else {
      const urls = readJsonFile(URLS_FILE, []);
      return urls.find((u) => u.shortCode === shortCode) || null;
    }
  }

  async findByOriginalUrl(originalUrl) {
    if (activeEngine === "mongodb") {
      return await mongoUrlsCollection.findOne({ originalUrl });
    } else {
      const urls = readJsonFile(URLS_FILE, []);
      return urls.find((u) => u.originalUrl === originalUrl) || null;
    }
  }

  async listUrls({ search = "", status = "all", tag = "", limit = 50, offset = 0, sortBy = "createdAt", sortOrder = "desc" } = {}) {
    let list = [];
    let total = 0;

    if (activeEngine === "mongodb") {
      const filter = {};
      if (search) {
        filter.$or = [
          { originalUrl: { $regex: search, $options: "i" } },
          { shortCode: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } }
        ];
      }
      if (tag) {
        filter.tags = tag;
      }
      if (status === "paused") filter.isPaused = true;
      if (status === "active") filter.isPaused = { $ne: true };

      total = await mongoUrlsCollection.countDocuments(filter);
      const sortObj = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

      list = await mongoUrlsCollection
        .find(filter)
        .sort(sortObj)
        .skip(offset)
        .limit(limit)
        .toArray();
    } else {
      let urls = readJsonFile(URLS_FILE, []);

      if (search) {
        const query = search.toLowerCase();
        urls = urls.filter(
          (u) =>
            (u.originalUrl && u.originalUrl.toLowerCase().includes(query)) ||
            (u.shortCode && u.shortCode.toLowerCase().includes(query)) ||
            (u.title && u.title.toLowerCase().includes(query))
        );
      }

      if (tag) {
        urls = urls.filter((u) => Array.isArray(u.tags) && u.tags.includes(tag));
      }

      if (status === "paused") {
        urls = urls.filter((u) => u.isPaused);
      } else if (status === "active") {
        urls = urls.filter((u) => !u.isPaused);
      } else if (status === "expired") {
        const now = new Date();
        urls = urls.filter(
          (u) =>
            (u.expiresAt && new Date(u.expiresAt) < now) ||
            (u.maxClicks && u.clicks >= u.maxClicks)
        );
      }

      urls.sort((a, b) => {
        let valA = a[sortBy] || "";
        let valB = b[sortBy] || "";
        if (sortBy === "createdAt" || sortBy === "updatedAt") {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }
        if (sortOrder === "asc") return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });

      total = urls.length;
      list = urls.slice(offset, offset + limit);
    }

    return { total, list };
  }

  async updateUrl(shortCode, updateData) {
    const fieldsToUpdate = {
      updatedAt: new Date().toISOString()
    };

    if (updateData.originalUrl !== undefined) fieldsToUpdate.originalUrl = updateData.originalUrl;
    if (updateData.title !== undefined) fieldsToUpdate.title = updateData.title;
    if (updateData.tags !== undefined) fieldsToUpdate.tags = updateData.tags;
    if (updateData.isPaused !== undefined) fieldsToUpdate.isPaused = Boolean(updateData.isPaused);
    if (updateData.expiresAt !== undefined) fieldsToUpdate.expiresAt = updateData.expiresAt;
    if (updateData.maxClicks !== undefined) fieldsToUpdate.maxClicks = updateData.maxClicks;
    if (updateData.passcode !== undefined) fieldsToUpdate.passcode = updateData.passcode;

    if (activeEngine === "mongodb") {
      const res = await mongoUrlsCollection.findOneAndUpdate(
        { shortCode },
        { $set: fieldsToUpdate },
        { returnDocument: "after" }
      );
      return res;
    } else {
      const urls = readJsonFile(URLS_FILE, []);
      const index = urls.findIndex((u) => u.shortCode === shortCode);
      if (index === -1) return null;
      urls[index] = { ...urls[index], ...fieldsToUpdate };
      writeJsonFile(URLS_FILE, urls);
      return urls[index];
    }
  }

  async deleteUrl(shortCode) {
    if (activeEngine === "mongodb") {
      const res = await mongoUrlsCollection.deleteOne({ shortCode });
      await mongoAnalyticsCollection.deleteMany({ shortCode });
      return res.deletedCount > 0;
    } else {
      const urls = readJsonFile(URLS_FILE, []);
      const filtered = urls.filter((u) => u.shortCode !== shortCode);
      const deleted = urls.length !== filtered.length;
      writeJsonFile(URLS_FILE, filtered);

      const analytics = readJsonFile(ANALYTICS_FILE, []);
      const filteredAnalytics = analytics.filter((a) => a.shortCode !== shortCode);
      writeJsonFile(ANALYTICS_FILE, filteredAnalytics);

      return deleted;
    }
  }

  async recordClick(shortCode, clickDetails = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      shortCode,
      timestamp,
      ip: clickDetails.ip || "127.0.0.1",
      referer: clickDetails.referer || "Direct",
      userAgent: clickDetails.userAgent || "Unknown",
      device: clickDetails.device || "Desktop",
      browser: clickDetails.browser || "Unknown",
      os: clickDetails.os || "Unknown",
      country: clickDetails.country || "Local"
    };

    if (activeEngine === "mongodb") {
      await mongoUrlsCollection.updateOne(
        { shortCode },
        { $inc: { clicks: 1 }, $set: { lastClickedAt: timestamp } }
      );
      await mongoAnalyticsCollection.insertOne(logEntry);
    } else {
      const urls = readJsonFile(URLS_FILE, []);
      const urlItem = urls.find((u) => u.shortCode === shortCode);
      if (urlItem) {
        urlItem.clicks = (urlItem.clicks || 0) + 1;
        urlItem.lastClickedAt = timestamp;
        writeJsonFile(URLS_FILE, urls);
      }

      const analytics = readJsonFile(ANALYTICS_FILE, []);
      analytics.unshift(logEntry);
      // Keep recent 5000 logs per storage instance
      if (analytics.length > 5000) analytics.pop();
      writeJsonFile(ANALYTICS_FILE, analytics);
    }

    return logEntry;
  }

  async getAnalytics(shortCode) {
    let logs = [];
    let urlItem = await this.findByShortCode(shortCode);

    if (!urlItem) return null;

    if (activeEngine === "mongodb") {
      logs = await mongoAnalyticsCollection
        .find({ shortCode })
        .sort({ timestamp: -1 })
        .limit(500)
        .toArray();
    } else {
      const allLogs = readJsonFile(ANALYTICS_FILE, []);
      logs = allLogs.filter((a) => a.shortCode === shortCode).slice(0, 500);
    }

    // Aggregate breakdowns
    const referrers = {};
    const devices = {};
    const browsers = {};
    const countries = {};
    const timeline = {}; // YYYY-MM-DD count

    logs.forEach((log) => {
      // Referrer domain parsing
      let ref = log.referer || "Direct";
      if (ref !== "Direct") {
        try {
          ref = new URL(ref).hostname;
        } catch {
          ref = log.referer;
        }
      }
      referrers[ref] = (referrers[ref] || 0) + 1;

      const dev = log.device || "Desktop";
      devices[dev] = (devices[dev] || 0) + 1;

      const br = log.browser || "Other";
      browsers[br] = (browsers[br] || 0) + 1;

      const cty = log.country || "Unknown";
      countries[cty] = (countries[cty] || 0) + 1;

      const dateStr = log.timestamp ? log.timestamp.split("T")[0] : "Unknown";
      timeline[dateStr] = (timeline[dateStr] || 0) + 1;
    });

    return {
      url: urlItem,
      totalClicks: urlItem.clicks || 0,
      logsCount: logs.length,
      referrers,
      devices,
      browsers,
      countries,
      timeline,
      recentLogs: logs.slice(0, 50)
    };
  }

  async getGlobalStats() {
    if (activeEngine === "mongodb") {
      const totalUrls = await mongoUrlsCollection.countDocuments({});
      const pipeline = [{ $group: { _id: null, totalClicks: { $sum: "$clicks" } } }];
      const agg = await mongoUrlsCollection.aggregate(pipeline).toArray();
      const totalClicks = agg.length > 0 ? agg[0].totalClicks : 0;
      return { totalUrls, totalClicks, storageEngine: activeEngine };
    } else {
      const urls = readJsonFile(URLS_FILE, []);
      const totalUrls = urls.length;
      const totalClicks = urls.reduce((sum, u) => sum + (u.clicks || 0), 0);
      return { totalUrls, totalClicks, storageEngine: activeEngine };
    }
  }
}

const storageInstance = new Storage();
module.exports = storageInstance;
