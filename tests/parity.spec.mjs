import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";

for (const width of [1440, 390]) {
  test(`portfolio glyphs and settled pixels match at ${width}px`, async ({
    page,
  }) => {
    test.skip(
      !existsSync(".reference/items.json"),
      "Generate the pinned portfolio fixtures with npm run reference first.",
    );
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/tests/browser.html");
    await page.waitForFunction(
      () =>
        document.getElementById("original").contentWindow.reference &&
        document.getElementById("extracted").contentWindow.extracted,
    );
    await page.evaluate(() => {
      for (const id of ["original", "extracted"]) {
        const win = document.getElementById(id).contentWindow;
        win.testClock.tick(16);
        win.testClock.tick(320);
      }
    });
    const original = page
      .frameLocator("#original")
      .locator("#tech-ascii-display");
    const extracted = page.frameLocator("#extracted").locator(".nanodes-art");
    // Compare in the same browser and viewport; no cross-platform golden font files.
    await page.mouse.move(width - 1, 899);
    // Use the same pixel origin: Firefox rounds stacked fractional iframe positions differently.
    const styles = await page.evaluate(() =>
      ["original", "extracted"].map((id) => {
        const frame = document.getElementById(id),
          style = frame.getAttribute("style"),
          size = frame.getBoundingClientRect();
        frame.style.cssText = `position:fixed;left:0;top:0;width:${size.width}px;height:${size.height}px;max-width:none;visibility:hidden`;
        return style;
      }),
    );
    await page
      .locator("#original")
      .evaluate((frame) => (frame.style.visibility = "visible"));
    const sourcePixels = await original.screenshot({ animations: "disabled" });
    await page
      .locator("#original")
      .evaluate((frame) => (frame.style.visibility = "hidden"));
    await page
      .locator("#extracted")
      .evaluate((frame) => (frame.style.visibility = "visible"));
    expect(
      sourcePixels.equals(
        await extracted.screenshot({ animations: "disabled" }),
      ),
    ).toBe(true);
    await page.evaluate(
      (styles) =>
        ["original", "extracted"].forEach((id, index) => {
          const frame = document.getElementById(id);
          if (styles[index] === null) frame.removeAttribute("style");
          else frame.setAttribute("style", styles[index]);
        }),
      styles,
    );
    const checks = await page.evaluate(() => window.runParityChecks());
    expect(checks).toContain(
      "All 25 settled SVG/label frames match byte for byte",
    );
    expect(checks).toContain(
      "Contact text typography, dimensions, color, and glow match",
    );
  });
}
