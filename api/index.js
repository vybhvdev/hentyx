const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const app = express();

// Use path.join with __dirname for better Vercel compatibility
const dataPath = path.join(__dirname, "..", "data", "galleries.json");

app.get("/api/galleries", (req, res) => {
  try {
    if (!fs.existsSync(dataPath)) return res.json([]);
    const localData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    res.json(localData);
  } catch (e) {
    res.status(500).json({ error: "Database Read Error" });
  }
});

app.get("/api/gallery/:gid/:token", async (req, res) => {
  const { gid, token } = req.params;
  try {
    const response = await axios.post("https://api.e-hentai.org/api.php", {
      method: "gdata",
      gidlist: [[parseInt(gid), token]],
      namespace: 1
    }, { timeout: 5000 });
    res.json(response.data.gmetadata[0]);
  } catch (err) {
    res.status(500).json({ error: "EH API Connection Failed" });
  }
});

module.exports = app;
