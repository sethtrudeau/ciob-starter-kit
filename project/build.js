/**
 * Build script — copies static assets to public/.
 * Notion data is fetched client-side via /api/notion on each page load.
 *
 * Vercel runs this on each deploy.
 */

import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath }    from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out       = resolve(__dirname, 'public');

mkdirSync(out, { recursive: true });
writeFileSync(resolve(out, 'index.html'), readFileSync(resolve(__dirname, 'template.html')));

for (const dir of ['assets', 'fonts']) {
  cpSync(resolve(__dirname, dir), resolve(out, dir), { recursive: true });
}
cpSync(resolve(__dirname, 'colors_and_type.css'), resolve(out, 'colors_and_type.css'));

console.log('Built → public/');
