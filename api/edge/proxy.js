export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  const target = url.searchParams.get('url');
  if (!target) return new Response('No URL', { status: 400 });

  try {
    const res = await fetch(target, {
      headers: {
        'Referer': 'https://pururin.to/',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    const blob = await res.arrayBuffer();
    return new Response(blob, {
      headers: {
        'Content-Type': res.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=604800',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch(e) {
    return new Response('Failed', { status: 500 });
  }
}
