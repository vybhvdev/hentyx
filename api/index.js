const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/api/galleries", async (req, res) => {
  console.log("Initiating HentaiOS Request...");
  try {
    const response = await axios.get("https://api.hentaios.com/v1/search?query=all&page=1&limit=24", {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      timeout: 5000 // Give it 5 seconds
    });
    
    console.log("HentaiOS Response Success");
    res.status(200).json(response.data.results || []);
    
  } catch (err) {
    console.error("HentaiOS Request Failed:", err.message);
    
    // Fallback: Send empty array instead of 500 error to keep frontend alive
    res.status(200).json([
      { id: "error", title: "API Blocked - Try refreshing in a minute", cover: "" }
    ]);
  }
});

module.exports = app;
