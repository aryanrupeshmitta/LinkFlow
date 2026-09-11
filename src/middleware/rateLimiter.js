const rateLimit = require("express-rate-limit");
const config = require("../config/env");

const shortenLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs, // default 15 mins
  max: config.rateLimitMax, // default 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many URL shortening requests from this IP. Please try again later."
  }
});

const redirectLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 clicks per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: "Rate limit exceeded for URL redirection."
});

module.exports = { shortenLimiter, redirectLimiter };
