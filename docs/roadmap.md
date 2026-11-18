# Nanodes roadmap

The development plan, technical boundaries, and completion criteria for Nanodes.

## Workflow

**Plan → Implement → Review.** Work through one phase at a time and verify its completion criteria before expanding the scope.

## Portfolio reference

Baseline: [portfolio commit cb8d321](https://github.com/Kashif-Rezwi/Kashif-Rezwi.github.io/commit/cb8d321297700866709cedb96fc1e8df362e8212).

- [Contact.astro](https://github.com/Kashif-Rezwi/Kashif-Rezwi.github.io/blob/cb8d321297700866709cedb96fc1e8df362e8212/src/sections/Contact.astro): SVG sampling, labels, styling, transitions, and playback for 25 entries. Extract the feature logic, not the surrounding section or layout.
- [ascii-roles.ts](https://github.com/Kashif-Rezwi/Kashif-Rezwi.github.io/blob/cb8d321297700866709cedb96fc1e8df362e8212/src/lib/ascii-roles.ts) and [HeroRoleCycler.astro](https://github.com/Kashif-Rezwi/Kashif-Rezwi.github.io/blob/cb8d321297700866709cedb96fc1e8df362e8212/src/components/HeroRoleCycler.astro): the block alphabet and static hero presentation. Despite its retained name, the source component does not cycle roles.

### Visual baseline

- SVG/label frame: 38 columns × 17 rows, including 12 icon rows, two blank rows, two label rows, and a final blank row.
- Sampling: detached Canvas 2D surfaces, 8 × 8 samples per cell, and alpha thresholds 0.62, 0.36, 0.16, and 0.04. The sampler assumes roughly 24-unit path silhouettes.
- Text frame: 76 columns × 3 rows, with a blank optical row and two block-letter rows. Oversized text fails; unsupported characters become spaces.
- Morph: 320 ms, driven by elapsed time and requestAnimationFrame. The diagonal wave uses 65% horizontal and 35% vertical threshold weights, preserving the glyph palette and exact target assignment on completion.
- Image playback: advance every 3,400 ms; hover pauses and leaving restarts. Clicking advances and restarts the interval even while hovered. Interruptions start from the current visible frame.
- Reduced motion settles the target and disables autoplay. Hiding the tab cancels animation and cycling; returning restarts cycling without settling a partial frame.
- Preserve system monospace sizing, color, glow, and image hover enlargement. Fonts and rasterization can vary by environment.

## Architecture

**Text/SVG preparation → glyph frames → shared display and transition → scoped DOM/CSS**

- `text.ts`: one alphabet and pure text preparation, usable without browser globals.
- `svg.ts`: the original opacity sampler, called only in a browser.
- `frames.ts`: SVG silhouette and label composition.
- `display.ts`: instance-owned DOM, playback, selection, and cleanup for either frame type.
- `transition.ts`: the original shimmer algorithm; instant changes bypass it.
- `styles.css`: prefixed text and image treatments.

Use native APIs with zero runtime or framework peer dependencies. Compile TypeScript into ES modules and declarations, with CSS distributed separately. Keep the playground independent of the library. Defer custom elements, framework wrappers, workers, GPU rendering, and general scene graphs until actual use justifies them.

### Small API

- A frame contains `ascii`, `label`, and `color`; a sequence shares one grid size.
- `prepareTextFrame(text)` returns the original fixed-width glyph string.
- `prepareImageFrames(items)` accepts SVG path silhouettes with names and colors.
- `mountDisplay(host, frames, options)` accepts a text/image style variant, autoplay, and shimmer/instant transitions. Return `next`, `show`, and `destroy`.
- Static mode starts with a settled frame and no timer; manual changes can still shimmer. Single-item sequences never autoplay. Preserve the original image behavior with the default options.
- Keep the playground to one preview with content selection, text/SVG samples, static/cycle playback, and shimmer/instant changes. Do not turn it into a general editor.

### Verification and assets

Compare all 25 original SVG/label frames, static hero output, transition steps, interruption, playback, reduced motion, visibility, and computed styles against independently generated source fixtures. Cover shared text playback, static mode, instant transitions, independent instances, and cleanup. Node tests verify pure preparation and browser-free imports.

Use `npm run reference -- /absolute/path/to/portfolio` and `/tests/browser.html` for local source comparisons; keep generated assets and screenshots in ignored `.reference/`. The original brand paths have unverified provenance, so the shareable playground uses three original geometric samples. Verify licensing before distributing any brand preset.

## Development phases

### Phase 1 — Faithful extraction

**Goal:** reproduce the existing glyph treatment outside Astro.

**Scope and tasks**

- Capture same-environment visual and behavior references from the pinned source.
- Add a minimal TypeScript/ESM build and appropriate verification tools.
- Extract the alphabet, text preparation, SVG sampling, composition, transition, and scoped CSS by capability rather than portfolio section.
- Provide one small playground for text and images, including static/cycle playback and shimmer/instant changes.
- Keep static text renderable without client JavaScript; keep theme, entrance, and layout in the host.
- Verify asset provenance before redistributing original icons.

**Complete when:** settled frames and layout match; original timing, shimmer, interruption, color, glow, and image interactions are reproduced; text and images share the display controller; no Astro/Tailwind runtime is required.

### Phase 2 — Reusable nodes and API

**Goal:** refine the extracted capabilities into a consistent public API for text and SVG content.

**Scope and tasks**

- Finalize node data, composition, options, controller methods, and errors around actual consumer needs.
- Extend alignment, spacing, line breaks, and wrapping/overflow where needed.
- Define empty content, unsupported glyphs, invalid paths/dimensions, and invalid selections explicitly.
- Verify independent instances, cleanup, browser-only mounting, and pure server-friendly preparation.
- Keep optional presets separate and document the small set of useful CSS variables.

**Complete when:** differently configured instances operate independently; one transition serves both node types; static helpers work during SSR; invalid content fails clearly; both portfolio uses fit the API without special-case machinery.

### Phase 3 — Measured hardening and testing

**Goal:** improve reliability, accessibility, and demonstrated performance costs while retaining fidelity.

**Scope and tasks**

- Measure preparation, transition work, idle/offscreen activity, repeated mount/destroy behavior, and packed size before optimizing.
- Reuse cached frames and simple buffers; avoid speculative infrastructure.
- Resolve interruption and pause/resume rules for hover, hidden tabs, offscreen displays, manual pause, and reduced motion.
- Verify keyboard interaction and meaningful text alternatives without announcing shimmer frames.
- Test composition boundaries, invalid inputs, final frames, interruption, and cleanup.
- Compare desktop/narrow layouts and behavior in Chrome, Firefox, and Safari; add CI for existing checks.

**Complete when:** checks and visual comparisons pass; settled content has no idle animation loop; destruction removes owned work; performance claims include measurement and environment details.

### Phase 4 — Portfolio integration

**Goal:** make the portfolio the first consumer using a locally packed artifact.

**Scope and tasks**

- Install the tarball in a separate portfolio feature branch.
- Replace embedded image playback and the hero's duplicated alphabet with the library.
- Keep the hero static and server-rendered; retain background dots and host effects in the portfolio.
- Verify the production Astro build, responsive appearance, themes, interactions, and reduced motion.
- Remove duplication after parity verification and record the integration results.

**Complete when:** both displays consume Nanodes and match the reference experience. Production deployment is separate from local integration.

### Phase 5 — npm release

**Goal:** publish a verified, documented package after real integration.

**Scope and tasks**

- Confirm npm name availability, using a maintainer-owned scope if necessary.
- Finalize ESM, declaration, CSS, and optional preset exports; allowlist distributed files.
- Complete installation, API, styling, compatibility documentation, and required asset notices.
- Inspect `npm pack --dry-run` and install the tarball in clean browser/Astro consumers.
- Verify React, Vue, and Svelte lifecycle examples before claiming support.
- Choose a release version and notes; remove `private` only during release preparation.
- Configure authentication, publish in a release task, verify registry installation, and tag the matching version.

**Complete when:** registry consumers receive working exports, types, and CSS; no unintended files or runtime dependencies ship; the portfolio can use the release.

## Later scope

PNG/JPEG brightness sampling, native-font text for wider character coverage, custom glyph sets, and richer composition are separate extensions after the original block-text/SVG experience is proven.
