// ─────────────────────────────────────────────────────────────
// api/notion/page/[pageId].ts
// Vercel Edge Function — proxies Notion API requests
// Keeps NOTION_TOKEN server-side; never exposed to browser
// Deploy as: /api/notion/page/[pageId]
// ─────────────────────────────────────────────────────────────

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pageId = url.pathname.split('/').pop();

  if (!pageId) {
    return new Response(JSON.stringify({ error: 'Missing page ID' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  if (!NOTION_TOKEN) {
    return new Response(JSON.stringify({ error: 'Notion not configured' }), {
      status: 503, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Fetch all blocks for the page
    const res = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, {
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Notion API error', status: res.status }), {
        status: res.status, headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await res.json();

    // Cache for 5 minutes (content doesn't change mid-session)
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Proxy error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
