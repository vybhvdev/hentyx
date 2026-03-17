const express = require("express");
const axios = require("axios");
const app = express();

app.get("/api/galleries", async (req, res) => {
  try {
    // Adding a timeout and a specific User-Agent to prevent blocks
    const response = await axios.get("https://api.hentaios.com/v1/search?query=all&page=1&limit=24", {
      timeout: 8000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Hentyx/1.0' }
    });
    
    if (response.data && response.data.results) {
      res.json(response.data.results);
    } else {
      res.status(404).json({ error: "No results found in API" });
    }
  } catch (err) {
    console.error("API Error:", err.message);
    res.status(500).json({ error: "API Connection Failed", message: err.message });
  }
});

module.exports = app;
