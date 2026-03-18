const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/api/galleries", async (req, res) => {
  try {
    const query = req.query.q || "doujinshi"; 
    
    // Attempt 3: The direct query route (removing the /search/ folder)
    const url = `https://private-consumet-api.vercel.app/manga/mangapill/${encodeURIComponent(query)}`;
    
    console.log("Fetching from:", url);
    
    const response = await axios.get(url, { timeout: 10000 });
    
    const results = response.data.results || response.data || [];
    
    const formatted = results.map(m => ({
      id: m.id,
      title: m.title,
      cover: m.image,
      thumbnail: m.image
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Mangapill Error:", err.message);
    res.status(500).json({ error: "Mangapill Error", message: err.message });
  }
});

module.exports = app;
