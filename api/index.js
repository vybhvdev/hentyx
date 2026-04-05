const express = require("express");
const axios = require("axios");
const cors = require("cors");
const archiver = require("archiver");
const app = express();

app.use(cors());

const JANDA_BASE = "https://jandapress.onrender.com";
// Primary first, then backups
const PROVIDERS = [
  { name: "hentaifox", referer: "https://hentaifox.com/" },
  { name: "asmhentai", referer: "https://asmhentai.com/" },
  { name: "3hentai", referer: "http://3hentai.net/" },
  { name: "pururin", referer: "https://pururin.to/" },
  { name: "nhentai", referer: "https://nhentai.net/" },
  { name: "simply-hentai", referer: "https://simply-hentai.com/" },
  { name: "hentai2read", referer: "https://hentai2read.com/" }
];

const defaultHeaders = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" };

// Helper to try multiple providers for search
async function fetchFromProviders(searchPath, queryParams) {
  for (const provider of PROVIDERS) {
    try {
      let finalParams = queryParams;
      // hentaifox and 3hentai support sort=latest
      if ((provider.name === "hentaifox" || provider.name === "3hentai") && !finalParams.includes("sort=")) {
        finalParams += "&sort=latest";
      }
      // Ensure page is always part of the URL if not provided
      if (!finalParams.includes("page=")) {
        finalParams += "&page=1";
      }

      const url = `${JANDA_BASE}/${provider.name}/search?${finalParams}`;
      const res = await axios.get(url, { timeout: 10000 });
      if (res.data && res.data.data && res.data.data.length > 0) {
        return { data: res.data.data, provider: provider };
      }
    } catch (err) {
      console.error(`Search failed for ${provider.name}:`, err.message);
      continue;
    }
  }
  return { data: [], provider: PROVIDERS[0] };
}

// Helper to try multiple providers for gallery info
async function fetchInfoFromProviders(id) {
  for (const provider of PROVIDERS) {
    try {
      const url = `${JANDA_BASE}/${provider.name}/get?book=${id}`;
      const res = await axios.get(url, { timeout: 10000 });
      if (res.data && res.data.data) {
        return { data: res.data.data, provider: provider };
      }
    } catch (err) {
      continue;
    }
  }
  throw new Error("Gallery not found");
}

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
    let q = req.query.q || "new";
    
    const p = req.query.p || 1;
    const lang = req.query.lang || "all";
    let searchKey = q;
    if (searchKey === "new" || searchKey === "all") searchKey = "a"; // "a" is a better generic search for Hentaifox
    if (lang === "en") searchKey = searchKey + " english";
    else if (lang === "jp") searchKey = searchKey + " japanese";
    
    // Explicitly add sort=latest for hentaifox to get new content
    const { data, provider } = await fetchFromProviders("search", `key=${encodeURIComponent(searchKey)}&page=${p}&sort=latest`);
    const providerName = provider ? provider.name : "unknown";
    
    const mapped = data.map(m => ({
      id: m.id || m.code,
      title: m.title,
      lang: (m.title || "").toLowerCase().includes("english") ? "EN" : "JP",
      cover: getCover(m),
      provider: providerName
    }));

    // Fetch covers for first 3 missing ones sequentially
    let fetched = 0;
    for (let i = 0; i < mapped.length && fetched < 3; i++) {
      if (!mapped[i].cover) {
        try {
          const info = await axios.get(`${JANDA_BASE}/hentaifox/get?book=${mapped[i].id}`, { timeout: 6000 });
          mapped[i].cover = Array.isArray(info.data.data.image) ? info.data.data.image[0] : '';
          fetched++;
          if (fetched < 3) await new Promise(r => setTimeout(r, 400));
        } catch(e) {}
      }
    }
    res.json(mapped.filter(m => m.id));
  } catch (err) { res.json([]); }
});

app.get("/api/popular", async (req, res) => {
  try {
    const searchRes = await axios.get(`${JANDA_BASE}/hentaifox/search?key=popular`, { timeout: 10000 });
    const results = (searchRes.data.data || []).slice(0, 4);
    const withCovers = [];
    
    for (const m of results) {
      if (coverCache.has(m.id)) {
        withCovers.push({ id: m.id, title: m.title, cover: coverCache.get(m.id) });
        continue;
      }
      try {
        const info = await axios.get(`${JANDA_BASE}/hentaifox/get?book=${m.id}`, { timeout: 8000 });
        const d = info.data.data;
        const cover = Array.isArray(d.image) ? d.image[0] : '';
        if (cover) coverCache.set(m.id, cover);
        withCovers.push({ id: m.id, title: m.title || d.title, cover });
        await new Promise(r => setTimeout(r, 200));
      } catch(e) {
        withCovers.push({ id: m.id, title: m.title, cover: '' });
      }
    }
    res.json(withCovers);
  } catch(err) { res.json([]); }
});

app.get("/api/info", async (req, res) => {
  try {
    const { data } = await fetchInfoFromProviders(req.query.id);
    let images = Array.isArray(data.image) ? data.image : (Array.isArray(data.cover) ? data.cover : (data.reader || data.images || []));
    const thumb = typeof data.cover === 'string' ? data.cover : (Array.isArray(data.cover) ? data.cover[0] : (images[0] || ''));
    res.json({ 
      id: data.id, 
      title: data.title, 
      cover: thumb, 
      pages: images, 
      tags: data.tags || [] 
    });
  } catch (err) { res.status(500).json({ error: "Failed to find gallery" }); }
});

app.get("/api/random", async (req, res) => {
  try {
    const keywords = ["english", "uncensored", "schoolgirl", "milf", "fantasy"];
    const randKey = keywords[Math.floor(Math.random() * keywords.length)];
    const randPage = Math.floor(Math.random() * 5) + 1;
    
    const { data } = await fetchFromProviders("search", `key=${randKey}&page=${randPage}`);
    if (data.length === 0) return res.status(404).json({ error: "No results" });
    
    const pick = data[Math.floor(Math.random() * data.length)];
    res.json({ id: pick.id || pick.code, cover: pick.image || pick.cover });
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

app.get("/api/proxy", async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send("No URL");
    
    // Determine referer based on URL content
    let referer = "";
    for (const p of PROVIDERS) {
      if (targetUrl.includes(p.name)) {
        referer = p.referer;
        break;
      }
    }

    const axiosConfig = {
      responseType: "stream",
      headers: { ...defaultHeaders },
      timeout: 15000
    };
    if (referer) axiosConfig.headers["Referer"] = referer;

    try {
      const response = await axios.get(targetUrl, axiosConfig);
      res.setHeader("Content-Type", response.headers["content-type"] || "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
      response.data.pipe(res);
    } catch (err) {
      // Retry without referer if it failed (some CDNs don't like it)
      if (axiosConfig.headers["Referer"]) {
        delete axiosConfig.headers["Referer"];
        const response = await axios.get(targetUrl, axiosConfig);
        res.setHeader("Content-Type", response.headers["content-type"] || "image/jpeg");
        return response.data.pipe(res);
      }
      throw err;
    }
  } catch (err) { 
    res.status(500).send("Proxy failed"); 
  }
});

app.get("/api/download", async (req, res) => {
  const { id, title } = req.query;
  try {
    const { data, provider } = await fetchInfoFromProviders(id);
    const pages = Array.isArray(data.image) ? data.image : (Array.isArray(data.cover) ? data.cover : (data.reader || []));
    
    res.setHeader('Content-Disposition', `attachment; filename="${title || id}.zip"`);
    const archive = archiver('zip');
    archive.pipe(res);
    
    for (const url of pages) {
      try {
        const img = await axios.get(url, { 
          responseType: 'arraybuffer', 
          headers: { ...defaultHeaders, "Referer": provider.referer } 
        });
        archive.append(img.data, { name: `${pages.indexOf(url)+1}.jpg` });
      } catch(e) {}
    }
    archive.finalize();
  } catch (e) { res.status(500).send("Download Error"); }
});

const coverCache = new Map();

app.get("/api/covers", async (req, res) => {
  try {
    const ids = (req.query.ids || "").split(",").filter(Boolean).slice(0, 12);
    const results = [];
    
    for (const id of ids) {
      if (coverCache.has(id)) {
        results.push({ id, cover: coverCache.get(id) });
        continue;
      }
      
      try {
        // Sequential fetch with a short timeout and delay
        const r = await axios.get(`${JANDA_BASE}/hentaifox/get?book=${id}`, { timeout: 5000 });
        const d = r.data.data;
        const c = getCover(d);
        if (c) {
          coverCache.set(id, c);
          results.push({ id, cover: c });
        } else {
          results.push({ id, cover: "" });
        }
        // Small delay between requests to be gentle on Render/Hentaifox
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch(e) {
        results.push({ id, cover: "" });
      }
    }
    res.json(results);
  } catch(err) { res.json([]); }
});

app.get("/api/tags", async (req, res) => {
  try {
    const keywords = ["english","uncensored","schoolgirl","milf","fantasy","romance","netorare","yaoi","yuri","monster","elf","maid","office","sister","nurse","bikini","stockings","ahegao","futanari","rape","mind break","harem","vanilla","cheating","orgy","pregnant","loli","shotacon","furry","femdom","bondage","slave","public","exhibitionism","glasses","tsundere","catgirl","demon","angel","vampire","zombie","tentacle","gangbang","creampie","blowjob","paizuri","handjob","footjob","anal","group","threesome"];
    res.json(keywords.map(t => ({ name: t, url: t })));
  } catch(err) { res.json([]); }
});

module.exports = app;
