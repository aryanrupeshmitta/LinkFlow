const request = require("supertest");
const app = require("../server");
const storage = require("../src/db/storage");

describe("URL Shortener API Tests", () => {
  beforeAll(async () => {
    process.env.STORAGE_ENGINE = "local";
    await storage.init();
  });

  test("POST /api/v1/shorten creates a short URL", async () => {
    const res = await request(app)
      .post("/api/v1/shorten")
      .send({
        originalUrl: "https://www.example.com/test-link",
        title: "Test Page"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("shortCode");
    expect(res.body).toHaveProperty("shortUrl");
    expect(res.body.originalUrl).toBe("https://www.example.com/test-link");
  });

  test("POST /api/v1/shorten handles custom slug and duplicate prevention", async () => {
    const slug = "my-custom-slug-" + Date.now();
    const res1 = await request(app)
      .post("/api/v1/shorten")
      .send({
        originalUrl: "https://www.google.com",
        customSlug: slug
      });

    expect(res1.statusCode).toBe(201);
    expect(res1.body.shortCode).toBe(slug);

    const res2 = await request(app)
      .post("/api/v1/shorten")
      .send({
        originalUrl: "https://www.bing.com",
        customSlug: slug
      });

    expect(res2.statusCode).toBe(400);
    expect(res2.body.error).toContain("already taken");
  });

  test("GET /api/v1/links returns list of links", async () => {
    const res = await request(app).get("/api/v1/links");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("links");
    expect(Array.isArray(res.body.links)).toBe(true);
  });

  test("POST /api/v1/bulk-shorten processes multiple URLs", async () => {
    const res = await request(app)
      .post("/api/v1/bulk-shorten")
      .send({
        items: [
          { originalUrl: "https://site1.com" },
          { originalUrl: "https://site2.com" }
        ]
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.results.length).toBe(2);
    expect(res.body.results[0].status).toBe("success");
  });

  test("GET /:shortCode redirects to original URL", async () => {
    const createRes = await request(app)
      .post("/api/v1/shorten")
      .send({ originalUrl: "https://www.wikipedia.org" });

    const code = createRes.body.shortCode;
    const redirectRes = await request(app).get(`/${code}`);

    expect(redirectRes.statusCode).toBe(302);
    expect(redirectRes.headers.location).toBe("https://www.wikipedia.org/");
  });
});
