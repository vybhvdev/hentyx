const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/api/galleries", async (req, res) => {
  try {
    // Search for the 'blonde' tag on Pawoo (mastodon-style API)
    const url = "https://pawoo.net/api/v1/timelines/tag/blonde?limit=40";
    
    const response = await axios.get(url, {
      timeout: 8000
    });

    // Pawoo returns a list of 'statuses'. We filter for ones with media.
    const results = response.data
      .filter(post => post.media_attachments.length > 0)
      .map(post => ({
        id: post.id,
        title: post.account.display_name || post.account.username,
        cover: post.media_attachments[0].url,
        thumbnail: post.media_attachments[0].preview_url
      }));

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: "Pawoo API Error", message: err.message });
  }
});

module.exports = app;
