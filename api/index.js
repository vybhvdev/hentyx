const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/api/galleries", async (req, res) => {
  try {
    // We added &json=1 to force JSON format
    const url = "https://gelbooru.com/index.php?page=dapi&s=post&q=index&tags=rating:explicit+blonde&limit=50&json=1";
    
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    // Gelbooru returns an object with a "post" array
    const posts = response.data.post || [];
    
    // Map Gelbooru data to our Grid format
    const formatted = posts.map(p => ({
      id: p.id,
      title: p.tags.split(' ').slice(0, 3).join(' '), // Create a short title from tags
      cover: p.file_url,
      thumbnail: p.preview_url
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Gelbooru Error", details: err.message });
  }
});

module.exports = app;
