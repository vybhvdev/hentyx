const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/api/galleries", async (req, res) => {
  try {
    // Grab the search query from the frontend, or default to "doujinshi"
    const searchQuery = req.query.q || "doujinshi";
    
    // Consumet's standard route for searching Mangapill
    const url = `https://private-consumet-api.vercel.app/meta/mangapill/${encodeURIComponent(searchQuery)}`;
    
    const response = await axios.get(url, { timeout: 10000 });
    const data = response.data.results || [];
    
    const formatted = data.map(m => ({
      id: m.id,
      title: m.title,
      cover: m.image,
      thumbnail: m.image
    }));

    res.json(formatted);
  } catch (err) {
    console.error("API Error:", err.message);
    res.status(500).json({ error: "API Offline", message: err.message });
  }
});

module.exports = app;
