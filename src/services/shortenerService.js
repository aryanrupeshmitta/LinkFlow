const crypto = require("crypto");
const QRCode = require("qrcode");
const storage = require("../db/storage");
const config = require("../config/env");

const RESERVED_SLUGS = new Set([
  "api", "admin", "dashboard", "analytics", "shorten", "bulk",
  "login", "logout", "public", "static", "assets", "favicon.ico"
]);

function generateRandomCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

function normalizeUrl(urlInput) {
  let url = String(urlInput || "").trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }
  try {
    const parsed = new URL(url);
    return parsed.href;
  } catch {
    return null;
  }
}

function buildUtmUrl(originalUrl, utmParams = {}) {
  try {
    const urlObj = new URL(originalUrl);
    if (utmParams.source) urlObj.searchParams.set("utm_source", utmParams.source);
    if (utmParams.medium) urlObj.searchParams.set("utm_medium", utmParams.medium);
    if (utmParams.campaign) urlObj.searchParams.set("utm_campaign", utmParams.campaign);
    if (utmParams.term) urlObj.searchParams.set("utm_term", utmParams.term);
    if (utmParams.content) urlObj.searchParams.set("utm_content", utmParams.content);
    return urlObj.href;
  } catch {
    return originalUrl;
  }
}

function parseUserAgent(uaString = "") {
  let device = "Desktop";
  let browser = "Other";
  let os = "Other";

  if (/mobile/i.test(uaString)) device = "Mobile";
  else if (/ipad|tablet/i.test(uaString)) device = "Tablet";

  if (/chrome|crios/i.test(uaString)) browser = "Chrome";
  else if (/firefox|fxios/i.test(uaString)) browser = "Firefox";
  else if (/safari/i.test(uaString) && !/chrome/i.test(uaString)) browser = "Safari";
  else if (/edg/i.test(uaString)) browser = "Edge";

  if (/windows/i.test(uaString)) os = "Windows";
  else if (/macintosh|mac os x/i.test(uaString)) os = "macOS";
  else if (/android/i.test(uaString)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(uaString)) os = "iOS";
  else if (/linux/i.test(uaString)) os = "Linux";

  return { device, browser, os };
}

async function scrapePageTitle(targetUrl) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(targetUrl, { signal: controller.signal, headers: { "User-Agent": "URLShortenerBot/1.0" } });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

class ShortenerService {
  async shorten({ originalUrl, customSlug, title, tags, expiresAt, maxClicks, passcode, utm }) {
    let finalUrl = normalizeUrl(originalUrl);
    if (!finalUrl) {
      throw new Error("Invalid URL format. Please provide a valid web address.");
    }

    if (utm && typeof utm === "object") {
      finalUrl = buildUtmUrl(finalUrl, utm);
    }

    let shortCode = "";
    let isCustom = false;

    if (customSlug && customSlug.trim()) {
      const slug = customSlug.trim();
      if (!/^[a-zA-Z0-9_-]{3,30}$/.test(slug)) {
        throw new Error("Custom alias must be 3-30 alphanumeric characters, hyphens or underscores.");
      }
      if (RESERVED_SLUGS.has(slug.toLowerCase())) {
        throw new Error(`Custom alias '${slug}' is reserved by the system.`);
      }

      const existing = await storage.findByShortCode(slug);
      if (existing) {
        throw new Error(`Custom alias '${slug}' is already taken. Please choose another.`);
      }
      shortCode = slug;
      isCustom = true;
    } else {
      // Check if URL already shortened without custom options
      const existing = await storage.findByOriginalUrl(finalUrl);
      if (existing && !existing.customAlias && !tags?.length && !expiresAt && !maxClicks && !passcode) {
        return {
          ...existing,
          shortUrl: `${config.baseUrl}/${existing.shortCode}`
        };
      }

      // Generate unique short code
      let attempts = 0;
      do {
        shortCode = generateRandomCode(6);
        attempts++;
        if (attempts > 10) shortCode = generateRandomCode(8);
      } while (await storage.findByShortCode(shortCode));
    }

    // Auto-fetch title if not supplied
    let pageTitle = title || "";
    if (!pageTitle) {
      const scraped = await scrapePageTitle(finalUrl);
      if (scraped) pageTitle = scraped;
      else {
        try {
          pageTitle = new URL(finalUrl).hostname;
        } catch {
          pageTitle = shortCode;
        }
      }
    }

    const doc = await storage.createUrl({
      originalUrl: finalUrl,
      shortCode,
      title: pageTitle,
      tags: Array.isArray(tags) ? tags : [],
      customAlias: isCustom,
      expiresAt: expiresAt || null,
      maxClicks: maxClicks ? parseInt(maxClicks, 10) : null,
      passcode: passcode || null,
      utm: utm || null
    });

    return {
      ...doc,
      shortUrl: `${config.baseUrl}/${shortCode}`
    };
  }

  async bulkShorten(items = []) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Batch array must contain at least one link object.");
    }

    if (items.length > 50) {
      throw new Error("Maximum 50 URLs can be processed in a single bulk request.");
    }

    const results = [];
    for (const item of items) {
      try {
        const res = await this.shorten(item);
        results.push({ status: "success", data: res });
      } catch (err) {
        results.push({ status: "error", error: err.message, originalUrl: item.originalUrl });
      }
    }
    return results;
  }

  async generateQrCode(shortCode, format = "png") {
    const item = await storage.findByShortCode(shortCode);
    if (!item) throw new Error("Short code not found.");

    const shortUrl = `${config.baseUrl}/${shortCode}`;
    if (format === "svg") {
      return await QRCode.toString(shortUrl, { type: "svg", margin: 2, width: 300 });
    }
    return await QRCode.toDataURL(shortUrl, { margin: 2, width: 300 });
  }

  isExpired(urlDoc) {
    if (!urlDoc) return true;
    if (urlDoc.expiresAt && new Date(urlDoc.expiresAt) < new Date()) {
      return true;
    }
    if (urlDoc.maxClicks && (urlDoc.clicks || 0) >= urlDoc.maxClicks) {
      return true;
    }
    return false;
  }

  verifyPasscode(urlDoc, providedPasscode) {
    if (!urlDoc.passcode) return true;
    return urlDoc.passcode === providedPasscode;
  }

  parseUserAgent(ua) {
    return parseUserAgent(ua);
  }
}

module.exports = new ShortenerService();
