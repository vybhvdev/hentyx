# Hentyx - Free Hentai & Doujinshi Gallery

A fast, mobile-first web application for browsing and reading hentai doujinshi online. Built with vanilla JavaScript, Express.js, and Vercel.

## Features

- 📱 **Mobile-First Design** — Optimized for Android, iOS, and desktop
- 🔍 **Advanced Search & Filtering** — Filter by tags, language, and more
- 📖 **Online Reader** — Read doujinshi directly in browser with pagination
- 💾 **Download as ZIP** — Download full galleries for offline reading
- 🔖 **Bookmarks & History** — Save galleries and track reading history
- 🌓 **Dark/Light Mode** — Toggle between themes
- 📲 **PWA Support** — Install as standalone app on mobile
- ⚡ **Lightning Fast** — Deployed on Vercel with optimized performance
- 🏷️ **Tag-Based Discovery** — Browse by genre, language, artist, and more

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JavaScript
- **Backend:** Node.js + Express.js
- **API:** MangaDex public API + nhentai proxy
- **Database:** Supabase (bookmarks, history, authentication)
- **Auth:** NextAuth.js
- **Deployment:** Vercel
- **Analytics:** Vercel Analytics

## Pages

- `/` — Home with search and popular galleries
- `/gallery.html` — Gallery view with details, cover, and reader
- `/reader.html` — Full-screen doujinshi reader
- `/popular.html` — Trending galleries
- `/tags.html` — Browse by tag/genre
- `/bookmarks.html` — Saved galleries
- `/history.html` — Reading history
- `/about.html` — About & contact

## API Endpoints

- `GET /api/gallery/:id` — Fetch gallery metadata
- `GET /api/proxy` — Proxy image requests (CORS bypass)
- `GET /api/search` — Search galleries by query
- `GET /api/tags` — Fetch available tags

## Installation & Setup

### Local Development

```bash
# Clone repo
git clone https://github.com/vybhvdev/hentyx.git
cd hentyx

# Install dependencies
npm install

# Start dev server
npm start
Server runs on http://localhost:3000
Deploy to Vercel
npm install -g vercel
vercel
Configuration
Create a .env.local file:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXTAUTH_SECRET=your_secret
Browser Support
Chrome/Edge 90+
Firefox 88+
Safari 14+
Mobile browsers (iOS Safari, Chrome Android)
Performance
Lighthouse Score: 85+
First Contentful Paint: <1.5s
Largest Contentful Paint: <2.5s
Mobile-optimized (100% mobile traffic)
SEO
Schema.org structured data (ld+json)
Dynamic meta tags per gallery
Sitemap.xml for search engines
OG tags for social sharing
Google & Bing indexed
License
MIT
Author
@vybhvdev
Live: https://hentyx.vercel.app
