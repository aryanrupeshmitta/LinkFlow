const config = require("../config/env");

function requireApiKey(req, res, next) {
  // If API_KEY is set in environment or config, check header or query parameter
  const providedKey =
    req.headers["x-api-key"] ||
    req.headers["authorization"]?.replace(/^Bearer\s+/i, "") ||
    req.query.api_key;

  if (config.apiKey && providedKey !== config.apiKey) {
    return res.status(401).json({
      error: "Unauthorized: Invalid or missing API key.",
      hint: "Pass 'X-API-Key' header or '?api_key=' parameter."
    });
  }

  next();
}

module.exports = { requireApiKey };
