const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/api/galleries", async (req, res) => {
  console.log("Fetching from HentaiOS...");
  try {
    const response = await axios.get("https://api.hentaios.com/v1/search?query=all&page=1&limit=24", {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });
    
    res.status(200).json(response.data.results || []);
  } catch (err) {
    console.error("API ERROR:", err.message);
    res.status(500).json({ 
      error: "Failed to fetch", 
      details: err.message 
    });
  }
});

// Important for Vercel: export the app
module.exports = app;
