import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve('.');
const types = { '.html': 'text/html', '.js': 'text/javascript' };
createServer(async (request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }
  const file = resolve(root, '.' + (pathname === '/' ? '/tests/generation.html' : pathname));
  if (!file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
  try {
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'text/plain', 'Cache-Control': 'no-store' }).end(content);
  } catch { response.writeHead(404).end('Not found'); }
}).listen(4173, '127.0.0.1');
