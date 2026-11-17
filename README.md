# Nanodes

**Animated glyph text and images for the web, with zero runtime dependencies.**

Nanodes is a planned, framework-agnostic JavaScript library for composing text and images into block-glyph displays and transitioning between them with a diagonal shimmer.

It begins with the visual elements in [Kashif Rezwi's portfolio](https://kashif-rezwi.github.io/): the cycling technology icons and labels in Contact, and the block-letter role treatment in the hero. The portfolio will be its first real-world integration.

## Status

**Foundation and planning only.** There is no library implementation, usable package API, or npm release in this repository yet. The package manifest is intentionally marked private to prevent accidental publication.

The [development roadmap](docs/roadmap.md) is the single source of truth for scope, source analysis, architectural decisions, phase tasks, and completion criteria.

## Planned capabilities

- Text nodes using the existing block alphabet, with static and animated presentations.
- Image nodes beginning with the existing SVG silhouette conversion.
- Text-only, image-only, and simple image-with-label compositions.
- The original diagonal morph, shimmer characters, color changes, and glow.
- Configurable dimensions, timing, alignment, and playback.
- Independent instances, predictable cleanup, reduced-motion support, and accessible text alternatives.
- Standard ES modules, TypeScript declarations, isolated CSS, and no framework requirement.

Broader image formats and font-sampled text are documented extensions, not existing features. Character coverage and supported formats will be stated explicitly.

## Intended uses

Portfolio role displays, technology showcases, animated labels, product identity elements, and other compact decorative text or image sequences.

Nanodes turns content into a character-grid visual. It is separate from the future Nanites particle project and does not aim to be a particle simulator or a general interface builder.

## Development workflow

**Plan → Implement → Review**, one phase at a time.

The first implementation phase will faithfully extract the portfolio behavior before generalizing or optimizing it. Later phases make it reusable, verify performance and compatibility, integrate it into the portfolio, and prepare an npm release.

See [Contributing](CONTRIBUTING.md) for the working process.

## License

[MIT](LICENSE). The license covers Nanodes-owned work. Any third-party assets distributed with future examples or presets will retain their required notices.
