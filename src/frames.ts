import { renderTextRows } from './text.js';
import { createSvgSampler } from './svg.js';
import type { GlyphFrame } from './display.js';

export interface ImageItem {
  name: string;
  color: string;
  svg: string;
  scaleModifier?: number;
}

/** Sample an SVG path silhouette and center its block-glyph label in a 38 × 17 frame. */
export function prepareImageFrames(items: readonly ImageItem[], doc: Document = document): GlyphFrame[] {
  const sample = createSvgSampler(doc);
  return items.map((item) => {
    const label = renderTextRows(item.name).map((row) => {
      const padding = Math.max(0, 38 - row.length);
      return ' '.repeat(Math.floor(padding / 2)) + row + ' '.repeat(padding - Math.floor(padding / 2));
    });
    return {
      label: item.name,
      color: item.color,
      ascii: [...sample(item.svg, item.scaleModifier || 1), ' '.repeat(38), ' '.repeat(38), ...label, ' '.repeat(38)].join('\n'),
    };
  });
}

