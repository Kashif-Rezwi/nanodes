import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '*.spec.mjs',
  workers: 1,
  reporter: 'list',
  use: { browserName: 'chromium', baseURL: 'http://127.0.0.1:4173' },
  webServer: {
    command: 'node scripts/serve.mjs',
    url: 'http://127.0.0.1:4173/tests/generation.html',
  },
});
