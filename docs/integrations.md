# Nanodes framework integration

[Website](https://nanodes.vercel.app) · [Playground](https://nanodes.vercel.app/#playground) · [API](https://github.com/Kashif-Rezwi/nanodes#prepare-content)

Nanodes owns the DOM inside an empty host. Mount it after the host exists, and destroy it when the component is removed. Import `nanodes/styles.css` once in your app’s global CSS entry point. These examples use static content; remount to replace frames, or use the controller to change playback and transition mode.

## React / Next.js

Use a client component. The effect cleanup also supports React Strict Mode’s development mount/cleanup cycle. In Next.js, load the CSS from the app layout or global stylesheet.

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { prepareFrames, mountDisplay } from 'nanodes';

export default function Glyph() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!host.current) return;
    const frames = prepareFrames([
      { label: 'Hello', nodes: [{ type: 'text', text: 'HELLO' }] },
    ]);
    const display = mountDisplay(host.current, frames, { autoplay: false });
    return () => display.destroy();
  }, []);

  return <div ref={host} />;
}
```

The effect runs on the client; importing Nanodes does not access browser globals. See React’s [effect lifecycle](https://react.dev/reference/react/useEffect).

## Vue

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { prepareFrames, mountDisplay } from 'nanodes';

const host = ref(null);
let display;

onMounted(() => {
  const frames = prepareFrames([
    { label: 'Hello', nodes: [{ type: 'text', text: 'HELLO' }] },
  ]);
  display = mountDisplay(host.value, frames, { autoplay: false });
});
onUnmounted(() => display?.destroy());
</script>

<template><div ref="host" /></template>
```

Vue’s [mounted/unmounted hooks](https://vuejs.org/api/composition-api-lifecycle.html) keep the display’s lifetime aligned with its host.

## Svelte

```svelte
<script>
  import { onMount } from 'svelte';
  import { prepareFrames, mountDisplay } from 'nanodes';

  let host;
  onMount(() => {
    const frames = prepareFrames([
      { label: 'Hello', nodes: [{ type: 'text', text: 'HELLO' }] },
    ]);
    const display = mountDisplay(host, frames, { autoplay: false });
    return () => display.destroy();
  });
</script>

<div bind:this={host}></div>
```

Keep the `onMount` callback synchronous so Svelte uses its returned cleanup function. See the [lifecycle documentation](https://svelte.dev/docs/svelte/lifecycle-hooks).

## Astro

For static text, call `prepareTextFrame()` in component frontmatter, then render its escaped output in a `<pre aria-hidden="true">` using `.nanodes-text-art` inside `.nanodes-text`. Add a plain-text equivalent for assistive technology.

For animated or SVG content, import `prepareImageFrames`/`mountDisplay` in a processed `<script>` and mount into the host. The portfolio integration uses this pattern without a UI framework. If the host survives page navigation, align cleanup with that navigation lifecycle rather than creating duplicate instances. See [Astro’s processed scripts](https://docs.astro.build/guides/client-side-scripts/).

## Browser requirements and scope

Mounting requires DOM, `matchMedia`, `requestAnimationFrame` and `CSS.supports`; SVG preparation also requires Canvas 2D and Path2D. IntersectionObserver is optional: document visibility and manual pause still work without it. CSS uses container sizing, `color-mix()` and filters; rendering and fonts vary by browser.

Framework lifecycle examples are small integration recipes, not framework wrappers or a guarantee across every framework/browser version. Automated repository tests cover generation in Node and Chromium; wider browser compatibility remains a manual review responsibility.
