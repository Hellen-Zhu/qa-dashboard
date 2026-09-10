// Injects the shared <helmet> head (fonts + tokens) into every artboard source.
// src/*.dc.html  ->  artboards/*.dc.html
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const head = readFileSync(join(here, '_head.html'), 'utf8').trim();
const out = join(here, 'artboards');
mkdirSync(out, { recursive: true });

for (const f of readdirSync(join(here, 'src')).filter((n) => n.endsWith('.dc.html'))) {
  const src = readFileSync(join(here, 'src', f), 'utf8');
  if (!src.includes('<!--HEAD-->')) throw new Error(`${f}: missing <!--HEAD--> marker`);
  writeFileSync(join(out, f), src.replace('<!--HEAD-->', head));
  console.log('built', f);
}
