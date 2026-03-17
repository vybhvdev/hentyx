const express = require("express");
const axios = require("axios");
const app = express();

// Fetch list from HentaiOS
app.get("/api/galleries", async (req, res) => {
  try {
    const { data } = await axios.get("https://api.hentaios.com/v1/search?query=all&page=1&limit=24");
    res.json(data.results);
  } catch (err) {
    res.status(500).json({ error: "HentaiOS API Unreachable" });
  }
});

// Fetch specific gallery details
app.get("/api/gallery/:id", async (req, res) => {
  try {
    const { data } = await axios.get(`https://api.hentaios.com/v1/gallery/${req.params.id}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Gallery fetch failed" });
  }
});

module.exports = app;
