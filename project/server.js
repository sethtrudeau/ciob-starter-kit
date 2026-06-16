/**
 * Dev server — serves template.html and proxies /api/notion to Notion.
 *
 * Usage: NOTION_TOKEN=... DATABASE_ID=... node server.js [port]
 */

import http from 'node:http';
import fs   from 'node:fs';
import { resolve, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname      = dirname(fileURLToPath(import.meta.url));
const PORT           = parseInt(process.argv[2] || process.env.PORT || '4000', 10);
const NOTION_TOKEN   = process.env.NOTION_TOKEN;
const DATABASE_ID    = process.env.DATABASE_ID;
const NOTION_VERSION = '2022-06-28';

if (!NOTION_TOKEN) throw new Error('Missing env var: NOTION_TOKEN');
if (!DATABASE_ID)  throw new Error('Missing env var: DATABASE_ID');

const MIME = {
  '.css': 'text/css',
  '.js':  'application/javascript',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.png': 'image/png',
};

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;

  // Notion API proxy — mirrors what api/notion.js does on Vercel
  if (pathname === '/api/notion') {
    try {
      const r = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sorts: [{ property: 'Order', direction: 'ascending' }],
          filter: { property: 'Published', checkbox: { equals: true } },
        }),
      });
      const body = await r.text();
      res.writeHead(r.status, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(body);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Notion proxy error: ' + err.message);
    }
    return;
  }

  // Index — serve template.html directly (picked up fresh on every request)
  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(resolve(__dirname, 'template.html')));
    return;
  }

  // Static assets (fonts, images, css) from public/
  const filePath = resolve(__dirname, 'public', pathname.slice(1));
  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => console.log(`Dev server → http://localhost:${PORT}`));
