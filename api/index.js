const express = require("express");
const axios = require("axios");
const cors = require("cors");
const archiver = require("archiver");
const app = express();
app.use(cors());

const JANDA = "https://jandapress.onrender.com";
const HEADERS = { "Referer": "https://pururin.to/", "User-Agent": "Mozilla/5.0" };

app.get("/api/galleries", async (req, res) => {
  try {
    let q = req.query.q || "new";
    const p = req.query.p || 1;
    const lang = req.query.lang || "all";
    if (lang === "en") q += " english";
    else if (lang === "jp") q += " japanese";
    const r = await axios.get(`${JANDA}/pururin/search?key=${encodeURIComponent(q)}&page=${p}`, { timeout: 15000 });
    const data = r.data.data || [];
    res.json(data.map(m => ({ id: m.id, title: m.title, lang: (m.title||"").toLowerCase().includes("english")?"EN":"JP", cover: m.cover || m.image || "" })));
  } catch(e) { res.json([]); }
});

app.get("/api/popular", async (req, res) => {
  try {
    const r = await axios.get(`${JANDA}/pururin/search?key=popular`, { timeout: 15000 });
    res.json((r.data.data || []).slice(0, 8).map(m => ({ id: m.id, title: m.title, cover: m.cover || m.image || "" })));
  } catch(e) { res.json([]); }
});

app.get("/api/info", async (req, res) => {
  try {
    const r = await axios.get(`${JANDA}/pururin/get?book=${req.query.id}`, { timeout: 15000 });
    const d = r.data.data;
    const pages = Array.isArray(d.image) ? d.image : (Array.isArray(d.cover) ? d.cover : []);
    const cover = typeof d.cover === "string" ? d.cover : (pages[0] || "");
    res.json({ id: d.id, title: d.title, cover, pages, tags: d.tags || [] });
  } catch(e) { res.status(500).json({ error: "Failed" }); }
});

app.get("/api/random", async (req, res) => {
  try {
    const keys = ["english","uncensored","schoolgirl","milf","fantasy"];
    const r = await axios.get(`${JANDA}/pururin/search?key=${keys[Math.floor(Math.random()*keys.length)]}&page=${Math.floor(Math.random()*5)+1}`, { timeout: 15000 });
    const data = r.data.data || [];
    const pick = data[Math.floor(Math.random()*data.length)];
    res.json({ id: pick.id, cover: pick.cover || pick.image || "" });
  } catch(e) { res.status(500).json({ error: "Failed" }); }
});

app.get("/api/proxy", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send("No URL");
    const r = await axios.get(url, { responseType: "stream", headers: HEADERS, timeout: 20000 });
    res.setHeader("Content-Type", r.headers["content-type"] || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=604800");
    r.data.pipe(res);
  } catch(e) { res.status(500).send("Failed"); }
});

app.get("/api/download", async (req, res) => {
  try {
    const r = await axios.get(`${JANDA}/pururin/get?book=${req.query.id}`, { timeout: 15000 });
    const d = r.data.data;
    const pages = Array.isArray(d.image) ? d.image : [];
    res.setHeader("Content-Disposition", `attachment; filename="${req.query.title || req.query.id}.zip"`);
    const archive = archiver("zip");
    archive.pipe(res);
    for (const url of pages) {
      try {
        const img = await axios.get(url, { responseType: "arraybuffer", headers: HEADERS });
        archive.append(img.data, { name: `${pages.indexOf(url)+1}.jpg` });
      } catch(e) {}
    }
    archive.finalize();
  } catch(e) { res.status(500).send("Error"); }
});

app.get("/api/tags", async (req, res) => {
  const tags = ["english","uncensored","schoolgirl","milf","fantasy","romance","netorare","yaoi","yuri","monster","elf","maid","office","sister","nurse","bikini","stockings","ahegao","futanari","harem","vanilla","cheating","femdom","bondage","tentacle","gangbang","creampie","anal","group","threesome"];
  res.json(tags.map(t => ({ name: t, url: t })));
});

module.exports = app;
