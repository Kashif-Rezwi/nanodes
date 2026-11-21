import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/generation.html');
});

test('SVG paths produce distinct non-empty silhouette grids', async ({ page }) => {
  const frames = await page.evaluate(async () => {
    const { prepareFrames } = await import('/dist/index.js');
    return prepareFrames([
      { label: 'Box', nodes: [{ type: 'svg', path: 'M2 2H22V22H2Z' }] },
      { label: 'Diamond', nodes: [{ type: 'svg', path: 'M12 1L23 12L12 23L1 12Z' }] },
    ]);
  });
  expect(frames.map(frame => frame.label)).toEqual(['Box', 'Diamond']);
  for (const frame of frames) {
    const rows = frame.ascii.split('\n');
    expect(rows).toHaveLength(12);
    expect(rows.every(row => row.length === 38)).toBe(true);
    expect(frame.ascii).toMatch(/[█▓▒░]/);
    expect(frame.ascii).toMatch(/^[█▓▒░ \n]+$/);
  }
  expect(frames[0].ascii).not.toBe(frames[1].ascii);
});

test('the image preset combines a silhouette and centered block caption', async ({ page }) => {
  const [frame] = await page.evaluate(async () => {
    const { prepareImageFrames } = await import('/dist/index.js');
    return prepareImageFrames([{ name: 'BOX', color: '#123456', svg: 'M2 2H22V22H2Z' }]);
  });
  const rows = frame.ascii.split('\n');
  expect(frame.label).toBe('BOX');
  expect(frame.color).toBe('#123456');
  expect(rows).toHaveLength(17);
  expect(rows.every(row => row.length === 38)).toBe(true);
  expect(rows.slice(0, 12).join('')).toMatch(/[█▓▒░]/);
  expect([rows[12], rows[13], rows[16]]).toEqual(Array(3).fill(' '.repeat(38)));
  expect(rows.slice(14, 16)).toEqual([
    (' '.repeat(13) + '█▄▄ █▀█ ▀▄▀').padEnd(38),
    (' '.repeat(13) + '█▄█ █▄█ █ █').padEnd(38),
  ]);
});
