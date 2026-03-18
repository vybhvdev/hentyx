const express = require("express");
const axios = require("axios");
const cors = require("cors");
const archiver = require("archiver");
const app = express();

app.use(cors());

const JANDA_BASE = "https://jandapress.onrender.com";
const PROVIDER = "pururin";
const headers = { "Referer": "https://pururin.to/", "User-Agent": "Mozilla/5.0" };

app.get("/api/galleries", async (req, res) => {
  try {
    const q = req.query.q || "new";
    const p = req.query.p || 1;
    const res2 = await axios.get(`${JANDA_BASE}/${PROVIDER}/search?key=${encodeURIComponent(q)}&page=${p}`);
    const results = res2.data.data || [];
    res.json(results.map(m => ({
      id: m.id || m.code,
      title: m.title,
      lang: (m.title || "").toLowerCase().includes("english") ? "EN" : "JP",
      cover: m.image || m.cover
    })));
  } catch (err) { res.json([]); }
});

app.get("/api/popular", async (req, res) => {
  try {
    const res2 = await axios.get(`${JANDA_BASE}/${PROVIDER}/search?key=popular`);
    const results = (res2.data.data || []).slice(0, 8);
    res.json(results.map(m => ({
      id: m.id || m.code,
      title: m.title,
      cover: m.image || m.cover
    })));
  } catch (err) { res.json([]); }
});

app.get("/api/info", async (req, res) => {
  try {
    const res2 = await axios.get(`${JANDA_BASE}/${PROVIDER}/get?book=${req.query.id}`);
    const d = res2.data.data;
    let p = Array.isArray(d.cover) ? d.cover : (d.reader || d.images || []);
    res.json({ id: d.id, title: d.title, cover: Array.isArray(d.cover) ? d.cover[0] : (d.image || d.cover), pages: p, tags: d.tags || [] });
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

app.get("/api/random", async (req, res) => {
  try {
    const keywords = ["english", "uncensored", "schoolgirl", "milf", "fantasy"];
    const randKey = keywords[Math.floor(Math.random() * keywords.length)];
    const randPage = Math.floor(Math.random() * 5) + 1;
    const res2 = await axios.get(`${JANDA_BASE}/${PROVIDER}/search?key=${randKey}&page=${randPage}`);
    const results = res2.data.data || [];
    if (results.length === 0) return res.status(404).json({ error: "No results" });
    const pick = results[Math.floor(Math.random() * results.length)];
    res.json({ id: pick.id || pick.code, cover: pick.image || pick.cover });
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

app.get("/api/proxy", async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send("No URL");
    const response = await axios.get(targetUrl, { responseType: "arraybuffer", headers: headers, timeout: 15000 });
    res.setHeader("Content-Type", response.headers["content-type"]);
    res.send(response.data);
  } catch (err) { res.status(500).send("Proxy failed"); }
});

app.get("/api/download", async (req, res) => {
  const { id, title } = req.query;
  try {
    const info = await axios.get(`${JANDA_BASE}/${PROVIDER}/get?book=${id}`);
    const pages = Array.isArray(info.data.data.cover) ? info.data.data.cover : (info.data.data.reader || []);
    res.setHeader('Content-Disposition', `attachment; filename="${title || id}.zip"`);
    const archive = archiver('zip');
    archive.pipe(res);
    for (const url of pages) {
      try {
        const img = await axios.get(url, { responseType: 'arraybuffer', headers: headers });
        archive.append(img.data, { name: `${pages.indexOf(url)+1}.jpg` });
      } catch(e) {}
    }
    archive.finalize();
  } catch (e) { res.status(500).send("Download Error"); }
});

app.get("/api/tags", async (req, res) => {
  try {
    const keywords = ["english","uncensored","schoolgirl","milf","fantasy","romance","netorare","yaoi","yuri","monster","elf","maid","office","sister","nurse","bikini","stockings","ahegao","futanari","rape","mind break","harem","vanilla","cheating","orgy","pregnant","loli","shotacon","furry","femdom","bondage","slave","public","exhibitionism","glasses","tsundere","catgirl","demon","angel","vampire","zombie","tentacle","gangbang","creampie","blowjob","paizuri","handjob","footjob","anal","group","threesome"];
    res.json(keywords.map(t => ({ name: t, url: t })));
  } catch(err) { res.json([]); }
});

module.exports = app;
