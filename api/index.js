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
    
    // Grab the raw data from Janda
    const raw = response.data.data || response.data;

    let finalPages = [];
    let singleCover = "";

    // THE WORKAROUND: Re-mapping the fields
    if (Array.isArray(raw.cover)) {
        // If cover is the list of images (per your curl), move them to pages
        finalPages = raw.cover;
        singleCover = raw.cover[0]; // Set the first image as the cover
    } else {
        // Standard fallback for other providers
        finalPages = raw.reader || raw.images || [];
        singleCover = raw.image || raw.cover || "";
    }

    // Send the "Fixed" JSON back to the frontend
    res.json({
      id: raw.id || id,
      title: raw.title || "Untitled",
      cover: singleCover,
      pages: finalPages,
      tags: raw.tags || []
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
