const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());

const JANDA_BASE = "https://jandapress.onrender.com";
const PROVIDER = "pururin";

// Updated to support pagination
app.get("/api/galleries", async (req, res) => {
  try {
    const query = req.query.q || "new";
    const page = req.query.p || 1;
    // Some Jandapress providers use &page=, others use /page/
    const url = `${JANDA_BASE}/${PROVIDER}/search?key=${encodeURIComponent(query)}&page=${page}`;
    
    const response = await axios.get(url, { timeout: 15000 });
    const results = response.data.data || [];
    
    res.json(results.map(m => ({
      id: m.id || m.code,
      title: m.title,
      lang: (m.title || "").toLowerCase().includes("english") ? "EN" : "JP",
      cover: `/api/proxy?url=${encodeURIComponent(m.image || m.cover)}`
    })));
  } catch (err) { res.status(500).json({ error: "Search Failed" }); }
});

// Popular Endpoint (Fetching a specific "popular" tag or sorted results)
app.get("/api/popular", async (req, res) => {
  try {
    const url = `${JANDA_BASE}/${PROVIDER}/search?key=popular`;
    const response = await axios.get(url, { timeout: 15000 });
    const results = (response.data.data || []).slice(0, 6); // Top 6 for the mini-grid
    res.json(results.map(m => ({
      id: m.id || m.code,
      title: m.title,
      cover: `/api/proxy?url=${encodeURIComponent(m.image || m.cover)}`
    })));
  } catch (err) { res.status(500).json({ error: "Popular Failed" }); }
});

app.get("/api/random", async (req, res) => {
  try {
    const response = await axios.get(`${JANDA_BASE}/${PROVIDER}/random`, { timeout: 15000 });
    res.json({ id: response.data.data.id || response.data.data.code });
  } catch (err) { res.status(500).json({ error: "Random Failed" }); }
});

app.get("/api/info", async (req, res) => {
  try {
    const id = req.query.id;
    const response = await axios.get(`${JANDA_BASE}/${PROVIDER}/get?book=${encodeURIComponent(id)}`);
    const d = response.data.data || response.data;
    let p = Array.isArray(d.cover) ? d.cover : (Array.isArray(d.reader) ? d.reader : []);
    res.json({
      id: d.id || id,
      title: d.title,
      cover: Array.isArray(d.cover) ? d.cover[0] : (d.image || d.cover),
      pages: p,
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
