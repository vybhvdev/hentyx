const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());

// YOUR LIVE JANDAPRESS URL
const JANDA_BASE = "https://jandapress.onrender.com";
// PRIMARY PROVIDER
const PROVIDER = "pururin";

// 1. Search / Homepage Feed
app.get("/api/galleries", async (req, res) => {
  try {
    const query = req.query.q || "english";
    const url = `${JANDA_BASE}/${PROVIDER}/search?key=${encodeURIComponent(query)}`;
    
    const response = await axios.get(url, { timeout: 15000 });
    // Jandapress results are usually in response.data.data
    const results = response.data.data || [];
    
    const formatted = results.map(m => ({
      id: m.id,
      title: m.title,
      // Pass the cover through our proxy to bypass Hotlink protection
      cover: `/api/proxy?url=${encodeURIComponent(m.image || m.cover)}`
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Janda Search Error:", err.message);
    res.status(500).json({ error: "Search Failed" });
  }
});

// 2. Gallery Info & Reader Pages
app.get("/api/info", async (req, res) => {
  try {
    const id = req.query.id;
    const url = `${JANDA_BASE}/${PROVIDER}/get?book=${encodeURIComponent(id)}`;
    
    const response = await axios.get(url, { timeout: 15000 });
    const d = response.data.data;

    // Pururin usually puts pages in 'reader', other providers might use 'images'
    const pages = d.reader || d.images || [];

    res.json({
      id: d.id,
      title: d.title,
      cover: d.image || d.cover,
      tags: d.tags || d.genres || [],
      pages: pages
    });
  } catch (err) {
    console.error("Janda Info Error:", err.message);
    res.status(500).json({ error: "Info Failed" });
  }
});

// 3. Image Proxy (Bypassing Pururin/Hentaifox security)
app.get("/api/proxy", async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) return res.status(400).send("No URL");

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      headers: {
        "Referer": "https://pururin.to/",
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

module.exports = app;
