const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

const dataPath = path.join(process.cwd(), "data", "galleries.json");
const localData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

// Standardized API to return a simple array
app.get("/api/galleries", (req, res) => {
  const q = req.query.q?.toLowerCase();
  let results = localData;

  if (q) {
    results = localData.filter(g => 
      g.title.toLowerCase().includes(q) || 
      g.tags?.some(t => t.toLowerCase().includes(q))
    );
  }

  // Return the raw array directly
  res.json(results);
});

app.get("/api/gallery/:id", (req, res) => {
  const g = localData.find(x => x.id == req.params.id);
  if (g) {
    res.json(g);
  } else {
    res.status(404).json({ error: "Gallery not found" });
  }
});

module.exports = app;
