const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrape() {
    try {
        console.log("Connecting to E-Hentai...");
        const { data } = await axios.get('https://e-hentai.org', {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Cookie': 'nw=1' 
            }
        });
        const $ = cheerio.load(data);
        const results = [];

        // Selecting rows from the thumbnail or extended list view
        $('table.itg tr').each((i, el) => {
            const link = $(el).find('a[href*="/g/"]').first().attr('href');
            if (!link) return;

            const parts = link.split('/');
            const gid = parts[4];
            const token = parts[5];
            const title = $(el).find('.glink, .glname').text().trim() || "Untitled Gallery";
            
            // Try to find the thumbnail in multiple possible locations
            const thumb = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');

            if (gid && token && title) {
                results.push({ gid, token, title, thumb });
            }
        });

        if (results.length === 0) {
            console.log("No galleries found. Check selector.");
            return;
        }

        fs.writeFileSync('./data/galleries.json', JSON.stringify(results.slice(0, 24), null, 2));
        console.log(`Successfully scraped ${results.length} galleries!`);
    } catch (err) {
        console.error("Scrape failed:", err.message);
    }
}
scrape();
