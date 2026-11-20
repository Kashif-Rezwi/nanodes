# Nanodes

**Animated glyph text and SVG silhouettes for the web, with zero runtime dependencies.**

Nanodes turns text and SVG paths into block-glyph displays with diagonal shimmer transitions. The visual treatment comes from [Kashif Rezwi's portfolio](https://kashif-rezwi.github.io/).

## Features

- Text and SVG nodes, individually or stacked in one frame.
- Multiline text, alignment, glyph spacing, and optional wrapping.
- Static display or automatic cycling, with shimmer or instant changes.
- Color, glow, keyboard advance, reduced-motion support, and explicit cleanup.
- Native ES modules, separate CSS, TypeScript declarations, and server-friendly text preparation.

Images are filled SVG **path silhouettes** in a roughly 0–24 coordinate space. Text uses the original uppercase block alphabet: A–Z, numbers, spaces, `.`, `-`, and `/`.

## Playground

```sh
npm ci
npm test
npm run dev
```

Use a current Node.js LTS release and npm. Open [the playground](http://127.0.0.1:4173). One preview supports text, SVG samples, and composed text + SVG scenes. Separate text items with a **blank line**; individual line breaks stay inside an item. Expand **Text layout** for alignment and wrapping. Apply text edits with **Apply changes**. Static mode permits manual advance; cycling adds **Pause/Play**.

The server has no file watcher; rebuild or restart after source changes. The three geometric SVG samples belong to the playground and are not imported by the library.

## Prepare content

```js
import { prepareFrames, mountDisplay } from './dist/index.js';

const frames = prepareFrames([
  {
    label: 'Hello from Nanodes',
    color: '#a9c8ff',
    nodes: [
      { type: 'svg', path: 'M2 2H22V22H2Z' },
      { type: 'text', text: 'HELLO\nNANODES', align: 'center' },
    ],
  },
], { columns: 38, gap: 2 });

const display = mountDisplay(document.querySelector('#display'), frames, {
  autoplay: false,
});
// Call display.destroy() when the host is removed.
```

Include `dist/styles.css` separately. The host supplies layout and available width. These are local build paths; npm exports are part of release preparation.

- A scene has a non-empty accessible `label`, optional `color` (default `#a9c8ff`), and one or more nodes.
- Text nodes contain `type: 'text'` and `text`. Options: `align` (`left`, `center`, `right`), `letterSpacing` (default 1 glyph column), `lineGap` (default 1 glyph row), `wrap` (default false), and `unsupported` (`blank` or `error`, default `blank`). Wrapping breaks at glyph boundaries, including inside words; it never clips part of a glyph.
- SVG nodes contain `type: 'svg'`, path data in `path`, and optional positive `scale` (default 1). Each occupies a 12-row raster; enlarging the scale can crop the silhouette within that raster. SVG documents, strokes, transforms, photographs, and image URLs are outside this sampler's scope.
- Composition options: `columns` (default 38), `rows` (default tallest scene), `gap` between nodes (default 2), and inherited text `align` (default left). Frames are padded at the bottom into a shared grid; text and composed row overflow fail instead of truncating the frame.

Two helpers preserve the original portfolio treatment:

- `prepareTextFrame(text, options?)` returns a glyph string with the original optical top row and 76-column default. It accepts text layout options plus `columns` and `rows`.
- `prepareImageFrames(items, document?)` accepts `{ name, svg, color, scaleModifier? }` items and returns the original 38 × 17 SVG/label frames using the shared composer. `svg` is path data, not markup.

Both the default hero helper and text-only `prepareFrames` work during SSR. SVG preparation requires a browser document (optional third argument to `prepareFrames`); importing the modules requires no browser globals. For static markup, place escaped glyph output in a `<pre aria-hidden="true">` with a meaningful plain-text equivalent. Use the matching `.nanodes-text` / `.nanodes-text-art` CSS classes for the original text treatment.

## Display and playback

`mountDisplay(host, frames, options?)` accepts prepared `{ ascii, label, color }` frames sharing one rectangular grid. Mount after the browser element exists and call `destroy()` from your framework's cleanup hook. No framework wrapper or peer dependency is required.

Options retain the original defaults:

- `variant: 'image' | 'text'` — styling, default `image`.
- `autoplay: boolean` — default true; single items never autoplay.
- `transition: 'shimmer' | 'none'` — default shimmer.
- `duration` and `interval` — milliseconds, defaults 320 and 3400. Zero duration swaps glyphs immediately; the interval must be positive.
- `pauseOnHover` and `advanceOnClick` — default true. Disabling click advance also removes button semantics; programmatic selection still works.

The controller provides `next()`, `show(index)`, `play()`, `pause()`, and `destroy()`. Manual pause stops cycling and lets an active morph finish; it persists across manual advance, hover, visibility, and motion changes. Play requests cycling but still respects reduced motion and hidden tabs. The default click/selection behavior restarts the cycle interval even while hovered, matching the source. Hiding the tab cancels active work and retains the partial frame until another selection. Destroy is idempotent and all later controls are inert. Frames and options are snapshotted on mount; remount to replace the content or configuration.

## Styling and errors

Set these on the host: `--nanodes-font-mono`, `--nanodes-font-size` (responsive cap), and `--nanodes-glow-radius`. Static text also uses `--nanodes-accent-text` and `--nanodes-accent`. Mounted frame colors are set through `--nanodes-color`. Defaults preserve the source treatment; font appearance varies across systems.

Grid dimensions are integers from 1–512. Glyph spacing, line gaps, and node gaps allow 0–512. Empty text intentionally produces blank glyph rows; empty sequences/nodes and blank accessible labels are errors. Unsupported glyphs become spaces unless strict mode is selected. Overflows, invalid dimensions/options/selections, malformed path command groups, and SVG paths with no filled area in the sampling space fail explicitly. Colors are validated when mounted. Missing browser/Canvas capabilities fail without attaching a display. The path sampler is not a general SVG renderer.

## Next.js website

The landing page and its curated demo live in `site/`, an independent Next.js App Router app. Its React/Next.js dependencies stay separate from the library. The site consumes the compiled local library and self-hosts its fonts.

```sh
npm ci
npm ci --prefix site
npm run site:dev
```

Open [the website](http://127.0.0.1:3000). `npm run site:check` checks site types and `npm run site:build` generates a static export in `site/out/`. These commands build the library first. The original standalone playground remains available through `npm run dev`.

Before deploying the export, set `SITE_URL` to the real public origin so social image URLs use the production domain. The local default is `http://localhost:3000`. The site uses Space Grotesk and DM Sans from Fontsource's OFL-licensed font packages; npm publication of the library is a separate roadmap task.

## Verification and development

`npm test` compiles the library and runs the Node tests. To compare against the original portfolio, use a clone containing the [baseline commit](https://github.com/Kashif-Rezwi/Kashif-Rezwi.github.io/commit/cb8d321297700866709cedb96fc1e8df362e8212):

```sh
npm run reference -- /absolute/path/to/portfolio
```

With the server running, open [the comparison](http://127.0.0.1:4173/tests/browser.html) and select **Run deterministic comparison**. Reload before rerunning; cleanup checks destroy the instances. Reference assets stay in ignored `.reference/`; brand paths are not distributed presets. Browser assertions are separate from `npm test`.

See [the roadmap](docs/roadmap.md) for the development plan. Host entrance effects, background dots, and portfolio integration remain separate from the library.

## License

[MIT](LICENSE). Verify third-party asset provenance and required notices before distribution.
