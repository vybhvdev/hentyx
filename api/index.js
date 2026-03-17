const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/api/galleries", async (req, res) => {
  try {
    const response = await axios.get("https://api.hentaios.com/v1/search?query=all&page=1&limit=24", {
      headers: { 'User-Agent': 'Hentyx-App-Bot' }
    });
    
    if (response.data && response.data.results) {
      return res.json(response.data.results);
    }
    
    // Fallback if the API returns something weird
    res.json([{ id: "test", title: "API connected but returned no results", cover: "" }]);
    
  } catch (err) {
    res.status(500).json({ 
      error: "Backend Error", 
      message: err.message,
      tip: "Check if HentaiOS is down or blocking Vercel IPs"
    });
  }
});

module.exports = app;
