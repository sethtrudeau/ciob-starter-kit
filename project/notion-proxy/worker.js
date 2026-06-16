/**
 * Cloudflare Worker — Notion API proxy
 *
 * Adds Authorization + Notion-Version headers and CORS headers so the page
 * can call the Notion API directly from the browser.
 *
 * Deploy:
 *   1. Install Wrangler:  npm install -g wrangler
 *   2. Authenticate:      wrangler login
 *   3. Add your token:    wrangler secret put NOTION_TOKEN
 *      (paste your integration token when prompted)
 *   4. Deploy:            wrangler deploy
 *   5. Copy the Worker URL into NOTION_PROXY in index.html
 *
 * The Worker only forwards requests to api.notion.com — nothing else.
 */

const NOTION_API = 'https://api.notion.com';
const NOTION_VERSION = '2022-06-28';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const notionUrl = NOTION_API + url.pathname + url.search;

    const notionResponse = await fetch(notionUrl, {
      method: request.method,
      headers: {
        'Authorization': `Bearer ${env.NOTION_TOKEN}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: request.method !== 'GET' && request.method !== 'HEAD'
        ? request.body
        : undefined,
    });

    const body = await notionResponse.text();

    return new Response(body, {
      status: notionResponse.status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        ...CORS_HEADERS,
      },
    });
  },
};
