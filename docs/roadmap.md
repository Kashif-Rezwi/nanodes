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
- `frames.ts`: text/SVG node composition and the original SVG/label preset.
- `display.ts`: instance-owned DOM, playback, selection, and cleanup for either frame type.
- `types.ts`, `validation.ts`, and `path.ts`: public content contracts and explicit input boundaries; `display-options.ts` validates mounting configuration.
- `transition.ts`: the original shimmer algorithm; instant changes bypass it.
- `styles.css`: prefixed text and image treatments.

Use native APIs with zero runtime or framework peer dependencies. Compile TypeScript into ES modules and declarations, with CSS distributed separately. Keep the playground independent of the library. Defer custom elements, framework wrappers, workers, GPU rendering, and general scene graphs until actual use justifies them.

### Small API

- `Scene` contains a meaningful label, optional color, and a list of `TextNode` / `SvgNode` data. `prepareFrames` stacks nodes with a glyph-row gap and bottom-pads all scenes into the same rectangular grid. Default width is 38 columns; explicit rows are a hard boundary.
- Text nodes support alignment, letter spacing, line spacing, line breaks, optional glyph-boundary wrapping, and blank/error handling for unsupported glyphs. Do not add rich text, arbitrary positioning, or a scene graph.
- `prepareTextFrame` preserves the 76-column optical top-row preset; `prepareImageFrames` expresses the original 38 × 17 image/label preset through the composer. Raw text nodes have two rows per logical line; they do not add the hero's optical top row.
- `mountDisplay` accepts prepared frames, styling variant, autoplay, transition, timing, and hover/click flags. Its controller exposes `next`, `show`, `play`, `pause`, `setTransition`, and `destroy`. Transition changes keep the selected frame and timer; instant mode settles any active morph. Snapshot frames/options at mount so external mutations cannot corrupt a running instance.
- Manual pause persists across events; active visible transitions may finish. Phase 3 replaces the historical click/hover/hidden-tab quirks with composed pause reasons: focus/hover hold autoplay, hidden/offscreen displays settle and suspend, and resume waits a fresh interval. Glyph output and wave geometry retain the baseline.
- Prepare text-only scenes without browser globals; request Canvas/Path2D only for SVG nodes. Validate grids and options before mounting, path command groups before sampling, and colors in the browser. Document errors instead of clipping or silently accepting unusable paths.
- Use host-scoped font family/size and glow radius variables; keep frame color internal to the mounted display. Responsive sizing must preserve the default source dimensions.
- Keep the website as the only playground, with text, SVG-only, and SVG + text modes, transition selection, and autoplay controls. Advanced text layout options remain in the API and its tests.

### Verification and assets

Compare all 25 original SVG/label frames, static hero output, transition steps, interruption, playback, reduced motion, visibility, and computed styles against independently generated source fixtures. Cover shared text playback, static mode, instant transitions, independent instances, and cleanup. Node tests verify pure preparation and browser-free imports.

Use `npm run reference -- /absolute/path/to/portfolio`, then `npm run test:browser` and the comparison server at `http://127.0.0.1:4173` for local source comparisons; keep generated assets and screenshots in ignored `.reference/`. The original brand paths have unverified provenance, so the shareable playground uses three original geometric samples. Verify licensing before distributing any brand preset.

## Library website

The separate `site/` Next.js App Router app introduces Nanodes and demonstrates the real library. Statically render the landing content, metadata, and social card; keep browser rendering and controls inside small client components. The library owns offscreen scheduling and keyboard advance; the website reuses its two bounded SVG frame sets. Use local fonts, native CSS, accessible controls, reduced-motion preferences, and cleanup/offscreen pause for animated specimens. Render the static wordmark with pure text preparation; update preview playback without resampling or remounting, and provide an explicit hero pause/resume control.

The site consumes the compiled local library through a TypeScript alias and has its own dependency manifest and lockfile. Next.js and React are website dependencies only. Keep the website playground and public library API independent, and use source-build instructions until npm publication. `npm run dev` starts the website; the separate `test:browser` command serves only the source-comparison fixtures. The README documents local commands and the production origin setting. Website work does not replace the hardening tasks below.

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

### API verification

- Strict TypeScript/ESM output includes the exported node, scene, frame, and controller contracts.
- Node checks cover multiline text, alignment, spacing, wrapping, overflow, unsupported glyph policies, shared grid composition, browser-free imports/preparation, and input boundaries.
- Browser checks retain all 25 source SVG/label frames and hero output, original transitions and interactions, plus composed scenes, configurable timing/controls, manual pause persistence, independent instances, color/path/Canvas errors, and cleanup.
- The motion fixture emits a `MediaQueryListEvent` carrying `matches`; compare both the source and extracted schedulers when reduced motion changes.
- Settled image screenshots match the source at 1440 × 900 and 390 × 900 in Chrome for Testing 151 on macOS. Cross-browser verification and performance profiling remain in Phase 3.
- Defaults and compatibility helpers preserve both portfolio uses; actual portfolio installation remains Phase 4. No brand assets or runtime dependencies are added.

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

#### Execution plan

1. **Measure:** record preparation time, transition callback cost, idle/hidden/offscreen work, repeated mount/destroy cleanup, and current/proposed artifact sizes before optimizing. Use the same machine, content, and browser for before/after results; keep raw runs in ignored verification output.
2. **Harden:** retain glyph geometry, sampling, 320 ms shimmer, and 3,400 ms default interval. Hover and keyboard focus hold autoplay; manual pause survives every event. Hidden/offscreen displays cancel work and settle their selected target. Resume starts a fresh interval without advancing immediately. Manual selection still works while paused; reduced motion swaps immediately. Document these deliberate scheduling changes from the portfolio baseline.
3. **Optimize measured work:** reuse bounded demo frames and transition buffers, avoiding unbounded caches or new rendering backends. Static instances must not allocate an animation loop.
4. **Automate:** run the existing source comparisons plus independent keyboard, lifecycle, invalid-input, responsive, and accessibility checks in Chromium, Firefox, and WebKit. WebKit engine coverage must be distinguished from an actual Safari application check. CI must run without distributing portfolio brand assets.
5. **Review:** verify exact settled output and representative visual parity, confirm no owned timers/listeners/observers survive destruction, publish measurements with environment and limitations, and update this roadmap before Phase 4.

#### Verification record — 2026-11-21

- **Environment:** Apple M4, arm64, macOS/Darwin 27.0.0, Node 26.10.0; performance runs used headless Chromium 159.0.8154.6 at 1440 × 900. The unchanged baseline build and raw reports are local ignored `.reference/phase3-baseline/` and `.reference/phase3/` artifacts.
- **Activity:** a 350 ms sample after offscreen suspension stabilized recorded 21 baseline animation-frame requests versus 0 after hardening. Both builds recorded 0 idle requests at rest. After 100 mount/destroy cycles, owned DOM, timers, and pending animation frames were 0; deterministic tests also check listener/observer release.
- **CPU:** three SVGs prepared in a median 0.7 ms before and 0.6 ms after; transition callback p95 was 0.1 ms before and 0.2 ms after in these individual runs. At roughly 0.1 ms timer granularity, these small timings are noisy and do not establish a CPU speedup. Callback time excludes style, layout, paint, and GPU work. The targeted gain is eliminating offscreen work and repeated preparation, not a universal FPS claim.
- **Size:** combined unminified runtime JS/CSS was 31,547 → 33,507 bytes; concatenated gzip for size comparison was 8,425 → 8,802 bytes. This is not a shipped bundle or npm download measurement. The current unconfigured repository pack measured about 61 KB and includes development/site files; Phase 5 still owns the distribution allowlist and clean-consumer installation checks.
- **Coverage:** 13 Node checks and 36 browser tests pass across Chromium 159, Firefox 159, and WebKit 27.2. Portfolio comparisons check all 25 settled frames, original shimmer/interruption steps, and settled pixels at 1440 px and 390 px; only the documented scheduling quirks deliberately differ. Captures share a pixel origin to avoid fractional iframe positioning differences in Firefox. Keyboard semantics (including canceled Space presses), resource cleanup, frame ID 0 cancellation, composition limits, real IntersectionObserver behavior for single and multiple frames, and axe accessibility checks are covered. Runtime/API checks use synthetic content and run independently of the optional portfolio fixtures. Measurement regressions cover occupied ports and server shutdown; the tool waits for its own server to report its listening port.
- **Website:** browser scheduling now belongs to the library; the website caches only its two fixed SVG frame sets. Type checking and the production static export pass. Runtime and test dependencies remain separate; no library runtime dependency was added.
- **CI:** `.github/workflows/verify.yml` installs development tools, checks out the pinned portfolio reference into ignored local fixtures, runs Node/browser checks, and typechecks/builds the website. Browser traces are local ignored test outputs; no brand preset is added to the package. The hosted workflow has not been run because these changes have not been pushed.
- **Open browser check:** native Safari's driver still reports that “Allow remote automation” is disabled. Automated WebKit coverage passes, but it is not a native Safari or iOS hardware verification. Complete the native Safari check before closing the Phase 3 review and moving to Phase 4.

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
