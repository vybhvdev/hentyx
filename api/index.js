const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/api/galleries", async (req, res) => {
  try {
    const query = req.query.q || "one piece"; // Changed default to something guaranteed to exist
    
    // Trying the standard Manga route which is usually more stable on this specific API instance
    const url = `https://private-consumet-api.vercel.app/manga/mangapill/search/${encodeURIComponent(query)}`;
    
    console.log("Requesting URL:", url);
    
    const response = await axios.get(url, { timeout: 10000 });
    
    // Consumet sometimes returns an array directly, or inside .results
    const results = response.data.results || response.data || [];
    
    const formatted = results.slice(0, 20).map(m => ({
      id: m.id,
      title: m.title,
      cover: m.image || m.thumbnail,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).json({ error: "Source Error", message: err.message });
  }
});

module.exports = app;
