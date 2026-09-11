# 🔗 LinkFlow - Commercial Enterprise URL Shortener & Link Analytics Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Storage](https://img.shields.io/badge/Storage-MongoDB%20%7C%20Embedded-brightgreen.svg)]()
[![Build Status](https://img.shields.io/badge/Tests-Passing-success.svg)]()

**LinkFlow** is a market-ready, enterprise-grade, commercial URL Shortener & Link Management Platform designed for developers, teams, and enterprises. Built with high performance, security, and developer ergonomics in mind, LinkFlow features custom short link creation, instant QR code generation, passcode protection, link health diagnostics, bulk URL processing, real-time analytics, and a complete v1 REST API.

---

## ✨ Features & Highlights

### ⚡ Core Capabilities
- **Dual-Engine Storage Architecture (Zero Setup Required)**:
  - **MongoDB / Mongo Atlas**: High-scale enterprise data store.
  - **Embedded Local Storage**: Automatically falls back to embedded JSON storage (`/data/urls.json`) if MongoDB is offline or unconfigured. Run instantly with zero database setup.
- **Custom Branded Slugs / Aliases**: Create vanity short links (e.g., `linkflow.io/summer-sale`).
- **Instant QR Code Generator**: Generate and download high-resolution PNG & SVG QR codes for any short link.
- **Passcode Protection**: Protect sensitive links with password prompt screens before redirection.
- **Expiration & Click Limits**: Set automatic link expiration by timestamp or maximum click counts.
- **Bulk URL Shortener**: Process up to 50 links in a single batch request.
- **UTM Builder & Tagging**: Attach `utm_source`, `utm_medium`, `utm_campaign`, and organizational tags automatically.
- **Link Health Monitor**: Live diagnostic scanner auditing active, paused, expired, and maxed-out links.
- **Social Sharing Hub**: One-click sharing to Twitter/X, LinkedIn, WhatsApp, Facebook, Email, and Native Web Share.

### 📊 Analytics & Dashboards
- **Real-Time Click Tracking**: Interactive Chart.js timeline and traffic referrer breakdown charts.
- **Device & Geolocation Insights**: Parse User-Agent data into Desktop, Mobile, and Tablet categories.
- **Raw Access Logs**: Detailed click logs capturing timestamps, IP addresses, referrers, and User-Agent strings.

### 🎨 UI & UX Design
- **Ultra-Premium Glassmorphism Theme**: Dark glassmorphic interface with Inter typography, animated canvas mesh background, smooth micro-animations, and toast feedback.
- **Keyboard Shortcuts**: Press `Ctrl + K` (or `Cmd + K`) anywhere to immediately focus the shortener input.
- **Mobile Responsive**: Built-in tab navigation optimized for desktop, tablet, and mobile screens.

---

## 🚀 Installation & Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0 or higher recommended)
- [npm](https://www.npmjs.com/) (included with Node.js)
- *(Optional)* [MongoDB](https://www.mongodb.com/) (v4.4+) if using database storage.

### 1. Clone the Repository
```bash
git clone https://github.com/aryanrupeshmitta/LinkFlow.git
cd LinkFlow
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` (or run with defaults):
```bash
cp .env.example .env
```

Default `.env` configuration:
```env
PORT=3000
BASE_URL=http://localhost:3000
STORAGE_ENGINE=auto
MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=urlShortenerDB
API_KEY=admin-secret-key
```

### 4. Run the Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

Open your browser at:
```text
http://localhost:3000
```

---

## 🧪 Running Tests

Run the complete Jest & Supertest API integration test suite:

```bash
npm test
```

---

## 🛠️ Developer REST API Reference (v1)

LinkFlow provides a comprehensive REST API. All endpoints return JSON responses.

### 1. Create Short URL
`POST /api/v1/shorten`

**Request Body:**
```json
{
  "originalUrl": "https://example.com/promotions/summer-2026",
  "customSlug": "summer-sale",
  "title": "Summer Campaign Link",
  "passcode": "secret123",
  "expiresAt": "2026-12-31T23:59:59Z",
  "maxClicks": 500,
  "tags": ["marketing", "promo"],
  "utm": {
    "source": "newsletter",
    "medium": "email",
    "campaign": "summer_sale"
  }
}
```

### 2. Bulk Shorten URLs
`POST /api/v1/bulk-shorten`

**Request Body:**
```json
{
  "items": [
    { "originalUrl": "https://site1.com" },
    { "originalUrl": "https://site2.com" }
  ]
}
```

### 3. List & Search Links
`GET /api/v1/links?search=promo&status=active&limit=20&sortBy=clicks`

### 4. Get Single Link Details
`GET /api/v1/links/:shortCode`

### 5. Update Link
`PUT /api/v1/links/:shortCode`

### 6. Delete Link
`DELETE /api/v1/links/:shortCode`

### 7. Link Analytics Report
`GET /api/v1/links/:shortCode/analytics`

### 8. Download QR Code
`GET /api/v1/links/:shortCode/qr?format=png`

### 9. Platform Global Stats
`GET /api/v1/stats`

---

## 🐳 Docker Deployment

Run with Docker Compose:

```bash
docker-compose up -d --build
```

Access the app at `http://localhost:3000`.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

Copyright (c) 2026 **MITTA ARYAN RUPESH**. All Rights Reserved.
