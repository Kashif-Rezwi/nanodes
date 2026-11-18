# Nanodes

**Animated glyph text and SVG silhouettes for the web, with zero runtime dependencies.**

Nanodes turns text and SVG paths into block-glyph displays with diagonal shimmer transitions. The visual treatment comes from [Kashif Rezwi's portfolio](https://kashif-rezwi.github.io/).

## Features

- Text-only displays and SVG silhouettes with block-letter labels.
- Static display or automatic cycling through multiple items.
- The original shimmer wave or instant glyph changes.
- Color, glow, keyboard advance, reduced-motion support, and explicit cleanup.
- Browser-native ES modules, separate CSS, and TypeScript declarations.
- Pure text preparation for server-rendered markup.

Images currently mean SVG **path silhouettes**, not photographs or arbitrary image files. Text uses the original uppercase block alphabet: A–Z, numbers, spaces, `.`, `-`, and `/`. Unsupported characters become spaces; oversized text raises an error.

## Playground

Use a current Node.js LTS release and npm:

```sh
npm ci
npm test
npm run dev
```

Open [the playground](http://127.0.0.1:4173). A single preview handles text and images. Choose the content, playback, and transition; enter one text item per line or select SVG samples. Text edits use **Apply changes**. **Next item** advances manually, including in static mode. Cycling uses the original 3.4-second interval and 320 ms shimmer; reduced motion disables animation and autoplay.

The development server has no file watcher; restart it after source changes. The three SVG samples are original geometric artwork.

## Structure and API

- `src/text.ts` — shared alphabet and pure `prepareTextFrame(text)` helper.
- `src/svg.ts` — Canvas 2D opacity sampling.
- `src/frames.ts` — `prepareImageFrames(items)` builds SVG/label frames.
- `src/display.ts` — `mountDisplay(host, frames, options)` owns rendering, playback, and cleanup.
- `src/transition.ts` — diagonal shimmer wave.
- `src/styles.css` — prefixed text/image presentation.

A frame is `{ ascii, label, color }`. Frames in a sequence share a grid size. `prepareTextFrame` returns a 76 × 3 glyph string; `prepareImageFrames` accepts `{ name, svg, color, scaleModifier? }` items and returns 38 × 17 frames. Here `svg` contains SVG **path data**, not an SVG document.

`mountDisplay` accepts `variant: 'text' | 'image'`, `autoplay: boolean`, and `transition: 'shimmer' | 'none'`. Defaults reproduce the image showcase: image styling, autoplay for multiple items, and shimmer. It returns `next()`, `show(index)`, and `destroy()`. A single item never starts autoplay. Include the generated `dist/styles.css` alongside the ES modules; mounting uses browser APIs, while importing modules and preparing text work without a browser.

## Source comparison

Generate local fixtures from a portfolio clone containing the [baseline commit](https://github.com/Kashif-Rezwi/Kashif-Rezwi.github.io/commit/cb8d321297700866709cedb96fc1e8df362e8212):

```sh
npm run reference -- /absolute/path/to/portfolio
```

With the development server running, open [the comparison](http://127.0.0.1:4173/tests/browser.html) and select **Run deterministic comparison**. Reload before rerunning; cleanup checks destroy the instances. Fixtures stay in ignored `.reference/`; the original brand paths are not a distributed preset. `npm test` runs the build and Node tests separately from these browser checks.

See [the roadmap](docs/roadmap.md) for the development plan. Host layout, entrance effects, and background dots remain outside the library.

## License

[MIT](LICENSE). Verify third-party asset provenance and required notices before distribution.
