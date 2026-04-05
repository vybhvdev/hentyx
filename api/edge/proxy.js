export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  const target = url.searchParams.get('url');
  if (!target) return new Response('No URL', { status: 400 });

  // Dynamically determine Referer based on target URL
  let referer = 'https://google.com/';
  const domains = [
    { name: 'hentaifox.com', referer: 'https://hentaifox.com/' },
    { name: 'asmhentai.com', referer: 'https://asmhentai.com/' },
    { name: '3hentai.net', referer: 'http://3hentai.net/' },
    { name: 'pururin.to', referer: 'https://pururin.to/' },
    { name: 'nhentai.net', referer: 'https://nhentai.net/' },
    { name: 'simply-hentai.com', referer: 'https://simply-hentai.com/' },
    { name: 'hentai2read.com', referer: 'https://hentai2read.com/' }
  ];

  for (const d of domains) {
    if (target.includes(d.name)) {
      referer = d.referer;
      break;
    }
  }

  try {
    const res = await fetch(target, {
      headers: {
        'Referer': referer,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) throw new Error('Proxy failed');

    const blob = await res.arrayBuffer();
    return new Response(blob, {
      headers: {
        'Content-Type': res.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch(e) {
    return new Response('Failed to proxy: ' + e.message, { status: 500 });
  }
}
