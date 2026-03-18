const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());

const CONSUMET_URL = "https://private-consumet-api.vercel.app/meta/nhentai";

// 1. Image Proxy (Now bypassing nhentai.net)
app.get("/api/proxy", async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) return res.status(400).send("No URL");

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      headers: {
        "Referer": "https://nhentai.net/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      },
      timeout: 10000
    });

    res.setHeader("Content-Type", response.headers["content-type"]);
    res.send(response.data);
  } catch (err) {
    res.status(500).send("Proxy failed");
  }
});

// 2. Search / Homepage Feed
app.get("/api/galleries", async (req, res) => {
  try {
    const query = req.query.q || "english"; // Default to English doujins
    const url = `${CONSUMET_URL}/${encodeURIComponent(query)}`;
    
    const response = await axios.get(url, { timeout: 10000 });
    const results = response.data.results || response.data || [];
    
    const formatted = results.map(m => {
      // nhentai titles are often objects { english, native, romaji }
      const titleStr = m.title.english || m.title.romaji || m.title || "Untitled";
      return {
        id: m.id,
        title: titleStr,
        cover: `/api/proxy?url=${encodeURIComponent(m.image || m.cover)}`
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("nhentai Search Error:", err.message);
    res.status(500).json({ error: "API Error" });
  }
});

// 3. Gallery Info & Pages
app.get("/api/info", async (req, res) => {
  try {
    const id = req.query.id;
    const url = `${CONSUMET_URL}/info/${id}`;
    
    const response = await axios.get(url, { timeout: 10000 });
    const data = response.data;

    // Consumet returns pages in different spots depending on the provider
    let pages = [];
    if (data.pages) pages = data.pages;
    else if (data.chapters && data.chapters.length > 0 && data.chapters[0].pages) pages = data.chapters[0].pages;

    res.json({
      id: data.id,
      title: data.title.english || data.title.romaji || data.title || "Untitled",
      cover: data.image || data.cover,
      tags: data.tags || data.genres || [],
      pages: pages
    });
  } catch (err) {
    console.error("nhentai Info Error:", err.message);
    res.status(500).json({ error: "Info Error" });
  }
});

module.exports = app;
