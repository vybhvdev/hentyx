const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios"); // We need axios for fetching images
const app = express();

const dataPath = path.join(process.cwd(), "data", "galleries.json");
const localData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

// --- IMAGE PROXY ROUTE ---
app.get("/api/proxy", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("No URL");
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://nhentai.net/" }
    });
    res.set("Content-Type", response.headers["content-type"]);
    res.send(response.data);
  } catch (e) {
    res.status(500).send("Proxy error");
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
