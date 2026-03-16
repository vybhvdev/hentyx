const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

// Use path.join for Vercel's environment
const dataPath = path.join(process.cwd(), "data", "galleries.json");
const localData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

app.get("/api/galleries", (req, res) => {
  const q = req.query.q?.toLowerCase();
  let results = localData;
  if (q) {
    results = localData.filter(g => 
      g.title.toLowerCase().includes(q) || 
      g.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  const page = parseInt(req.query.page || "1");
  const per = 25;
  res.json({
    items: results.slice((page - 1) * per, page * per),
    totalPages: Math.ceil(results.length / per)
  });
});

app.get("/api/gallery/:id", (req, res) => {
  const g = localData.find(x => x.id == req.params.id);
  g ? res.json(g) : res.status(404).send("Not Found");
});

module.exports = app;
