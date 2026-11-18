# Nanodes roadmap

The working plan for scope, architecture, and phase completion. Implementation has not started.

## Workflow

**Plan → Implement → Review**, one phase at a time. Agree on the phase scope, implement it, then record verification and maintainer review here before advancing. Keep this document current rather than creating competing plans.

## Portfolio reference

Baseline: [portfolio commit cb8d321](https://github.com/Kashif-Rezwi/Kashif-Rezwi.github.io/commit/cb8d321297700866709cedb96fc1e8df362e8212).

- [Contact.astro](https://github.com/Kashif-Rezwi/Kashif-Rezwi.github.io/blob/cb8d321297700866709cedb96fc1e8df362e8212/src/sections/Contact.astro): 25 SVG silhouettes, label generation, styling, transitions, and playback.
- [ascii-roles.ts](https://github.com/Kashif-Rezwi/Kashif-Rezwi.github.io/blob/cb8d321297700866709cedb96fc1e8df362e8212/src/lib/ascii-roles.ts) and [HeroRoleCycler.astro](https://github.com/Kashif-Rezwi/Kashif-Rezwi.github.io/blob/cb8d321297700866709cedb96fc1e8df362e8212/src/components/HeroRoleCycler.astro): the shared block-letter treatment and static hero presentation.

### Behavior to preserve

**Contact:** detached Canvas 2D surfaces sample SVG opacity into block characters. A shared miniature alphabet produces the label. Prepared frames are cached and displayed in one preformatted DOM element.

- Frame: 38 columns × 17 rows, comprising 12 icon rows, two blank rows, two label rows, and one final blank row.
- Sampling: 8 × 8 samples per icon cell; alpha thresholds 0.62, 0.36, 0.16, and 0.04.
- Morph: 320 ms, using elapsed time and requestAnimationFrame; a diagonal wave keeps old characters, inserts random shimmer, then reveals the target. Its threshold weights are 65% horizontal and 35% vertical position.
- Playback: advance every 3,400 ms; hover pauses, leaving restarts, and clicking advances and restarts the interval even while hovered.
- Interruption starts from the current visible frame. Completion assigns the exact target; startup shows the first item immediately.
- Reduced motion shows a settled frame and disables autoplay. Hiding the tab cancels animation and cycling; returning restarts cycling without explicitly settling a partial frame.
- Preserve the glyph palette, color, system monospace stack, glow, hover enlargement, and responsive sizing in the reference environment.

**Hero:** the current role is a static, server-rendered “Full Stack Engineer” frame, despite the component's retained Cycler name. It uses a 76 × 3 frame, a blank optical row, and two block-letter rows. Oversized text raises an error. Preserve its sizing, color, glow, accessible plain-text equivalent, and host entrance treatment. Optional role cycling is a new capability.

### Extraction concerns

- The alphabet is duplicated; unsupported characters currently become spaces.
- Contact has fixed IDs, global lookups, no explicit teardown, and continues cycling offscreen.
- Per-frame arrays and strings are allocated; no runtime performance benchmark has been performed.
- The clickable contact element lacks keyboard-equivalent interaction.
- SVG inputs assume roughly 24-unit silhouettes. Opaque photographs need brightness sampling, not opacity alone.
- System font differences affect glyph appearance.

Preserve reference behavior first. Review intentional fixes to hover, interruption, or visibility behavior before changing them. The separate background dots and surrounding portfolio layout remain host/demo content.

## Architecture

**Text/image nodes → prepared glyph frames → shared transition → scoped DOM presentation**

Nodes are ordinary content data. A text node contains text and presentation; an image node initially contains an SVG silhouette and presentation. Simple placement, alignment, and spacing support text-only, image-only, and image-with-label compositions. A display instance owns its DOM, playback state, and cleanup.

- Use native browser APIs with zero runtime or framework peer dependencies.
- Compile TypeScript to ES modules and declarations; distribute CSS separately. Development-only build/test tools are allowed.
- Keep text-frame preparation pure and server-friendly. Browser modules must import safely during SSR and use browser APIs only on mount.
- Prefer a plain DOM mounting function. Framework examples should use normal mount/cleanup hooks.
- Keep presets optional and verify third-party asset provenance before distributing them.
- Retain host semantics and meaningful text alternatives; shimmer should not be announced repeatedly.
- Defer custom elements, framework wrappers, rendering-engine changes, and general scene graphs until justified by actual use.

### API candidates

Finalize these during Phase 2; they are not existing exports.

- Mount into a caller-owned container with a sequence of node compositions.
- Configure dimensions, alignment, spacing, transition duration, cycle interval, autoplay, hover pause, and click advance.
- Return show, next, play, pause, and destroy controls.
- Provide pure text-frame preparation for the static hero.
- Expose prefixed CSS variables for font, size, color, and glow.
- Define unsupported characters, overflow, invalid paths/dimensions, empty sequences, and invalid selections explicitly.

## Development phases

All phases below are not started.

### Phase 1 — Faithful extraction

**Goal and scope:** reproduce the existing contact animation and static hero outside Astro, using their current visual treatment.

**Tasks**

- Capture same-environment visual and behavior references from the pinned source.
- Add the minimal TypeScript/ESM build and appropriate development verification tools.
- Extract one alphabet, pure text preparation, SVG sampling, frame composition, transition, and scoped CSS.
- Create small fixtures for contact entries and the hero; document host theme/entrance dependencies.
- Verify asset provenance before redistributing the original icons.

**Complete when:** settled frames and layout match; timing, shimmer, interruption, color, glow, and interactions are reproduced; the hero remains statically renderable; no Astro/Tailwind runtime is required. Review how text and SVG preparation feed the shared transition.

### Phase 2 — Reusable nodes and API

**Goal and scope:** support configurable text and SVG-path image displays through a small public API.

**Tasks**

- Finalize node data, composition, options, controller methods, and error handling.
- Remove global IDs; add independent instance state and explicit cleanup.
- Support alignment, spacing, line breaks, and supported-character wrapping/overflow.
- Add optional text cycling while retaining the static hero default.
- Separate pure text preparation from browser mounting; namespace CSS and optional presets.

**Complete when:** two differently configured instances operate independently; one transition handles both node types; static helpers work during SSR; invalid content fails clearly; both portfolio uses fit the API without special-case machinery.

### Phase 3 — Measured hardening and testing

**Goal and scope:** improve reliability, accessibility, and demonstrated performance costs while retaining visual fidelity.

**Tasks**

- Measure preparation, transition frame work, idle/offscreen activity, repeated mount/destroy behavior, and packed size before optimizing.
- Reuse cached frames and simple buffers; avoid speculative workers, GPU rendering, or global caches.
- Resolve interruption and pause/resume rules for hover, hidden tabs, offscreen displays, manual pause, and reduced motion.
- Add keyboard equivalents and accessible text alternatives.
- Test frame preparation, composition boundaries, invalid inputs, final frames, interruption, and cleanup.
- Compare desktop/narrow layouts and behavior in Chrome, Firefox, and Safari; add CI for checks that exist.

**Complete when:** relevant checks and visual comparisons pass; settled content runs no idle animation loop; destruction removes owned timers/listeners; performance claims include before/after evidence and environment details.

### Phase 4 — Portfolio integration

**Goal and scope:** make the portfolio the first consumer using a locally packed artifact.

**Tasks**

- Install the tarball in a separate portfolio feature branch.
- Replace Contact's embedded implementation and the hero's duplicated alphabet.
- Keep the hero static and server-rendered; retain background dots in the portfolio.
- Verify the production Astro build, responsive appearance, theme behavior, interaction, and reduced motion.
- Remove duplication after parity is reviewed; record the artifact identity and integration results.

**Complete when:** both displays use Nanodes and match their accepted reference behavior. Production deployment remains a separate decision.

### Phase 5 — npm release

**Goal and scope:** publish a verified, documented package after real integration.

**Tasks**

- Confirm npm name availability, using a maintainer-owned scope if necessary.
- Finalize ESM, declaration, CSS, and optional preset exports; allowlist distributed files.
- Complete installation/API/styling/compatibility documentation and required asset notices.
- Inspect npm pack --dry-run and install the actual tarball in clean browser/Astro consumers.
- Verify documented React, Vue, and Svelte lifecycle examples before claiming support.
- Choose a release version, record release notes, and remove private only during release preparation.
- Configure npm authentication, publish in an authorized release task, verify registry installation, and tag the matching commit.

**Complete when:** consumers can install the registry release with working exports, types, and CSS; documentation matches; no unintended files or runtime dependencies ship; the portfolio can use that version.

## Later scope

PNG/JPEG sampling, native-font text for wider character coverage, custom glyph sets, and richer composition remain possible extensions. Decide them separately after the original block-text/SVG experience is proven. Nanodes remains distinct from the future Nanites particle project.
