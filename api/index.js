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
    
    const formatted = results.map(m => ({
      id: m.id || m.code,
      title: m.title,
      lang: (m.title || "").toLowerCase().includes("english") ? "EN" : "JP",
      cover: `/api/proxy?url=${encodeURIComponent(m.image || m.cover)}`
    }));
    res.json(formatted);
  } catch (err) { res.status(500).json({ error: "Search Failed" }); }
});

app.get("/api/info", async (req, res) => {
  try {
    const id = req.query.id;
    const url = `${JANDA_BASE}/${PROVIDER}/get?book=${encodeURIComponent(id)}`;
    const response = await axios.get(url, { timeout: 15000 });
    const d = response.data.data || response.data;

    let pages = [];
    
    // THE EASY FIX: If cover is an array (per your curl), it's actually the pages.
    if (Array.isArray(d.cover)) {
        pages = d.cover;
    } else if (Array.isArray(d.reader)) {
        pages = d.reader;
    } else if (Array.isArray(d.images)) {
        pages = d.images;
    }

    res.json({
      id: d.id || id,
      title: d.title || "Untitled",
      // Set cover to the first page URL since 'cover' is being used for the array
      cover: pages.length > 0 ? pages[0] : (d.image || ""),
      pages: pages,
      tags: d.tags || []
    });
  } catch (err) { res.status(500).json({ error: "Info Failed" }); }
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
  } catch (err) { res.status(500).send("Proxy failed"); }
});

module.exports = app;
