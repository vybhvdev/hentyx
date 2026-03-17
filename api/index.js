const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const app = express();

const dataPath = path.join(process.cwd(), "data", "galleries.json");
const localData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

// Home API: Returns the EH list
app.get("/api/galleries", (res) => {
  res.json(localData);
});

// Single Gallery API: Fetches fresh data from EH if needed
app.get("/api/gallery/:gid/:token", async (req, res) => {
  const { gid, token } = req.params;
  try {
    const response = await axios.post("https://api.e-hentai.org/api.php", {
      method: "gdata",
      gidlist: [[parseInt(gid), token]],
      namespace: 1
    });
    res.json(response.data.gmetadata[0]);
  } catch (err) {
    res.status(500).json({ error: "EH API Blocked or Down" });
  }
});

module.exports = app;
