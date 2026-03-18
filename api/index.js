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
    res.json(results.map(m => ({
      id: m.id || m.code,
      title: m.title,
      lang: (m.title || "").toLowerCase().includes("english") ? "EN" : "JP",
      cover: `/api/proxy?url=${encodeURIComponent(m.image || m.cover)}`
    })));
  } catch (err) { res.status(500).json({ error: "Search Failed" }); }
});

// TRUE RANDOM ENDPOINT
app.get("/api/random", async (req, res) => {
  try {
    const response = await axios.get(`${JANDA_BASE}/${PROVIDER}/random`, { timeout: 15000 });
    const d = response.data.data;
    res.json({ id: d.id || d.code });
  } catch (err) { res.status(500).json({ error: "Random Failed" }); }
});

app.get("/api/info", async (req, res) => {
  try {
    const id = req.query.id;
    const url = `${JANDA_BASE}/${PROVIDER}/get?book=${encodeURIComponent(id)}`;
    const response = await axios.get(url, { timeout: 15000 });
    const raw = response.data.data || response.data;
    let p = Array.isArray(raw.cover) ? raw.cover : (Array.isArray(raw.reader) ? raw.reader : []);
    res.json({
      id: raw.id || id,
      title: raw.title,
      cover: Array.isArray(raw.cover) ? raw.cover[0] : (raw.image || raw.cover),
      pages: p,
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
