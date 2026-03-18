const express = require("express");
const axios = require("axios");
const cors = require("cors");
const archiver = require("archiver");
const app = express();

app.use(cors());

const JANDA_BASE = "https://jandapress.onrender.com";
const PROVIDER = "pururin";

app.get("/api/galleries", async (req, res) => {
  try {
    const q = req.query.q || "new";
    const res2 = await axios.get(`${JANDA_BASE}/${PROVIDER}/search?key=${encodeURIComponent(q)}&page=${req.query.p || 1}`);
    const results = res2.data.data || [];
    res.json(results.map(m => ({
      id: m.id || m.code,
      title: m.title,
      lang: (m.title || "").toLowerCase().includes("english") ? "EN" : "JP",
      cover: m.image || m.cover
    })));
  } catch (err) { res.status(500).json([]); }
});

app.get("/api/info", async (req, res) => {
  try {
    const res2 = await axios.get(`${JANDA_BASE}/${PROVIDER}/get?book=${req.query.id}`);
    const d = res2.data.data;
    let p = Array.isArray(d.cover) ? d.cover : (d.reader || d.images || []);
    res.json({ 
        id: d.id, 
        title: d.title, 
        cover: Array.isArray(d.cover) ? d.cover[0] : (d.image || d.cover), 
        pages: p, 
        tags: d.tags || [] 
    });
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

app.get("/api/download", async (req, res) => {
  const { id, title } = req.query;
  try {
    const info = await axios.get(`${JANDA_BASE}/${PROVIDER}/get?book=${id}`);
    const pages = Array.isArray(info.data.data.cover) ? info.data.data.cover : (info.data.data.reader || []);
    res.setHeader('Content-Disposition', `attachment; filename="${title || id}.zip"`);
    const archive = archiver('zip');
    archive.pipe(res);
    for (let i = 0; i < pages.length; i++) {
      try {
        const response = await axios.get(pages[i], { responseType: 'arraybuffer', headers: { "Referer": "https://pururin.to/" } });
        archive.append(response.data, { name: `${i + 1}.jpg` });
      } catch(e) {}
    }
    archive.finalize();
  } catch (e) { res.status(500).send("Download failed"); }
});

app.get("/api/proxy", async (req, res) => {
  try {
    const url = decodeURIComponent(req.query.url);
    const response = await axios.get(url, { 
        responseType: "arraybuffer", 
        headers: { "Referer": "https://pururin.to/" },
        timeout: 10000 
    });
    res.setHeader("Content-Type", response.headers["content-type"]);
    res.send(response.data);
  } catch (err) { res.status(500).send("Proxy failed"); }
});

module.exports = app;
