import { validatePath } from './path.js';
import { integer } from './validation.js';

/** Prepare SVG silhouettes with the portfolio's original 8× supersampling. */
export function createSvgSampler(doc: Document, columns = 38) {
  const COLS = integer(columns, 'columns');
  const ICON_ROWS = 12;
  const boundsCanvas = doc.createElement('canvas');
  boundsCanvas.width = 240;
  boundsCanvas.height = 240;
  const boundsCtx = context(boundsCanvas);

  const SUPERSAMPLE = 8;
  const hiresW = COLS * SUPERSAMPLE;
  const hiresH = ICON_ROWS * SUPERSAMPLE; // 96 px
  const rasterCanvas = doc.createElement('canvas');
  rasterCanvas.width = hiresW;
  rasterCanvas.height = hiresH;
  const rasterCtx = context(rasterCanvas);
  const browserPath = doc.defaultView?.Path2D;
  if (!browserPath) throw new Error('SVG preparation requires Path2D support.');
  const Path = browserPath;

  function context(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('SVG preparation requires Canvas 2D support.');
    return ctx;
  }

  // Measure in the original 24-unit coordinate space.
  function getPathBounds(path: Path2D) {
    boundsCtx.clearRect(0, 0, 240, 240);
    boundsCtx.save();
    boundsCtx.scale(10, 10);
    boundsCtx.fillStyle = '#ffffff';
    boundsCtx.fill(path);
    boundsCtx.restore();

    const imgData = boundsCtx.getImageData(0, 0, 240, 240).data;
    let minX = 240, maxX = 0, minY = 240, maxY = 0;
    let hasPixels = false;

    for (let y = 0; y < 240; y++) {
      for (let x = 0; x < 240; x++) {
        const alpha = imgData[(y * 240 + x) * 4 + 3];
        if (alpha > 25) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          hasPixels = true;
        }
      }
    }

    if (!hasPixels) {
      throw new RangeError('SVG path must have filled area inside the 0–24 coordinate space.');
    }

    return {
      minX: minX / 10,
      maxX: maxX / 10,
      minY: minY / 10,
      maxY: maxY / 10,
      w: Math.max(1, (maxX - minX + 1) / 10),
      h: Math.max(1, (maxY - minY + 1) / 10)
    };
  }

  // Pass 2: High-Resolution 8x Supersampled Anti-Clipping Rasterizer
  function rasterizeSvgToAscii(svgPathStr: string, scaleModifier = 1.0): string[] {
    validatePath(svgPathStr);
    if (!Number.isFinite(scaleModifier) || scaleModifier <= 0) throw new RangeError('SVG scale must be positive and finite.');
    const path = new Path(svgPathStr);
    const bounds = getPathBounds(path);

    rasterCtx.clearRect(0, 0, hiresW, hiresH);

    const charAspect = 0.52;
    const BASE_TARGET_HEIGHT = 9.4 * scaleModifier;
    const BASE_MAX_WIDTH = (COLS / 38) * 24.5 * scaleModifier;

    const scaleH = (BASE_TARGET_HEIGHT / charAspect) / bounds.h;
    const scaleW = BASE_MAX_WIDTH / bounds.w;
    const scale = Math.min(scaleH, scaleW);

    const visualW = bounds.w * scale;
    const visualH = bounds.h * (scale * charAspect);

    const offsetX = ((COLS - visualW) / 2 - bounds.minX * scale) * SUPERSAMPLE;
    const offsetY = ((ICON_ROWS - visualH) / 2 - bounds.minY * (scale * charAspect)) * SUPERSAMPLE;

    rasterCtx.save();
    rasterCtx.translate(offsetX, offsetY);
    rasterCtx.scale(scale * SUPERSAMPLE, scale * charAspect * SUPERSAMPLE);

    rasterCtx.fillStyle = '#ffffff';
    rasterCtx.fill(path);
    rasterCtx.restore();

    const imgData = rasterCtx.getImageData(0, 0, hiresW, hiresH).data;

    const lines: string[] = [];
    const subpixelCount = SUPERSAMPLE * SUPERSAMPLE;

    for (let r = 0; r < ICON_ROWS; r++) {
      let line = '';
      for (let c = 0; c < COLS; c++) {
        let alphaSum = 0;
        const startX = c * SUPERSAMPLE;
        const startY = r * SUPERSAMPLE;

        for (let sy = 0; sy < SUPERSAMPLE; sy++) {
          for (let sx = 0; sx < SUPERSAMPLE; sx++) {
            const pixelIdx = ((startY + sy) * hiresW + (startX + sx)) * 4;
            alphaSum += imgData[pixelIdx + 3];
          }
        }

        const avgAlpha = alphaSum / (subpixelCount * 255);

        if (avgAlpha > 0.62) line += '█';
        else if (avgAlpha > 0.36) line += '▓';
        else if (avgAlpha > 0.16) line += '▒';
        else if (avgAlpha > 0.04) line += '░';
        else line += ' ';
      }
      lines.push(line);
    }
    return lines;
  }
  return rasterizeSvgToAscii;
}
