const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/api/galleries", async (req, res) => {
  try {
    // 1. Force JSON with json=1
    // 2. Added pid=0 and limit=50
    const url = "https://gelbooru.com/index.php?page=dapi&s=post&q=index&tags=rating:explicit&limit=50&json=1";
    
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 10000
    });

    // Gelbooru returns an object. We need to check if 'post' exists.
    const posts = response.data && response.data.post ? response.data.post : [];
    
    // Map data to our frontend format
    const results = posts.map(p => ({
      id: p.id,
      title: p.tags ? p.tags.split(' ').slice(0, 3).join(' ') : "Untitled",
      cover: p.file_url,
      thumbnail: p.preview_url
    }));

    res.status(200).json(results);
  } catch (err) {
    console.error("Internal Crash:", err.message);
    res.status(500).json({ error: "Backend Crash", message: err.message });
  }
});

module.exports = app;
