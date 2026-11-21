import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/runtime.html?test");
  await page.waitForFunction(() => !!window.nanodes);
});

test("pause reasons compose and suspension leaves a readable target", async ({
  page,
}) => {
  const checks = await page.evaluate(() => {
    const { mountDisplay, prepareTextFrame } = window.nanodes;
    const frames = ["A", "B"].map((label) => ({
      label,
      color: "#a9c8ff",
      ascii: prepareTextFrame(label),
    }));
    const host = document.getElementById("host"),
      before = { ...testClock.pending },
      checks = [];
    const check = (value, label) => {
      if (!value) throw new Error(label);
      checks.push(label);
    };
    const controller = mountDisplay(host, frames, {
      duration: 80,
      interval: 120,
    });
    const display = host.firstElementChild,
      art = () => display.querySelector("pre").textContent;
    display.dispatchEvent(new MouseEvent("mouseenter"));
    controller.next();
    testClock.tick(16);
    testClock.tick(80);
    check(
      testClock.pending.intervals === 0 && art() === frames[1].ascii,
      "Manual selection does not defeat hover pause",
    );
    display.focus();
    display.dispatchEvent(new MouseEvent("mouseleave"));
    check(
      testClock.pending.intervals === 0,
      "Keyboard focus holds autoplay after pointer leaves",
    );
    controller.pause();
    display.blur();
    testClock.intersecting(false);
    testClock.intersecting(true);
    testClock.reduced(true);
    testClock.reduced(false);
    check(
      testClock.pending.intervals === 0,
      "Explicit pause survives focus, intersection, and motion events",
    );
    controller.play();
    controller.next();
    testClock.tick(16);
    testClock.tick(30);
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
    check(
      art() === frames[0].ascii &&
        testClock.pending.frames === 0 &&
        testClock.pending.intervals === 0,
      "Hidden tab settles and cancels all animation work",
    );
    controller.show(1);
    check(
      art() === frames[1].ascii && testClock.pending.frames === 0,
      "Hidden manual selection stays immediate",
    );
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
    testClock.tick(119);
    check(art() === frames[1].ascii, "Resume waits a full interval");
    testClock.tick(1);
    check(
      display.getAttribute("aria-label").startsWith("A."),
      "Resume advances at the interval deadline",
    );
    testClock.intersecting(false);
    check(
      art() === frames[0].ascii &&
        testClock.pending.frames === 0 &&
        testClock.pending.intervals === 0,
      "Offscreen display settles and suspends",
    );
    controller.pause();
    testClock.intersecting(true);
    controller.setTransition("none");
    controller.play();
    testClock.tick(60);
    controller.setTransition("shimmer");
    testClock.tick(59);
    check(
      art() === frames[0].ascii,
      "Transition change does not advance early",
    );
    testClock.tick(1);
    check(
      display.getAttribute("aria-label").startsWith("B."),
      "Transition change preserves exact timer deadline",
    );
    controller.destroy();
    controller.destroy();
    controller.play();
    controller.next();
    controller.setTransition("none");
    check(
      JSON.stringify(testClock.pending) === JSON.stringify(before) &&
        host.childElementCount === 0,
      "Destroy releases timers, frames, observers, listeners, and DOM",
    );
    for (let i = 0; i < 100; i++) {
      const instance = mountDisplay(host, frames);
      instance.destroy();
    }
    check(
      JSON.stringify(testClock.pending) === JSON.stringify(before) &&
        host.childElementCount === 0,
      "100 mount/destroy cycles leave no owned resources",
    );
    return checks;
  });
  expect(checks).toHaveLength(12);
});

test("Space activates on release, Enter on press, and glyph noise stays hidden", async ({
  page,
}) => {
  await page.evaluate(() => {
    const frames = ["HELLO", "WORLD"].map((label) => ({
      label,
      color: "#a9c8ff",
      ascii: nanodes.prepareTextFrame(label),
    }));
    window.controller = nanodes.mountDisplay(
      document.getElementById("host"),
      frames,
      { autoplay: false },
    );
  });
  const display = page.getByRole("button", { name: "HELLO. Show next item" });
  await page.evaluate(() => {
    const outside = document.createElement("button");
    outside.id = "outside";
    outside.textContent = "Outside focus target";
    document.body.prepend(outside);
  });
  const outside = page.locator("#outside");
  await outside.focus();
  await page.keyboard.down("Space");
  await display.focus();
  await page.keyboard.up("Space");
  await expect(display).toHaveAccessibleName("HELLO. Show next item");
  await page.keyboard.down("Space");
  await expect(display).toHaveAccessibleName("HELLO. Show next item");
  await page.keyboard.up("Space");
  await expect(page.locator(".nanodes-display")).toHaveAccessibleName(
    "WORLD. Show next item",
  );
  // Losing focus must also cancel a Space press that started on the display.
  await page.keyboard.down("Space");
  await outside.focus();
  await page.keyboard.up("Space");
  await page.keyboard.down("Space");
  await page.locator(".nanodes-display").focus();
  await page.keyboard.up("Space");
  await expect(page.locator(".nanodes-display")).toHaveAccessibleName(
    "WORLD. Show next item",
  );
  await page.keyboard.press("Enter");
  await expect(page.locator(".nanodes-display")).toHaveAccessibleName(
    "HELLO. Show next item",
  );
  await page.keyboard.down("Space");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.keyboard.up("Space");
  await expect(page.locator(".nanodes-display")).toHaveAccessibleName(
    "HELLO. Show next item",
  );
  await expect(page.locator("#host pre")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  expect(await page.locator("#host [aria-live]").count()).toBe(0);
  await page.evaluate(() => {
    testClock.tick(16);
    testClock.tick(320);
    controller.destroy();
  });
});

test("static, reduced-motion, and offscreen opt-out have bounded work", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const host = document.getElementById("host"),
      frames = ["A", "B"].map((label) => ({
        label,
        color: "#fff",
        ascii: nanodes.prepareTextFrame(label),
      }));
    const baseline = { ...testClock.pending };
    const still = nanodes.mountDisplay(host, [frames[0]]);
    testClock.tick(500);
    const staticWork =
      testClock.pending.frames === 0 && testClock.pending.intervals === 0;
    still.destroy();
    testClock.reduced(true);
    const reduced = nanodes.mountDisplay(host, frames);
    reduced.next();
    const reducedWork =
      testClock.pending.frames === 0 &&
      testClock.pending.intervals === 0 &&
      host.querySelector("pre").textContent === frames[1].ascii;
    reduced.destroy();
    testClock.reduced(false);
    const unobserved = nanodes.mountDisplay(host, frames, {
      pauseWhenOffscreen: false,
    });
    testClock.intersecting(false);
    const optOut =
      testClock.pending.observers === baseline.observers &&
      testClock.pending.intervals === 1;
    unobserved.destroy();
    testClock.intersecting(true);
    const Observer = window.IntersectionObserver;
    let fallback;
    try {
      window.IntersectionObserver = undefined;
      const instance = nanodes.mountDisplay(host, frames);
      fallback = testClock.pending.intervals === 1;
      instance.destroy();
    } finally {
      window.IntersectionObserver = Observer;
    }
    return {
      fallback,
      staticWork,
      reducedWork,
      optOut,
      cleanup: JSON.stringify(testClock.pending) === JSON.stringify(baseline),
    };
  });
  expect(result).toEqual({
    fallback: true,
    staticWork: true,
    reducedWork: true,
    optOut: true,
    cleanup: true,
  });
});

test("composition boundaries and invalid input do not allocate owned DOM", async ({
  page,
}) => {
  const checks = await page.evaluate(() => {
    const host = document.getElementById("host"),
      baseline = { ...testClock.pending };
    const rejects = (work) => {
      try {
        work();
        return false;
      } catch {
        return true;
      }
    };
    const scene = { label: "A", nodes: [{ type: "text", text: "A" }] };
    const exact = nanodes.prepareFrames([scene], { columns: 512, rows: 512 });
    const checks = [
      exact[0].ascii.split("\n").length === 512,
      exact[0].ascii.split("\n").every((row) => row.length === 512),
    ];
    checks.push(rejects(() => nanodes.prepareFrames([scene], { rows: 513 })));
    checks.push(
      rejects(() =>
        nanodes.prepareFrames([
          {
            label: "Too tall",
            nodes: Array.from({ length: 172 }, () => ({
              type: "text",
              text: "A",
            })),
          },
        ]),
      ),
    );
    checks.push(
      rejects(() =>
        nanodes.mountDisplay(host, [{ ascii: "A", label: "", color: "#fff" }]),
      ),
    );
    checks.push(
      rejects(() =>
        nanodes.mountDisplay(host, [
          { ascii: "A", label: "A", color: "not-a-color" },
        ]),
      ),
    );
    checks.push(
      host.childElementCount === 0 &&
        JSON.stringify(testClock.pending) === JSON.stringify(baseline),
    );
    return checks;
  });
  expect(checks).toEqual(Array(7).fill(true));
});

for (const frameCount of [1, 2]) {
  test(`native offscreen handling covers ${frameCount}-frame manual transitions`, async ({
    page,
  }) => {
    await page.goto("/tests/runtime.html");
    await page.waitForFunction(() => !!window.nanodes);
    await page.evaluate((frameCount) => {
      const nativeRAF = requestAnimationFrame.bind(window);
      window.frameRequests = 0;
      window.requestAnimationFrame = (callback) => {
        frameRequests++;
        return nativeRAF(callback);
      };
      const host = document.getElementById("host");
      host.style.marginTop = "2000px";
      const frames = ["A", "B"].slice(0, frameCount).map((label) => ({
        label,
        color: "#fff",
        ascii: nanodes.prepareTextFrame(label),
      }));
      window.controller = nanodes.mountDisplay(host, frames, {
        duration: 30,
        interval: 70,
      });
    }, frameCount);
    await page.waitForTimeout(120);
    const before = await page.evaluate(() => window.frameRequests);
    await page.evaluate(() => controller.show(0));
    await page.waitForTimeout(180);
    expect(await page.evaluate(() => window.frameRequests)).toBe(before);
    await page.locator("#host").scrollIntoViewIfNeeded();
    await expect
      .poll(async () => {
        if (frameCount === 1) await page.evaluate(() => controller.show(0));
        return page.evaluate(() => window.frameRequests);
      })
      .toBeGreaterThan(before);
    await page.evaluate(() => controller.destroy());
  });
}

test("reduced-motion CSS and accessible names work without site styles", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/tests/runtime.html");
  await page.waitForFunction(() => !!window.nanodes);
  await page.evaluate(() => {
    const frames = nanodes.prepareImageFrames([
      { name: "Square", color: "#a9c8ff", svg: "M2 2H22V22H2Z" },
    ]);
    window.controller = nanodes.mountDisplay(
      document.getElementById("host"),
      frames,
    );
  });
  await expect(page.getByRole("img")).toHaveAccessibleName("Square");
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const results = await page.evaluate(() =>
    axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    }),
  );
  expect(results.violations).toEqual([]);
  await page.locator(".nanodes-image").hover();
  expect(
    await page
      .locator(".nanodes-visual-wrapper")
      .evaluate((element) => getComputedStyle(element).transitionDuration),
  ).toBe("0s");
  await page.evaluate(() => controller.destroy());
});

test("interruption cancels animation frame identifier zero", async ({
  page,
}) => {
  await page.goto("/tests/runtime.html?test&zero");
  await page.waitForFunction(() => !!window.nanodes);
  const clean = await page.evaluate(() => {
    const baseline = { ...testClock.pending };
    const host = document.getElementById("host");
    const frames = ["A", "B"].map((label) => ({
      label,
      color: "#fff",
      ascii: nanodes.prepareTextFrame(label),
    }));
    const controller = nanodes.mountDisplay(host, frames);
    controller.next();
    const interrupted = testClock.pending.frames === 1;
    controller.destroy();
    return (
      interrupted &&
      JSON.stringify(testClock.pending) === JSON.stringify(baseline)
    );
  });
  expect(clean).toBe(true);
});

for (const [suite, label] of [
  [
    "runDisplayChecks",
    "display variants, independent instances, and selection",
  ],
  ["runApiChecks", "snapshots, timing, composition, and invalid browser input"],
]) {
  test(`standalone API checks: ${label}`, async ({ page }) => {
    const result = await page.evaluate(async (suite) => {
      const { [suite]: run } = await import("/tests/browser-api.mjs");
      const before = JSON.stringify(testClock.pending);
      const checks = [];
      run(window, window.nanodes, (condition, message) => {
        if (!condition) throw new Error(message);
        checks.push(message);
      });
      return {
        count: checks.length,
        clean: JSON.stringify(testClock.pending) === before,
      };
    }, suite);
    expect(result.count).toBeGreaterThan(0);
    expect(result.clean).toBe(true);
  });
}
