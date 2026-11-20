import { execFileSync } from 'node:child_process';
import { copyFile, mkdir } from 'node:fs/promises';

// Keep imported files available to the website during routine rebuilds.
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json'], { stdio: 'inherit' });
await mkdir('dist', { recursive: true });
await copyFile('src/styles.css', 'dist/styles.css');
await copyFile('examples/index.html', 'dist/example.html');
