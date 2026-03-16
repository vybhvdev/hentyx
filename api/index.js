const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

const dataPath = path.join(process.cwd(), "data", "galleries.json");
const localData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

app.get("/api/proxy", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("No URL");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
        "Referer": "https://nhentai.net/",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    if (!response.ok) throw new Error("Remote blocked request");

    const contentType = response.headers.get("content-type");
    const buffer = Buffer.from(await response.arrayBuffer());

    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
    res.send(buffer);
  } catch (e) {
    console.error(e);
    res.status(500).send("Proxy error: " + e.message);
  }
});

app.get("/api/galleries", (req, res) => {
  const q = req.query.q?.toLowerCase();
  let results = localData;
  if (q) results = localData.filter(g => g.title.toLowerCase().includes(q) || g.tags.some(t => t.toLowerCase().includes(q)));
  const page = parseInt(req.query.page || "1"), per = 25;
  res.json({ items: results.slice((page - 1) * per, page * per), totalPages: Math.ceil(results.length / per) });
});

app.get("/api/gallery/:id", (req, res) => {
  const g = localData.find(x => x.id == req.params.id);
  g ? res.json(g) : res.status(404).send("Not Found");
});

module.exports = app;
