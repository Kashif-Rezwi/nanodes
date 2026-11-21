# Nanodes

[![Nanodes — Small glyphs. Big personality.](https://nanodes.vercel.app/opengraph-image)](https://nanodes.vercel.app)

**Animated glyph text and SVG silhouettes for the web. Zero runtime dependencies.**

[Website](https://nanodes.vercel.app) · [Playground](https://nanodes.vercel.app/#playground) · [npm](https://www.npmjs.com/package/nanodes)

Nanodes turns text and SVG paths into block-glyph displays with diagonal shimmer transitions. The visual treatment comes from [Kashif Rezwi's portfolio](https://kashif-rezwi.github.io/).

## Features

- Text and SVG nodes, individually or stacked in one frame.
- Multiline text, alignment, glyph spacing, and optional wrapping.
- Static display or automatic cycling, with shimmer or instant changes.
- Color, glow, keyboard advance, reduced-motion support, and explicit cleanup.
- Native ES modules, separate CSS, TypeScript declarations, and server-friendly text preparation.

Images are filled SVG **path silhouettes** in a roughly 0–24 coordinate space. Text uses the original uppercase block alphabet: A–Z, numbers, spaces, `.`, `-`, and `/`.

## Install

```sh
npm install nanodes
```

ES modules only; no runtime or framework peer dependencies. Use a bundler that resolves npm imports, or serve the compiled modules yourself. TypeScript declarations and CSS are included.

## Playground

Try [the live playground](https://nanodes.vercel.app/#playground) with text, SVG shapes, and SVG + text, shimmer/instant transitions, and autoplay controls. Its geometric samples stay separate from the library.

## Prepare content

```js
import { prepareFrames, mountDisplay } from 'nanodes';
import 'nanodes/styles.css';

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

Add `<div id="display"></div>` to the page before mounting. The host supplies layout and available width. Load `nanodes/styles.css` once in your app’s stylesheet entry point.

- A scene has a non-empty accessible `label`, optional `color` (default `#a9c8ff`), and one or more nodes.
- Text nodes contain `type: 'text'` and `text`. Options: `align` (`left`, `center`, `right`), `letterSpacing` (default 1 glyph column), `lineGap` (default 1 glyph row), `wrap` (default false), and `unsupported` (`blank` or `error`, default `blank`). Wrapping breaks at glyph boundaries, including inside words; it never clips part of a glyph.
- SVG nodes contain `type: 'svg'`, path data in `path`, and optional positive `scale` (default 1). Each occupies a 12-row raster; enlarging the scale can crop the silhouette within that raster. SVG documents, strokes, transforms, photographs, and image URLs are outside this sampler's scope.
- Composition options: `columns` (default 38), `rows` (default tallest scene), `gap` between nodes (default 2), and inherited text `align` (default left). Frames are padded at the bottom into a shared grid; text and composed row overflow fail instead of truncating the frame.

Two helpers preserve the original portfolio treatment:

- `prepareTextFrame(text, options?)` returns a glyph string with the original optical top row and 76-column default. It accepts text layout options plus `columns` and `rows`.
- `prepareImageFrames(items, document?)` accepts `{ name, svg, color, scaleModifier? }` items and returns the original 38 × 17 SVG/label frames using the shared composer. `svg` is path data, not markup.

Both the default hero helper and text-only `prepareFrames` work during SSR. SVG preparation requires a browser document (optional third argument to `prepareFrames`); importing the modules requires no browser globals. For static markup, place escaped glyph output in a `<pre aria-hidden="true">` with a meaningful plain-text equivalent. Use the matching `.nanodes-text` / `.nanodes-text-art` CSS classes for the original text treatment.

## Framework integration

Mount into an empty host after it exists in the browser and call `destroy()` on component removal. React/Next.js, Vue, Svelte, and Astro lifecycle examples are in [the integration guide](https://github.com/Kashif-Rezwi/nanodes/blob/main/docs/integrations.md). Keep browser-only mounting and SVG sampling out of server-rendering code; pure text preparation supports SSR.

## Local package integration

To try changes from this checkout, build a local tarball:

```sh
npm ci
npm pack
```

`prepack` builds the library automatically. In another project, install the generated artifact:

```sh
npm install /absolute/path/to/nanodes-0.1.1.tgz
```

Import from `nanodes` and `nanodes/styles.css` as shown above. The tarball contains compiled ES modules, declarations, CSS, and package documentation. The portfolio is the first integration of the extracted text and SVG treatment.

## Display and playback

`mountDisplay(host, frames, options?)` accepts prepared `{ ascii, label, color }` frames sharing one rectangular grid. Mount after the browser element exists and call `destroy()` from your framework's cleanup hook. No framework wrapper or peer dependency is required.

Options retain the original defaults:

- `variant: 'image' | 'text'` — styling, default `image`.
- `autoplay: boolean` — default true; single items never autoplay.
- `transition: 'shimmer' | 'none'` — default shimmer.
- `duration` and `interval` — milliseconds, defaults 320 and 3400. Zero duration swaps glyphs immediately; the interval must be positive.
- `pauseOnHover` and `advanceOnClick` — default true. Disabling click advance also removes button semantics; programmatic selection still works. Focus on an interactive display also holds autoplay.
- `pauseWhenOffscreen` — default true. IntersectionObserver suspends fully offscreen displays; set false when the host manages visibility. Browsers without IntersectionObserver still honor document visibility and manual pause.

The controller provides `next()`, `show(index)`, `play()`, `pause()`, `setTransition(transition)`, and `destroy()`. Transition changes preserve selection and the playback deadline; choosing `none` settles an active morph immediately. Frames and initial options are snapshotted on mount. Remount to replace content or other configuration.

Playback follows these rules:

- Manual pause persists across selection, hover, focus, visibility, and motion changes; an active visible morph may finish.
- Hover or focus holds autoplay even after a manual advance. Leaving resumes only when no other pause reason applies. Enter advances on press; Space advances on release after a press on that display. Losing focus or hiding the document cancels that press.
- Hidden/offscreen displays cancel their work and settle the selected target. Manual selection there is immediate. Returning waits a fresh interval instead of showing a partial shimmer.
- Reduced motion settles transitions, disables autoplay, and removes CSS hover enlargement/transitions. Hosts can supply their own pause control; the library website includes one.
- Destroy removes owned DOM, timers, animation frames, listeners, and observers; repeated destruction and later controls are inert.

These scheduling rules deliberately harden the portfolio's hover/hidden-tab quirks; glyph sampling, settled output, shimmer geometry, and default timing remain unchanged.

## Styling and errors

Set these on the host: `--nanodes-font-mono`, `--nanodes-font-size` (responsive cap), and `--nanodes-glow-radius`. Static text also uses `--nanodes-accent-text` and `--nanodes-accent`. Mounted frame colors are set through `--nanodes-color`. Defaults preserve the source treatment; font appearance varies across systems. Interactive displays suppress their rectangular focus outline; hosts can provide a focus treatment that suits their design.

Grid dimensions are integers from 1–512. Glyph spacing, line gaps, and node gaps allow 0–512. Empty text intentionally produces blank glyph rows; empty sequences/nodes and blank accessible labels are errors. Unsupported glyphs become spaces unless strict mode is selected. Overflows, invalid dimensions/options/selections, malformed path command groups, and SVG paths with no filled area in the sampling space fail explicitly. Colors are validated when mounted. Missing browser/Canvas capabilities fail without attaching a display. The path sampler is not a general SVG renderer.

## Website development

The landing page and playground live in `site/`, an independent Next.js App Router app. Its website dependencies stay separate from the library. The site consumes the compiled local library and self-hosts its fonts.

```sh
npm ci
npm ci --prefix site
npm run dev
```

Use Node.js 24 LTS and npm, then open [localhost:3000](http://localhost:3000). Production and CI use Node.js 24.

`npm run dev` starts the website, `npm run site:check` checks its types, and `npm run site:build` generates a static export in `site/out/`. These commands build the library first, updating `dist/` in place so checks can run while the website preview is open. Next.js watches website files; after editing library files in `src/`, run `npm run build` to refresh the compiled library.

Vercel deploys the static export at [nanodes.vercel.app](https://nanodes.vercel.app). The project uses the repository root and the install/build/output settings in `vercel.json`: install both lockfiles, build the library and website, then serve `site/out/`. Pushes to `main` deploy production; other branches create previews. `SITE_URL` sets the canonical origin and defaults to the package homepage. Keep it set to the production URL for both production and preview builds.

The README, npm page, and link previews share the website’s glyph wordmark/social image; the favicon and inline mark use the same block-letter N. The site self-hosts Space Grotesk and DM Sans from Fontsource’s OFL-licensed packages. Website assets are not included in the npm tarball.

## Verification and development

After installing dependencies, install the test browser once:

```sh
npx playwright install chromium
npm test
```

`npm test` builds the library and runs four focused generation checks: block text, text composition, SVG silhouettes, and SVG with a caption. Text runs in Node; SVG checks use real Chromium Canvas/Path2D through the development-only Playwright dependency. No portfolio checkout or generated reference assets are needed. The library keeps zero runtime dependencies.

CI runs these checks plus website type checking and the production build. Use the website playground to review animation and interaction behavior manually; the automated suite covers generation only.

See [the roadmap](https://github.com/Kashif-Rezwi/nanodes/blob/main/docs/roadmap.md) for the development plan. Host entrance effects, background dots, and portfolio integration remain separate from the library.

## License

[MIT](https://github.com/Kashif-Rezwi/nanodes/blob/main/LICENSE). The package contains the portfolio-derived block alphabet and glyph renderer; portfolio technology-brand paths and website font assets are not distributed. Consumers supply and license their own SVG paths.
