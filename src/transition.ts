/** The original diagonal wave, including its final exact-frame assignment. */
export function createMorph(display: HTMLElement, columns: number, rows: number, reducedMotionQuery: MediaQueryList, duration = 320) {
  const win = display.ownerDocument.defaultView!;
  const COLS = columns;
  const TOTAL_ROWS = rows;
  const THRESHOLDS = Array.from({ length: TOTAL_ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => (c / COLS) * 0.65 + (r / TOTAL_ROWS) * 0.35));
  const morphRunes = ['█', '▓', '▒', '░', '▄', '▀', '▌', '▐', '■', '#', '*', '+', '='];
  const morphRunesLen = morphRunes.length;
  let animFrameId: number | null = null;

  function morphTo(targetAscii: string, onComplete?: () => void) {
    if (animFrameId) win.cancelAnimationFrame(animFrameId);

    // Keep the content settled when motion is disabled.
    if (reducedMotionQuery.matches) {
      display.textContent = targetAscii;
      animFrameId = null;
      if (onComplete) onComplete();
      return;
    }

    const currentAscii = display.textContent || targetAscii;
    const currentLines = currentAscii.split('\n');
    const targetLines = targetAscii.split('\n');

    let startTime: number | null = null;

    function frame(timestamp: number) {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);

      const outputLines = new Array(TOTAL_ROWS);
      for (let r = 0; r < TOTAL_ROWS; r++) {
        const curLine = currentLines[r] || '';
        const tgtLine = targetLines[r] || '';
        const threshRow = THRESHOLDS[r];
        let newLine = '';

        for (let c = 0; c < COLS; c++) {
          const curChar = curLine[c] || ' ';
          const tgtChar = tgtLine[c] || ' ';
          const threshold = threshRow[c];

          // Distinct wave with full-width particle shimmer band
          if (progress > threshold + 0.22) {
            newLine += tgtChar;
          } else if (progress > threshold - 0.16) {
            if (tgtChar !== ' ' || curChar !== ' ') {
              newLine += morphRunes[(Math.random() * morphRunesLen) | 0];
            } else {
              newLine += ' ';
            }
          } else {
            newLine += curChar;
          }
        }
        outputLines[r] = newLine;
      }

      display.textContent = outputLines.join('\n');

      if (progress < 1) {
        animFrameId = win.requestAnimationFrame(frame);
      } else {
        display.textContent = targetAscii;
        animFrameId = null;
        if (onComplete) onComplete();
      }
    }

    animFrameId = win.requestAnimationFrame(frame);
  }

  return {
    morphTo,
    cancel() {
      if (animFrameId !== null) win.cancelAnimationFrame(animFrameId);
      animFrameId = null;
    },
  };
}
