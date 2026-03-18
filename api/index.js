const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());

const JANDA_BASE = "https://jandapress.onrender.com";
const PROVIDER = "pururin";

app.get("/api/galleries", async (req, res) => {
  try {
    const query = req.query.q || ""; // Remove "english" default
    const url = `${JANDA_BASE}/${PROVIDER}/search?key=${encodeURIComponent(query)}`;
    
    const response = await axios.get(url, { timeout: 15000 });
    const results = response.data.data || [];
    
    const formatted = results.map(m => {
      // Determine language based on title or tags
      let lang = "JP"; 
      const title = m.title.toLowerCase();
      if (title.includes("[english]") || title.includes("(english)")) lang = "EN";
      if (title.includes("[chinese]") || title.includes("(chinese)")) lang = "CN";
      
      return {
        id: m.id,
        title: m.title,
        lang: lang,
        cover: `/api/proxy?url=${encodeURIComponent(m.image || m.cover)}`
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Search Failed" });
  }
});

app.get("/api/info", async (req, res) => {
  try {
    const id = req.query.id;
    const response = await axios.get(`${JANDA_BASE}/${PROVIDER}/get?book=${encodeURIComponent(id)}`);
    const d = response.data.data;
    const pages = d.reader || d.images || [];

    res.json({
      id: d.id,
      title: d.title,
      cover: d.image || d.cover,
      tags: d.tags || d.genres || [],
      pages: pages
    });
  } catch (err) {
    res.status(500).json({ error: "Info Failed" });
  }
});

app.get("/api/proxy", async (req, res) => {
  try {
    const response = await axios.get(req.query.url, {
      responseType: "arraybuffer",
      headers: { "Referer": "https://pururin.to/" },
      timeout: 10000
    });
    res.setHeader("Content-Type", response.headers["content-type"]);
    res.send(response.data);
  } catch (err) {
    res.status(500).send("Proxy failed");
  }
});

module.exports = app;
