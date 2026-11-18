import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json'], { stdio: 'inherit' });
await mkdir('dist', { recursive: true });
await copyFile('src/styles.css', 'dist/styles.css');

const { prepareTextFrame } = await import('../dist/text.js');
await copyFile('examples/index.html', 'dist/example.html');

await writeFile('dist/hero.html', '<!doctype html><html><meta charset="utf-8"><link rel="stylesheet" href="/tests/fixture.css"><link rel="stylesheet" href="/dist/styles.css"><body><div class="nanodes-text"><pre class="nanodes-text-art" aria-hidden="true">' + prepareTextFrame('FULL STACK ENGINEER') + '</pre></div></body></html>');
