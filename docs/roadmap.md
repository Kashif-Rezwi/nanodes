# Nanodes development roadmap

Purpose: the single source of truth for Nanodes scope, source analysis, decisions, priorities, and phase acceptance criteria.

- Maintainer: Kashif Rezwi
- Last reviewed: 2026-11-18
- Status: foundation and planning only; no library implementation or npm release.

## Contents

- [Working agreement](#working-agreement)
- [Source review](#source-review)
- [Architecture and API discussion](#architecture-and-api-discussion)
- [Performance and compatibility](#performance-and-compatibility)
- [Development phases](#development-phases)
- [Future extensions](#future-extensions)
- [Decision record and references](#decision-record-and-references)

## Working agreement

The workflow is **Plan → Implement → Review**, completing one phase before moving to the next.

1. **Plan:** review the phase goal, affected behavior, public surface, and acceptance criteria. Resolve material design questions here before implementation.
2. **Implement:** make the smallest changes that satisfy that phase. Preserve the reference experience.
3. **Review:** demonstrate behavior, explain decisions, run the relevant checks, and record evidence and any deliberate differences here.
4. The maintainer reviews the result before the following phase begins. A phase is complete only when its criteria are met and that review is recorded.

The current task authorizes repository initialization and documentation only. Implementation begins in a subsequent task after the foundation review.

The maintainer intends to understand and implement the library independently; mentoring, conceptual guidance, and review should support that goal. Do not infer permission to generate library code from this roadmap.

Update this document instead of creating competing plans. The README is a concise public introduction, not a second roadmap. No dates or version numbers imply a delivery commitment.

## Source review

### Evidence and boundaries

Reviewed the portfolio's clean local main checkout at commit [cb8d321297700866709cedb96fc1e8df362e8212](https://github.com/Kashif-Rezwi/Kashif-Rezwi.github.io/commit/cb8d321297700866709cedb96fc1e8df362e8212). These pinned sources are the reference:

- [Contact.astro](https://github.com/Kashif-Rezwi/Kashif-Rezwi.github.io/blob/cb8d321297700866709cedb96fc1e8df362e8212/src/sections/Contact.astro): assets, image and label generation, animation, interaction, styling.
- [ascii-roles.ts](https://github.com/Kashif-Rezwi/Kashif-Rezwi.github.io/blob/cb8d321297700866709cedb96fc1e8df362e8212/src/lib/ascii-roles.ts): pure role-text frame generation.
- [HeroRoleCycler.astro](https://github.com/Kashif-Rezwi/Kashif-Rezwi.github.io/blob/cb8d321297700866709cedb96fc1e8df362e8212/src/components/HeroRoleCycler.astro): hero presentation and accessible equivalent.
- [HeroDotMatrix.astro](https://github.com/Kashif-Rezwi/Kashif-Rezwi.github.io/blob/cb8d321297700866709cedb96fc1e8df362e8212/src/components/HeroDotMatrix.astro): separate decorative background.
- [global.css](https://github.com/Kashif-Rezwi/Kashif-Rezwi.github.io/blob/cb8d321297700866709cedb96fc1e8df362e8212/src/styles/global.css): system font stacks and host theme.
- [package.json](https://github.com/Kashif-Rezwi/Kashif-Rezwi.github.io/blob/cb8d321297700866709cedb96fc1e8df362e8212/package.json): Astro and Tailwind application dependencies.

This is a source audit, not a runtime benchmark. No measured frame rate, memory footprint, or bundle size is claimed. Do not assume a screenshot proves animation behavior or that the live deployment is identical without checking it.

### Contact: image and label generation, step by step

1. **Describe the content.** A list contains 25 technology items. Each has an identifier, uppercase name, color, SVG path, and occasionally a scale adjustment. These are paths for silhouettes, not arbitrary photographs or HTML.
2. **Find the visible bounds.** A detached 240 × 240 Canvas 2D surface draws each path through Path2D. Scanning alpha values identifies its bounding rectangle. Alpha measures pixel opacity.
3. **Render a larger sample.** A second detached canvas is 304 × 96 pixels: 38 columns × 12 icon rows, with 8 samples in each dimension per character cell. A character-aspect adjustment compensates for tall, narrow monospace glyphs.
4. **Choose block characters.** Average opacity over each 8 × 8 sample becomes a full block, one of three shaded blocks, or a space. The exact alpha thresholds are 0.62, 0.36, 0.16, and 0.04. This forms 12 rows of icon text.
5. **Build the label.** A small hand-authored alphabet turns the name into two rows of Unicode blocks and centers them. It supports A–Z, digits, spaces, and limited punctuation. Unknown characters currently become spaces.
6. **Compose a frame.** Twelve icon rows, two blank separator rows, two label rows, and one final blank row produce a 38 × 17 frame: 646 character positions.
7. **Cache the results.** All 25 target frames are generated at startup and reused.
8. **Show the frame.** One preformatted DOM text element displays it. CSS supplies the system monospace font, strong weight, color, ambient blur, drop shadow, and hover enlargement.

These are detached HTML canvases used on the main thread. They are not workers and do not use the OffscreenCanvas API.

### Contact: animation and interaction

A frame is the complete character grid at a given moment. A transition replaces characters at fixed grid positions; characters do not travel across the screen.

- requestAnimationFrame calls a rendering function around the browser's display refresh.
- Elapsed time becomes progress over a 320 ms transition.
- Each cell has a precomputed threshold: 65% horizontal position plus 35% vertical position.
- Cells ahead of the wave keep their old character. Cells in its band display random block/symbol characters. Cells behind it show the target character.
- Each animation frame replaces the preformatted element's textContent. At completion, the exact target string is assigned.
- A new transition cancels the preceding frame request and starts from the currently displayed string.
- A 3,400 ms interval advances through items. Hover stops cycling; leaving restarts it. Clicking advances and restarts the interval, including while hovered.
- Reduced motion assigns a settled frame and disables automatic cycling. A preference change is handled.
- Hiding the browser tab stops the timer and cancels the current animation. Returning restarts the timer; the source does not explicitly settle or resume an interrupted transition.
- Startup displays the first item without an old-to-new morph because the current frame is initially empty.

Preserve these baseline behaviors during extraction. Oddities such as restarting on click while hovered, the final assignment at the far edge of the wave, and a partially drawn frame after visibility changes must not be silently redesigned. Any correction belongs to a reviewed compatibility decision.

### Hero: text generation, step by step

The current main branch intentionally renders a **static** Full Stack Engineer role. Despite its retained filename, HeroRoleCycler has no JavaScript role-cycling loop.

1. ascii-roles.ts uppercases the role and looks up two block-glyph rows per character.
2. It joins glyphs with spaces and pads to a 76-column frame.
3. A blank optical row plus the two lettering rows make a 76 × 3 frame.
4. An oversized role raises an error instead of silently overflowing.
5. Astro renders the frame into HTML on the server. The visual pre is hidden from assistive technology; a plain-text Full Stack Engineer equivalent is provided.
6. CSS uses container-relative sizing, the host accent color, the same monospace stack, and a glow. The surrounding component also has the host's entrance-animation classes.

The miniature alphabet duplicates the Contact alphabet by convention. A shared implementation can eliminate that duplication. Optional cycling between text frames would be a new library capability, not an existing hero behavior to claim or enable automatically.

### Strengths, limitations, and extraction boundary

**Keep:** recognizable block treatment, original alphabet and sampling thresholds, static server-rendered hero, distinct alignment and sizing in both uses, caching, time-based contact progress, reduced-motion behavior, and useful host styling.

**Improve carefully:**

- Contact combines assets, DOM access, sampling, scheduling, and CSS in one component.
- Fixed IDs and global lookups assume one instance.
- Explicit teardown is absent.
- The contact effect keeps cycling when scrolled out of view.
- Its zero-allocation comment is incorrect: each frame creates arrays and strings.
- CSS compositing hints do not make JavaScript text generation a GPU particle simulation.
- The clickable contact div has no keyboard equivalent.
- The contact pre is empty before its script runs; the hero already has a useful static HTML fallback.
- Contact's input assumes roughly 24-unit SVG paths; arbitrary SVG documents require a separate contract.
- Raster photographs need brightness sampling; alpha-only sampling makes opaque content a solid shape.
- The existing alphabet is not a general Unicode font. Font and browser differences affect glyph metrics.

The sparse background dots are a different Canvas 2D system. Their pointer displacement, visibility observer, and idle settling are useful references, but the background remains host/demo content, outside the first library release. Portfolio copy, contact details, layouts, social links, and unrelated site code are not package assets.

## Architecture and API discussion

### Chosen direction

**Content nodes → prepared glyph frames → one shared transition → scoped DOM presentation**

- A **text node** describes text and its presentation.
- An **image node** initially describes an SVG silhouette and its presentation.
- A **frame** is the prepared rectangular character grid with dimensions and display metadata.
- A **display instance** owns its DOM, playback state, timers, frame request, and cleanup.

Keep nodes as ordinary data, not one DOM element or class per visible block. Compose a text node alone, an image alone, or an image with a label using simple alignment and spacing. Do not introduce a recursive scene graph, constraint solver, or arbitrary HTML renderer.

The first release targets block text and SVG-path image nodes. Multiple lines and supported-character validation belong to reusable text handling. Additional image formats and native-font text are explicitly scheduled future extensions.

### Alternatives considered

- **Plain DOM mounting function — preferred.** A small framework-independent API can be mounted and destroyed through any framework's lifecycle.
- **Custom element — deferred.** Useful native lifecycle hooks, but registration, styling, and rich property handling add choices without solving a current integration problem.
- **Framework wrappers — deferred.** Short usage examples can establish actual need before adding adapter packages or peer dependencies.
- **Canvas/WebGL replacement — declined for this extraction.** It changes rendering and fidelity without evidence of a bottleneck.
- **General node layout engine — declined.** The two reference uses only require text and an image/label composition.

### Proposed public surface, to finalize in Phase 2

These are design candidates, not existing exports or copy-paste usage examples.

- Mount a display into a caller-owned container with a sequence of node compositions.
- Configure columns/rows per instance, alignment/spacing, transition duration, cycle interval, autoplay, hover pause, and click advance.
- Retain contact-compatible defaults: 38 × 17, 320 ms, 3,400 ms. Provide the hero's 76 × 3 static presentation as a separate configuration.
- Return a small controller: show, next, play, pause, destroy.
- Expose a pure text-frame preparation helper for static/SSR use so the hero need not load an animation runtime.
- Use prefixed CSS variables for color, font size, font family, and glow. Preserve baseline appearance through configurations rather than portfolio-specific variable names.
- Keep original technology data as an optional preset export after attribution review.
- Define invalid dimensions, unsupported glyphs, oversized text, invalid paths, empty sequences, and out-of-range selections explicitly.

Do not add an update method, event bus, plugin API, or many renderer options until a supported use case requires them.

### Framework and build approach

Use TypeScript source compiled into standard ES modules and type declarations, plus separately distributed CSS. A TypeScript compiler and a simple CSS-copy build step should suffice; introduce a bundler only if a concrete packaging requirement justifies it.

Zero dependencies means **zero runtime and framework peer dependencies**. Development-only compiler and test tools are allowed.

The pure text module must import and execute without window, document, Canvas, or a framework. The browser-facing module must be safe to import during SSR and access browser facilities only on mount. Images requiring Canvas are prepared in the browser; no server Canvas dependency is planned.

Provide plain-browser ESM and Astro usage, plus small lifecycle examples for React, Vue, and Svelte. Test each claimed integration before documenting it as supported. Reserve CommonJS and prebundled CDN globals for demonstrated consumer demand.

Typography is decorative output. Keep semantic heading/paragraph context under host control, provide meaningful accessible equivalents, and avoid announcing every shimmer or automatic change.

## Performance and compatibility

Retain the current prepared-frame cache and threshold calculation. Measure before changing sampling, frame scheduling, or appearance.

Worthwhile initial improvements:

- Per-instance state and references; no fixed IDs or global event ownership.
- Idempotent destruction and cancellation of pending work.
- Shared alphabet and reusable, bounded frame data.
- Reuse straightforward temporary buffers; do not promise allocation-free strings.
- No animation loop for settled static content.
- An explicit policy for hidden tabs, offscreen instances, hover, manual pause, and reduced motion, with differences from the reference reviewed.
- Isolated CSS that works without Astro or Tailwind.

Measure startup preparation time, transition frame work and dropped frames, idle/offscreen activity, repeated mount/destroy behavior, and packed JS/CSS size. Record device, browser, resolution, fixture, and measurement method. A 60 Hz display offers about 16.7 ms for the whole frame; that is a budget, not a guaranteed benchmark.

Use controlled clocks and randomness in development verification to compare transition states; production shimmer remains random. Settled frame output should match exactly in the same font/browser environment. Compare contact and hero at desktop and narrow widths, with reduced motion, theme changes, rapid interruption, and multiple instances.

Candidate optimization results must include before/after evidence and retain accepted visual behavior. Do not introduce workers, OffscreenCanvas, GPU rendering, object pools, or global caches speculatively.

## Development phases

### Phase 0 — Repository foundation

**Goal:** establish an honest public project and reviewable plan.

**Scope:** metadata, license, repository hygiene, source audit, architectural options, and roadmap only.

**Tasks**

- Initialize a main-branch Git repository in the maintainer's existing npm-package workspace.
- Create the public Kashif-Rezwi/nanodes GitHub repository with a concise description and relevant topics.
- Add README, this roadmap, contribution guidance, MIT license, ignore rules, editor settings, and a metadata-only package manifest.
- Keep the manifest private and omit implementation exports, build scripts, source files, and installed dependencies.

**Complete when:** local and public repositories contain the reviewed foundation, relative links and metadata are valid, and no library implementation or npm release has been created.

**Status:** complete for the repository foundation. Implementation phases remain unstarted and await the maintainer's foundation review.

### Phase 1 — Faithful extraction

**Goal:** reproduce the portfolio's two reference displays outside Astro.

**Scope:** existing SVG silhouettes, shared mini alphabet, original composition, styling, and transition logic. No new visual design or broader image formats.

**Tasks**

- Confirm the pinned source and capture same-environment visual/behavior references.
- Introduce the minimal TypeScript/ESM build and development-only verification tools.
- Extract one shared alphabet and the pure static text-frame helper.
- Extract SVG bounds/supersampling conversion, frame composition, contact morph, and scoped CSS.
- Build small local fixtures for all 25 contact entries and the static hero.
- Check provenance before redistributing brand icons; use first-party synthetic fixtures if a preset's permissions are unresolved.
- Record intentional host dependencies such as theme variables and entrance classes.

**Complete when:** settled frames and layout match the reference; contact timing, interruption, shimmer, color, glow, and interaction are reproduced; the hero remains statically renderable; no Astro/Tailwind runtime is required.

**Review checkpoint:** explain how source content becomes a grid, why text and SVG need different preparation, and why the transition itself can be shared.

**Status:** not started.

### Phase 2 — Reusable nodes and public API

**Goal:** turn the extraction into a small, configurable library.

**Scope:** text and SVG-path image nodes, simple composition, instance lifecycle, and the public interface.

**Tasks**

- Finalize node data, frame dimensions, mount options, controller methods, and error policy here.
- Add per-instance state and remove global IDs.
- Support text-only, image-only, and image-with-label sequences; configure width, alignment, spacing, and line breaks.
- Handle supported-character wrapping/overflow explicitly without silently dropping user content.
- Add optional text cycling without enabling it in the existing static hero.
- Preserve the original defaults while providing independently configurable hero/contact presentations.
- Separate pure text preparation from browser mounting; namespace CSS and keep presets optional.
- Document ownership of host containers, accessible text, and destroy/re-mount behavior.

**Complete when:** two differently configured instances operate independently, the same transition handles both node types, static imports work in Node/SSR, errors are understandable, and the public surface is small enough to explain in one example.

**Review checkpoint:** demonstrate the two portfolio uses with the same library and explain each public option's need.

**Status:** not started.

### Phase 3 — Measured hardening and compatibility

**Goal:** make the library reliable without sacrificing visual fidelity.

**Scope:** focused performance improvements, lifecycle, accessibility, and meaningful regression coverage.

**Tasks**

- Establish baseline measurements before optimizing.
- Reduce only demonstrated redundant preparation or temporary allocation.
- Resolve timer/animation ownership, interrupted transitions, reduced motion, and visibility/resume rules.
- Add keyboard-equivalent interaction and useful text alternatives without live-announcing shimmer.
- Verify cleanup after repeated mounting, destruction, and framework development remounts.
- Test pure frame preparation, composition boundaries, final transition output, rapid interruption, and invalid inputs.
- Run browser visual/interaction checks in current Chrome, Firefox, and Safari; record actual support and limitations.
- Add CI only for real build/type/test checks once those checks exist.

**Complete when:** relevant checks pass, static/settled displays do not run an idle frame loop, destroyed instances retain no owned timers/listeners, visual comparisons pass, and any performance claims have documented evidence.

**Review checkpoint:** explain what each optimization improves, its measurements, and why it does not change the accepted experience.

**Status:** not started.

### Phase 4 — Portfolio integration

**Goal:** make the portfolio the first real consumer.

**Scope:** replace the duplicated Contact and hero implementations using a local packed artifact before public npm publication.

**Tasks**

- Produce an npm tarball and install it into a separate portfolio feature branch.
- Replace Contact's embedded logic while retaining content order, styling, and interaction.
- Replace the hero's duplicated alphabet with the pure helper; keep its role static and server-rendered.
- Retain the background dots and other page behavior in the portfolio.
- Verify the production Astro build, responsive layouts, theme behavior, keyboard behavior, reduced motion, and cleanup.
- Remove duplicated implementation only after parity is established.
- Record package version/tarball identity and integration evidence here.

**Complete when:** the portfolio feature branch uses one Nanodes package for both displays, parity is reviewed, and the previous duplication is removed. Production deployment is a separate maintainer decision.

**Review checkpoint:** demonstrate the package from a consumer's perspective and identify any awkward API requirements exposed by real use.

**Status:** not started.

### Phase 5 — npm release preparation and publication

**Goal:** publish a small, correctly packaged, documented release after real integration.

**Scope:** distribution, consumer documentation, asset notices, and release verification.

**Tasks**

- Recheck the npm name's availability; use a maintainer-owned scope if needed. The GitHub name does not reserve the npm name.
- Finalize ESM, type, CSS, and optional preset exports; allowlist publication contents.
- Confirm the license and any third-party asset notices.
- Complete README installation/API/styling/error/compatibility guidance using implemented behavior only.
- Test the actual tarball in clean plain-browser and Astro consumers; verify the documented React/Vue/Svelte lifecycle examples.
- Inspect npm pack --dry-run and the produced archive; check runtime and peer dependency counts and package size.
- Choose a deliberate initial release version, add release notes, and remove private only as part of publication preparation.
- Configure the supported npm authentication or trusted-publishing flow at release time.
- Publish only in a separately authorized release task, then verify installation from the registry and tag the matching commit.

**Complete when:** the registry package installs successfully, distributed entry points/CSS/types work, README examples match the release, no unintended files ship, and the portfolio can consume the published version.

**Review checkpoint:** explain what consumers download, the browser/SSR boundary, and how a release can be traced to its source commit.

**Status:** not started.

## Future extensions

These require a separate scope decision after the baseline package is proven:

- Raster image sources such as PNG/JPEG, using alpha and/or luminance with explicit loading, CORS, and error behavior.
- Native-font text sampling for character coverage beyond the block alphabet, with font readiness and readable output requirements.
- Further composition or custom glyph sets driven by consumer needs.
- A custom element or framework wrapper only if repeated integration friction justifies it.

Arbitrary Unicode support, photographic fidelity, arbitrary HTML conversion, editable form controls, AI-generated interfaces, 3D graphics, and moving particle swarms are not first-release promises.

## Decision record and references

### Foundation decisions — 2026-11-18

- Nanodes is the official project name; npm registration remains unverified.
- Preserve and extract the glyph-grid experience; keep the future Nanites particle project separate.
- Use text/image content nodes and a shared frame transition without a general scene graph.
- Prefer native DOM/CSS/Canvas APIs, TypeScript-to-ESM output, isolated CSS, and zero runtime/peer dependencies.
- Keep the static hero static by default and retain a server-friendly text preparation path.
- Choose MIT for Nanodes-owned work; verify third-party assets before distributing them.
- Keep this document canonical and use Plan → Implement → Review for each phase.
- Ship the first useful release around existing block text and SVG silhouettes; decide broader image/text conversion separately.

### Verification record

Foundation verification, 2026-11-18:

- Public repository: https://github.com/Kashif-Rezwi/nanodes, default branch main.
- Local package workspace: the maintainer's existing Developer/npm packages/nanodes directory.
- The package manifest is valid JSON, has private set to true, and declares no runtime, peer, or development dependencies.
- Relative documentation links and the documentation-only file inventory were checked.
- No library source, installed dependencies, build artifacts, or npm release were created.
- Source analysis is pinned to the portfolio commit above; no runtime performance benchmark has been performed.

Review of the roadmap and the Phase 1 plan is the next step. Runtime and performance evidence belongs to later phases.

### External references

References explain platform/tool behavior; they do not establish implemented Nanodes capabilities.

- [Canvas text drawing](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_text)
- [Canvas image sampling and CORS](https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/CORS_enabled_image)
- [Custom element lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
- [TypeScript module reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html)
- [npm package contents and exports](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/)
- [npm pack](https://docs.npmjs.com/cli/v11/commands/npm-pack/)
- [Publishing a scoped public package](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/)
- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
