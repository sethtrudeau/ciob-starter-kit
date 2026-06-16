const NOTION_VERSION = '2022-06-28';

export default async function handler(req, res) {
  const { NOTION_TOKEN, DATABASE_ID } = process.env;
  if (!NOTION_TOKEN || !DATABASE_ID) {
    return res.status(500).json({ error: 'Missing NOTION_TOKEN or DATABASE_ID env vars' });
  }
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
  const data = await r.json();
  res.status(r.status).json(data);
}
