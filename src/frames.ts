import { layoutText } from './text.js';
import { createSvgSampler } from './svg.js';
import { validatePath } from './path.js';
import { checkOptions, choice, integer, nonempty } from './validation.js';
import type { FrameOptions, GlyphFrame, Scene } from './types.js';

export interface ImageItem {
  name: string;
  color: string;
  svg: string;
  scaleModifier?: number;
}

/** Stack text/SVG nodes and pad the sequence into one shared glyph grid. */
export function prepareFrames(scenes: readonly Scene[], options: FrameOptions = {}, doc?: Document): GlyphFrame[] {
  checkOptions(options);
  if (!Array.isArray(scenes) || !scenes.length) throw new TypeError('Provide at least one scene.');
  const columns = integer(options.columns ?? 38, 'columns');
  const gap = integer(options.gap ?? 2, 'gap', 0);
  const align = choice(options.align ?? 'left', ['left', 'center', 'right'], 'alignment');
  if (options.rows !== undefined) integer(options.rows, 'rows');
  // Validate all node data before allocating canvases or composing any frame.
  for (const scene of scenes) {
    if (!scene || !Array.isArray(scene.nodes) || !scene.nodes.length) throw new TypeError('A scene needs at least one node.');
    nonempty(scene.label, 'Scene label');
    if (scene.color !== undefined) nonempty(scene.color, 'Scene color');
    for (const node of scene.nodes) {
      if (!node) throw new TypeError('Invalid content node.');
      if (node.type === 'text') layoutText(node.text, columns, { ...node, align: node.align === undefined ? align : node.align });
      else if (node.type === 'svg') {
        validatePath(node.path);
        if (node.scale !== undefined && (!Number.isFinite(node.scale) || node.scale <= 0)) {
          throw new RangeError('SVG scale must be positive and finite.');
        }
      } else throw new TypeError('Node type must be text or svg.');
    }
  }
  let sample: ReturnType<typeof createSvgSampler> | undefined;
  const blank = ' '.repeat(columns);
  const prepared = scenes.map(scene => {
    const rows: string[] = [];
    for (const [index, node] of scene.nodes.entries()) {
      if (index) rows.push(...Array(gap).fill(blank));
      if (node.type === 'text') rows.push(...layoutText(node.text, columns, { ...node, align: node.align === undefined ? align : node.align }));
      else {
        if (!sample) {
          const browserDocument = doc ?? (typeof document === 'undefined' ? undefined : document);
          if (!browserDocument?.defaultView) throw new Error('SVG preparation requires a browser document.');
          sample = createSvgSampler(browserDocument, columns);
        }
        rows.push(...sample(node.path, node.scale ?? 1));
      }
      if (rows.length > 512) throw new RangeError('A scene exceeds 512 glyph rows.');
    }
    return { rows, label: scene.label, color: scene.color ?? '#a9c8ff' };
  });
  const height = integer(options.rows ?? Math.max(...prepared.map(frame => frame.rows.length)), 'rows');
  return prepared.map(frame => {
    if (frame.rows.length > height) throw new RangeError(`Scene needs ${frame.rows.length} rows; received ${height}.`);
    return { label: frame.label, color: frame.color, ascii: [...frame.rows, ...Array(height - frame.rows.length).fill(blank)].join('\n') };
  });
}

/** Original 38 × 17 image/label preset, expressed through the shared node composer. */
export function prepareImageFrames(items: readonly ImageItem[], doc?: Document): GlyphFrame[] {
  if (!Array.isArray(items) || !items.length) throw new TypeError('Provide at least one image item.');
  return prepareFrames(items.map(item => ({
    label: item?.name,
    color: item?.color,
    nodes: [{ type: 'svg', path: item?.svg, scale: item?.scaleModifier }, { type: 'text', text: item?.name, align: 'center' }],
  })), { columns: 38, rows: 17, gap: 2 }, doc);
}
