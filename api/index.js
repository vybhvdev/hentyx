const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());

// 1. The Image Proxy (The "Mangyx" Secret)
app.get("/api/proxy", async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) return res.status(400).send("No URL provided");

    // Fetch the image from Mangapill, pretending to BE Mangapill
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer", // Tell axios we want raw image data
      headers: {
        "Referer": "https://mangapill.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      },
      timeout: 10000
    });

    // Send the raw image back to our grid
    res.setHeader("Content-Type", response.headers["content-type"]);
    res.send(response.data);
  } catch (err) {
    console.error("Proxy Error:", err.message);
    res.status(500).send("Failed to load image");
  }
});

// 2. The Mangapill Search API
app.get("/api/galleries", async (req, res) => {
  try {
    const query = req.query.q || "doujinshi"; 
    
    // The exact route your Mangyx site uses
    const url = `https://private-consumet-api.vercel.app/manga/mangapill/${encodeURIComponent(query)}`;
    
    const response = await axios.get(url, { timeout: 10000 });
    const results = response.data.results || response.data || [];
    
    const formatted = results.map(m => ({
      id: m.id,
      title: m.title,
      // Pass the image URL through our new proxy!
      cover: `/api/proxy?url=${encodeURIComponent(m.image)}`
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Mangapill Error:", err.message);
    res.status(500).json({ error: "Mangapill Error", message: err.message });
  }
});

module.exports = app;
