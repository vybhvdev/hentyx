const express = require("express");
const axios = require("axios");
const cors = require("cors");
const archiver = require("archiver");
const app = express();

app.use(cors());

const JANDA_BASE = "https://janda.ezee.li";
const PROVIDER = "pururin";
const REFERER = "https://pururin.to/";

const defaultHeaders = { 
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" 
};

function getCover(m) {
  if (!m) return "";
  if (typeof m.cover === 'string' && m.cover) return m.cover;
  if (typeof m.image === 'string' && m.image) return m.image;
  if (Array.isArray(m.image) && m.image.length > 0) return m.image[0];
  if (Array.isArray(m.cover) && m.cover.length > 0) return m.cover[0];
  const imgs = m.reader || m.images || m.pages || [];
  return imgs[0] || "";
}

app.get("/api/galleries", async (req, res) => {
  try {
    const q = req.query.q || "new";
    const p = req.query.p || 1;
    const lang = req.query.lang || "all";
    
    let searchKey = q;
    if (searchKey === "new" || searchKey === "all") searchKey = "a";
    if (lang === "en") searchKey += " english";
    else if (lang === "jp") searchKey += " japanese";

    const url = `${JANDA_BASE}/${PROVIDER}/search?key=${encodeURIComponent(searchKey)}&page=${p}`;
    const response = await axios.get(url, { timeout: 10000 });
    const data = response.data.data || [];

    const mapped = data.map(m => ({
      id: m.id || m.code,
      title: m.title,
      cover: getCover(m),
      lang: (m.title || "").toLowerCase().includes("english") ? "EN" : "JP"
    }));

    res.json(mapped);
  } catch (err) {
    res.json([]);
  }
});

app.get("/api/popular", async (req, res) => {
  try {
    const url = `${JANDA_BASE}/${PROVIDER}/search?key=popular`;
    const response = await axios.get(url, { timeout: 10000 });
    const data = (response.data.data || []).slice(0, 10);

    const mapped = data.map(m => ({
      id: m.id || m.code,
      title: m.title,
      cover: getCover(m)
    }));

    res.json(mapped);
  } catch (err) {
    res.json([]);
  }
});

app.get("/api/info", async (req, res) => {
  try {
    const id = req.query.id;
    const url = `${JANDA_BASE}/${PROVIDER}/get?book=${id}`;
    const response = await axios.get(url, { timeout: 10000 });
    const data = response.data.data;

    let images = Array.isArray(data.image) ? data.image : (Array.isArray(data.cover) ? data.cover : (data.reader || data.images || []));
    const thumb = typeof data.cover === 'string' ? data.cover : (Array.isArray(data.cover) ? data.cover[0] : (images[0] || ''));

    res.json({
      id: data.id,
      title: data.title,
      cover: thumb,
      pages: images,
      tags: data.tags || []
    });
  } catch (err) {
    res.status(500).json({ error: "Gallery not found" });
  }
});

app.get("/api/random", async (req, res) => {
  try {
    const url = `${JANDA_BASE}/${PROVIDER}/random`;
    const response = await axios.get(url, { timeout: 10000 });
    const data = response.data.data;
    res.json({ id: data.id, cover: getCover(data) });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

app.get("/api/proxy", async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send("No URL");

    const response = await axios.get(targetUrl, {
      responseType: "stream",
      headers: { ...defaultHeaders, "Referer": REFERER },
      timeout: 15000
    });

    res.setHeader("Content-Type", response.headers["content-type"] || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=604800");
    response.data.pipe(res);
  } catch (err) {
    res.status(500).send("Proxy failed");
  }
});

app.get("/api/download", async (req, res) => {
  try {
    const { id, title } = req.query;
    const infoUrl = `${JANDA_BASE}/${PROVIDER}/get?book=${id}`;
    const infoResponse = await axios.get(infoUrl, { timeout: 10000 });
    const data = infoResponse.data.data;
    const images = Array.isArray(data.image) ? data.image : (Array.isArray(data.cover) ? data.cover : (data.reader || []));

    res.setHeader('Content-Disposition', `attachment; filename="${title || id}.zip"`);
    const archive = archiver('zip');
    archive.pipe(res);

    for (const url of images) {
      try {
        const img = await axios.get(url, {
          responseType: 'arraybuffer',
          headers: { ...defaultHeaders, "Referer": REFERER }
        });
        archive.append(img.data, { name: `${images.indexOf(url) + 1}.jpg` });
      } catch (e) {}
    }
    archive.finalize();
  } catch (e) {
    res.status(500).send("Download Error");
  }
});

app.get("/api/covers", async (req, res) => {
  try {
    const ids = (req.query.ids || "").split(",").filter(Boolean).slice(0, 12);
    const results = await Promise.all(ids.map(async id => {
      try {
        const r = await axios.get(`${JANDA_BASE}/${PROVIDER}/get?book=${id}`, { timeout: 5000 });
        return { id, cover: getCover(r.data.data) };
      } catch (e) {
        return { id, cover: "" };
      }
    }));
    res.json(results);
  } catch (err) {
    res.json([]);
  }
});

app.get("/api/tags", async (req, res) => {
  const keywords = ["english","uncensored","schoolgirl","milf","fantasy","romance","netorare","yaoi","yuri","monster","elf","maid","office","sister","nurse","bikini","stockings","ahegao","futanari","rape","mind break","harem","vanilla","cheating","orgy","pregnant","loli","shotacon","furry","femdom","bondage","slave","public","exhibitionism","glasses","tsundere","catgirl","demon","angel","vampire","zombie","tentacle","gangbang","creampie","blowjob","paizuri","handjob","footjob","anal","group","threesome"];
  res.json(keywords.map(t => ({ name: t, url: t })));
});

module.exports = app;
