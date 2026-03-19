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
    let q = req.query.q || "new";
    const p = req.query.p || 1;
    const lang = req.query.lang || "all";
    if (lang === "en") q = q + " english";
    else if (lang === "jp") q = q + " japanese";
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
    let p = Array.isArray(d.image) ? d.image : (Array.isArray(d.cover) ? d.cover : (d.reader || d.images || []));
    const thumb = typeof d.cover === 'string' ? d.cover : (Array.isArray(d.cover) ? d.cover[0] : (p[0] || ''));
    res.json({ id: d.id, title: d.title, cover: thumb, pages: p, tags: d.tags || [] });
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
    const response = await axios.get(targetUrl, {
      responseType: "stream",
      headers: headers,
      timeout: 20000
    });
    res.setHeader("Content-Type", response.headers["content-type"] || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
    res.setHeader("CDN-Cache-Control", "public, max-age=604800");
    response.data.pipe(res);
  } catch (err) { res.status(500).send("Proxy failed"); }
});

app.get("/api/download", async (req, res) => {
  const { id, title } = req.query;
  try {
    const info = await axios.get(`${JANDA_BASE}/${PROVIDER}/get?book=${id}`);
    const d2 = info.data.data;
    const pages = Array.isArray(d2.image) ? d2.image : (Array.isArray(d2.cover) ? d2.cover : (d2.reader || []));
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
