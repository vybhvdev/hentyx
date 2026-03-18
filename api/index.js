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

    let pages = [];
    let finalCover = "";

    // If 'cover' is an array (like in your curl), those are the pages!
    if (Array.isArray(d.cover)) {
        pages = d.cover;
        finalCover = d.image || d.cover[0];
    } else {
        pages = d.reader || d.images || d.data?.images || [];
        finalCover = d.image || d.cover;
    }

    res.json({
      id: d.id || d.code || id,
      title: d.title || "Untitled",
      cover: finalCover,
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
