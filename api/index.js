const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());

const JANDA_BASE = "https://jandapress.onrender.com";
const PROVIDER = "pururin";

app.get("/api/galleries", async (req, res) => {
  try {
    const query = req.query.q || "new";
    const url = `${JANDA_BASE}/${PROVIDER}/search?key=${encodeURIComponent(query)}`;
    const response = await axios.get(url, { timeout: 15000 });
    const results = response.data.data || [];
    
    const formatted = results.map(m => {
      let lang = "JP"; 
      const title = (m.title || "").toLowerCase();
      if (title.includes("english")) lang = "EN";
      if (title.includes("chinese")) lang = "CN";
      return {
        id: m.id || m.code,
        title: m.title,
        lang: lang,
        cover: `/api/proxy?url=${encodeURIComponent(m.image || m.cover)}`
      };
    });
    res.json(formatted);
  } catch (err) { res.status(500).json({ error: "Search Failed" }); }
});

app.get("/api/info", async (req, res) => {
  try {
    const id = req.query.id;
    const url = `${JANDA_BASE}/${PROVIDER}/get?book=${encodeURIComponent(id)}`;
    const response = await axios.get(url, { timeout: 15000 });
    const d = response.data.data || response.data;

    // UNIVERSAL PAGE FINDER
    // Searches all common Jandapress fields for the image array
    const pages = d.reader || d.images || d.data?.images || d.data?.reader || [];

    res.json({
      id: d.id || d.code,
      title: d.title,
      cover: d.image || d.cover,
      tags: d.tags || d.genres || [],
      pages: pages
    });
  } catch (err) { res.status(500).json({ error: "Info Failed" }); }
});

app.get("/api/proxy", async (req, res) => {
  try {
    const response = await axios.get(req.query.url, {
      responseType: "arraybuffer",
      headers: { "Referer": `https://${PROVIDER}.to/` },
      timeout: 10000
    });
    res.setHeader("Content-Type", response.headers["content-type"]);
    res.send(response.data);
  } catch (err) { res.status(500).send("Proxy failed"); }
});

module.exports = app;
