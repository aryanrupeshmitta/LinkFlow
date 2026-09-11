const express = require("express");
const router = express.Router();
const storage = require("../db/storage");
const shortenerService = require("../services/shortenerService");
const { redirectLimiter } = require("../middleware/rateLimiter");

function renderNotFoundPage(res, message = "The requested short URL does not exist or has been deleted.") {
  return res.status(404).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>404 - Link Not Found</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #1e293b; padding: 40px; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); text-align: center; max-width: 440px; border: 1px solid #334155; }
        h1 { color: #f43f5e; margin-bottom: 12px; font-size: 28px; }
        p { color: #94a3b8; font-size: 15px; margin-bottom: 24px; line-height: 1.5; }
        a { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; transition: all 0.2s; }
        a:hover { background: #4f46e5; transform: translateY(-1px); }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Link Not Found</h1>
        <p>${message}</p>
        <a href="/">Go to Homepage</a>
      </div>
    </body>
    </html>
  `);
}

function renderPasswordPromptPage(res, shortCode, errorMessage = "") {
  return res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Protected Link</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #1e293b; padding: 40px; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); text-align: center; width: 100%; max-width: 400px; border: 1px solid #334155; }
        h2 { margin-top: 0; font-size: 24px; color: #f8fafc; }
        p { color: #94a3b8; font-size: 14px; margin-bottom: 20px; }
        input { width: 100%; padding: 12px 14px; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: #f8fafc; font-size: 15px; margin-bottom: 16px; box-sizing: border-box; }
        input:focus { outline: 2px solid #6366f1; border-color: transparent; }
        button { width: 100%; padding: 12px; border-radius: 8px; border: none; background: #6366f1; color: white; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        button:hover { background: #4f46e5; }
        .error { color: #f43f5e; font-size: 13px; margin-bottom: 12px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>Protected Link</h2>
        <p>This short link requires a passcode to access.</p>
        ${errorMessage ? `<div class="error">${errorMessage}</div>` : ""}
        <form method="POST" action="/${shortCode}">
          <input type="password" name="passcode" placeholder="Enter passcode" autofocus required />
          <button type="submit">Unlock & Continue</button>
        </form>
      </div>
    </body>
    </html>
  `);
}

router.all("/:shortCode", redirectLimiter, async (req, res) => {
  const { shortCode } = req.params;

  // Ignore standard browser asset checks if routed here
  if (shortCode === "favicon.ico" || shortCode === "robots.txt") {
    return res.status(404).end();
  }

  const item = await storage.findByShortCode(shortCode);

  if (!item) {
    return renderNotFoundPage(res, "The short link code does not exist.");
  }

  if (item.isPaused) {
    return renderNotFoundPage(res, "This link has been temporarily paused by its owner.");
  }

  if (shortenerService.isExpired(item)) {
    return renderNotFoundPage(res, "This short link has expired or reached its maximum click limit.");
  }

  // Passcode verification
  if (item.passcode) {
    const submittedPasscode = req.body?.passcode || req.query?.passcode;
    if (!submittedPasscode) {
      return renderPasswordPromptPage(res, shortCode);
    }
    if (!shortenerService.verifyPasscode(item, submittedPasscode)) {
      return renderPasswordPromptPage(res, shortCode, "Incorrect passcode. Please try again.");
    }
  }

  // Analytics logging
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";
  const referer = req.headers["referer"] || req.headers["referrer"] || "Direct";
  const userAgent = req.headers["user-agent"] || "";
  const { device, browser, os } = shortenerService.parseUserAgent(userAgent);
  const country = req.headers["cf-ipcountry"] || req.headers["x-country"] || "Local";

  await storage.recordClick(shortCode, {
    ip,
    referer,
    userAgent,
    device,
    browser,
    os,
    country
  });

  // 302 Redirect to destination URL
  return res.redirect(302, item.originalUrl);
});

module.exports = router;
