const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());

// The Consumet API Endpoint for Mangapill
const CONSUMET_URL = "https://private-consumet-api.vercel.app/manga/mangapill";

app.get("/api/galleries", async (req, res) => {
  try {
    // Fetching the 'trending' or 'popular' list from Mangapill
    const response = await axios.get(`${CONSUMET_URL}/filter?type=doujinshi`, {
      timeout: 10000
    });

    // Consumet usually returns results in a 'results' array
    const data = response.data.results || [];
    
    const formatted = data.map(m => ({
      id: m.id,
      title: m.title,
      cover: m.image,
      thumbnail: m.image
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Consumet Error:", err.message);
    res.status(500).json({ error: "Mangapill Source Offline", detail: err.message });
  }
});

module.exports = app;
