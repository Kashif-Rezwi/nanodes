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
- Keep the website as the only playground, with text, SVG-only, and SVG + text modes, transition selection, and autoplay controls. Advanced text layout options remain in the API.

### Verification and assets

Keep automated verification focused on four generation checks:

- Text produces the expected block glyphs without browser globals.
- Text nodes stack and sequences share a rectangular grid.
- SVG paths produce distinct, non-empty silhouette grids using real Canvas/Path2D.
- The original image preset combines a silhouette with its centered caption.

Use Node for text and Chromium through development-only Playwright for SVGs. `npm test` builds the library and runs both suites. The website playground supports manual visual and interaction review. Detailed playback, accessibility, cleanup, cross-browser, source-comparison, and performance suites are outside the current automated scope.

The public playground uses three original geometric samples. Keep portfolio brand paths out of the package and verify licensing before distributing any brand preset. Local portfolio comparison copies, screenshots, benchmark archives, and their generators are not retained.

## Library website

The separate `site/` Next.js App Router app introduces Nanodes and demonstrates the real library. Statically render the landing content, metadata, and social card; keep browser rendering and controls inside small client components. The library owns offscreen scheduling and keyboard advance; the website reuses its two bounded SVG frame sets. Use local fonts, native CSS, accessible controls, reduced-motion preferences, and cleanup/offscreen pause for animated specimens. Render the static wordmark with pure text preparation; update preview playback without resampling or remounting, and provide an explicit hero pause/resume control.

The site consumes the compiled local library through a TypeScript alias and has its own dependency manifest and lockfile. Next.js and React are website dependencies only. Keep the website playground and public library API independent; public usage examples now use the published npm imports. `npm run dev` starts the website; the generation tests use a separate local fixture server. The README documents local commands and the production origin setting. Website work does not replace the hardening tasks below.

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
- The focused generation checks cover text, shared grid composition, SVG silhouettes, and the SVG/label preset.
- Defaults and compatibility helpers preserve both portfolio uses; actual portfolio installation remains Phase 4. No brand assets or runtime dependencies are added.

### Phase 3 — Efficient rendering and focused verification

**Goal:** retain reliable playback and efficient rendering with a small, maintainable generation test suite.

**Scope and tasks**

- Preserve glyph sampling, wave geometry, the 320 ms shimmer, and the 3,400 ms default interval.
- Reuse bounded demo frames and transition buffers; avoid speculative rendering infrastructure.
- Keep hover/focus holds, persistent manual pause, and reduced-motion handling in the shared controller.
- Settle hidden/offscreen displays and suspend their work; resuming waits a fresh interval.
- Keep keyboard interaction and meaningful labels without announcing shimmer characters.
- Run the four generation checks and website type/build checks in CI.
- Review appearance and interactions manually in the website playground and during portfolio integration.

**Complete when:** generation checks and website type/build checks pass, the playground's visual treatment and controls are reviewed, and no extra fixtures or test-only runtime dependencies are required by the library.

#### Current verification scope

The earlier extraction and hardening work used broader source comparisons, lifecycle tests, accessibility checks, multiple browser engines, and local performance reports. Those tools and generated artifacts were removed in favor of the focused generation suite. Runtime optimizations and playback behavior remain in the library.

Automated coverage is limited to the four generation checks above. Chromium runs the SVG tests; wider browser compatibility and interaction behavior need manual review before making support claims. The CI workflow installs the test browser, runs `npm test`, and checks/builds the website without a portfolio checkout.

### Phase 4 — Portfolio integration

**Goal:** make the portfolio the first consumer using a locally packed artifact.

**Scope and tasks**

- Install the tarball in a separate portfolio feature branch.
- Replace embedded image playback and the hero's duplicated alphabet with the library.
- Keep the hero static and server-rendered; retain background dots and host effects in the portfolio.
- Verify the production Astro build, responsive appearance, themes, interactions, and reduced motion.
- Remove duplication after parity verification and record the integration results.

#### Integration plan

1. Add the minimal ESM/type/CSS exports and a `dist` file allowlist required to consume a real tarball. Keep version `0.0.0` and `private: true`; publication remains Phase 5.
2. Pack the library into the portfolio's `vendor/` directory and install that relative file dependency on `feat/nanodes-integration`, based on portfolio `cb8d321`. Avoid workspace links so the installed artifact is the one being verified.
3. Replace the Contact section's sampler, alphabet, transition, playback, and art CSS with Nanodes. Keep its 25 technology paths, colors, order, and scale modifiers in the portfolio. Use a processed Astro script for package imports and the shared controller for interaction.
4. Render the hero with `prepareTextFrame` on the server and remove its duplicated alphabet. Map the portfolio's existing font/accent variables into the library CSS; retain host entrance and dot-field effects.
5. Run the focused generation suite, inspect the package contents, build the portfolio, and review desktop/mobile, dark/light, keyboard, pause, and reduced-motion behavior. Compare the pre-change output without restoring permanent comparison tooling or fixtures.
6. Record results here and in the portfolio's existing status/decision documents. Leave both working trees unstaged and uncommitted for owner review.

#### Integration results — 2026-11-21

- The portfolio on `feat/nanodes-integration` installs the relative `vendor/nanodes-0.0.0.tgz` dependency. Contact uses the shared renderer/controller and the hero uses `prepareTextFrame` during SSR. Duplicated host rendering code and the second alphabet are removed; all 25 technology definitions stay in the portfolio.
- All original SVG/label strings, colors and sequence entries, plus the static hero output, match exactly. The original desktop dimensions/font sizes are retained. Dark/light layouts at 320/390/768/1024/1440 px fit without horizontal overflow or artwork clipping.
- Four generation tests, the Nanodes website type check, portfolio production and preview-base builds, and the portfolio's 19 standard/30 glass contrast checks pass. Browser review covers click, Enter, Space release, persistent pause/resume and reduced motion; the hero is present in production HTML without JavaScript. Review used Chromium; no wider browser support claim is added.
- The reviewed tarball is 15,720 compressed bytes across 24 files, with only `dist` and standard package metadata/documentation. ESM, CSS and declarations resolve in a separate clean consumer. Private version `0.0.0` remains unpublished.
- The portfolio retains its own theme/layout/dot-field effects. The owner subsequently removed its pause/resume control and the display outline on both sites; the library website retains its pause control. Verification evidence lives in its `docs/rebuild-02/33-nanodes-integration.md`; temporary captures remain outside the repositories. No reference directory, permanent comparison suite, staging, commits, pushes, merges or deployment were added by this task.

**Complete when:** both displays consume Nanodes and match the reference experience. Production deployment is separate from local integration.

### Phase 5 — npm release

**Goal:** publish a verified, documented package after real integration.

**Scope and tasks**

- Confirm npm name availability, using a maintainer-owned scope if necessary.
- Recheck the existing ESM, declaration, and CSS exports and `dist` allowlist against the chosen release version; add other exports only if needed.
- Complete installation, API, styling, compatibility documentation, and required asset notices.
- Repeat package-content inspection and clean browser/Astro consumer installation checks for the final release artifact.
- Verify React, Vue, and Svelte lifecycle examples before claiming support.
- Choose a release version and notes; remove `private` only during release preparation.
- Configure authentication, publish in a release task, verify registry installation, and tag the matching version.

#### Release preparation plan

1. Prepare `nanodes@0.1.0` as the first release candidate. The initial public-registry lookup returned 404; ownership was confirmed only by the successful release below. Remove `private`, retain ESM/type/CSS exports, and build automatically with `prepack`.
2. Keep the file allowlist limited to `dist`, the changelog and lifecycle integration guide, alongside npm's standard README/license/manifest files. Retain zero runtime and peer dependencies. Do not ship portfolio brand data or website fonts.
3. Update installation/API examples to the public package imports. Verify React, Vue and Svelte mount/cleanup recipes using the actual tarball in temporary consumers, plus clean ESM/type/CSS imports. Keep the four permanent generation tests unchanged.
4. Run generation checks, website type/build checks, inspect the tarball and perform a publish dry-run. Record the candidate's integrity and verification limits before release.
5. After maintainer review and npm login, publish the exact reviewed tarball, verify a clean registry installation and record the release version. Commit/tag/push remain maintainer actions under the standing instruction.
6. Only after registry verification, change the portfolio from its existing `0.0.0` vendor tarball to the exact published version, remove the vendor archive, update its lockfile and rebuild/review before deployment.

#### Release record — 2026-11-21

- **Published:** [`nanodes@0.1.0`](https://www.npmjs.com/package/nanodes/v/0.1.0) under the authenticated `kashif-rezwi` account, with `latest` pointing to `0.1.0`. The initial rejected token was replaced through npm's browser login; npm's separate publishing verification was completed by the owner. No credentials are stored in repository files.
- **Artifact:** 26 files, 17,527 compressed bytes. README and changelog were finalized before publication. The final runtime, declarations and CSS match the tested candidate byte for byte. Registry integrity and a clean registry install match the exact published tarball: `sha512-HAyxOhIOeqdy7DJUkuUZwrthkP5nBNkwb5I1V0V6G6hyoEvhYuOZf0Orf96JxWF4fYnVxtEm6Bwr5dgKqZ6HqA==`.
- **Contents:** compiled ESM, declarations, CSS, changelog, lifecycle guide and standard package metadata/README/license only. No runtime/peer dependencies, portfolio brand paths, website assets or test tools ship. `prepack` builds automatically; CI now also runs a non-publishing pack dry-run.
- **Checks:** all four permanent generation tests, website type checking and the production static build pass. The permanent test suite remains unchanged. Clean ESM imports, browser-free text/composition, CSS resolution and public TypeScript contracts work with the actual package.
- **Framework recipes:** React 19.3.1 (including development Strict Mode), Vue 3.5.46 and Svelte 5.59.1 recipes compile and render using Vite 8.3.8. Two mount/unmount cycles leave no owned display DOM. A clean Astro 7.3.2 production consumer renders static text and interactive SVG output. Browser review used Chromium; these smoke checks do not establish a wider browser/version guarantee. Temporary consumer scaffolds are outside both repositories.
- **Portfolio:** the owner committed the Phase 4 integration as `fe13b47`. The current `feat/nanodes-integration` working tree now pins registry version `0.1.0` and its SHA-512 in the lockfile; the vendor archive is removed. Production build, unchanged static hero output, click advance, no-outline/no-pause appearance, and 19 standard/30 glass contrast checks pass. Its release dependency changes remain uncommitted.
- **Website:** public installation examples now use `npm install nanodes` and `nanodes/styles.css` rather than source-build setup.

The registry release and first consumer are verified. Git commits, a matching `v0.1.0` tag, pushes and production deployment remain maintainer actions under the standing instruction; none were performed by the agent. For subsequent releases, update the version/changelog, repeat the documented checks and inspect the final tarball before publishing a new version; `0.1.0` is already published and must not be republished.

**Complete when:** registry consumers receive working exports, types, and CSS; no unintended files or runtime dependencies ship; the portfolio can use the release.

## Later scope

PNG/JPEG brightness sampling, native-font text for wider character coverage, custom glyph sets, and richer composition are separate extensions after the original block-text/SVG experience is proven.
