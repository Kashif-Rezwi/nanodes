import { chromium } from "@playwright/test";
import { spawn, execFileSync } from "node:child_process";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import os from "node:os";

const name = process.argv[2] ?? "current";
if (!["baseline", "current"].includes(name))
  throw new Error("Use baseline or current.");
const directory = name === "baseline" ? ".reference/phase3-baseline" : "dist";
const server = spawn(process.execPath, ["scripts/serve.mjs"], {
  env: { ...process.env, PORT: process.env.PORT ?? "0" },
  stdio: ["ignore", "pipe", "pipe", "ipc"],
});
let browser;
try {
  const port = await new Promise((resolve, reject) => {
    let stderr = "";
    server.stderr.on("data", (chunk) => {
      stderr = (stderr + chunk).slice(-4000);
    });
    const finish = (error, port) => {
      clearTimeout(timer);
      server.off("message", onMessage);
      server.off("error", onError);
      server.off("exit", onExit);
      if (error) reject(error);
      else resolve(port);
    };
    const onMessage = (message) => {
      if (message?.type === "listening") finish(null, message.port);
    };
    const onError = (error) => finish(error);
    const onExit = () =>
      finish(
        new Error("Measurement server exited before listening. " + stderr),
      );
    const timer = setTimeout(
      () => finish(new Error("Measurement server timed out before listening.")),
      5000,
    );
    server.on("message", onMessage);
    server.once("error", onError);
    server.once("exit", onExit);
  });
  const origin = "http://127.0.0.1:" + port;
  browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.goto(origin + "/tests/runtime.html");
  const measurements = await page.evaluate(async (directory) => {
    const api = await import("/" + directory + "/index.js");
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const percentile = (values, fraction) =>
      [...values].sort((a, b) => a - b)[
        Math.min(values.length - 1, Math.floor(values.length * fraction))
      ] ?? 0;
    const timing = (work) => {
      const values = [];
      for (let i = 0; i < 45; i++) {
        const start = performance.now();
        work();
        if (i >= 5) values.push(performance.now() - start);
      }
      return { median: percentile(values, 0.5), p95: percentile(values, 0.95) };
    };
    const items = [
      { name: "SQUARE", color: "#a9c8ff", svg: "M2 2H22V22H2Z" },
      {
        name: "SPARK",
        color: "#c5baff",
        svg: "M12 1L15 9L23 12L15 15L12 23L9 15L1 12L9 9Z",
      },
      {
        name: "RING",
        color: "#aacfee",
        svg: "M12 1A11 11 0 1 0 12 23A11 11 0 1 0 12 1ZM12 5A7 7 0 1 1 12 19A7 7 0 1 1 12 5Z",
      },
    ];
    const preparation = {
      text: timing(() => api.prepareTextFrame("FULL STACK ENGINEER")),
      svg3: timing(() => api.prepareImageFrames(items)),
    };
    const nativeRAF = requestAnimationFrame.bind(window),
      nativeCancel = cancelAnimationFrame.bind(window);
    const nativeInterval = setInterval.bind(window),
      nativeClear = clearInterval.bind(window);
    const activeFrames = new Set(),
      activeIntervals = new Set();
    let requests = 0;
    const costs = [];
    window.requestAnimationFrame = (callback) => {
      requests++;
      const id = nativeRAF((time) => {
        activeFrames.delete(id);
        const start = performance.now();
        callback(time);
        costs.push(performance.now() - start);
      });
      activeFrames.add(id);
      return id;
    };
    window.cancelAnimationFrame = (id) => {
      activeFrames.delete(id);
      nativeCancel(id);
    };
    window.setInterval = (callback, delay) => {
      const id = nativeInterval(callback, delay);
      activeIntervals.add(id);
      return id;
    };
    window.clearInterval = (id) => {
      activeIntervals.delete(id);
      nativeClear(id);
    };
    const host = document.getElementById("host"),
      frames = api.prepareImageFrames(items);
    const lifecycle = timing(() => {
      const controller = api.mountDisplay(host, frames, { autoplay: false });
      controller.destroy();
    });
    const controller = api.mountDisplay(host, frames, { autoplay: false });
    await wait(100);
    let before = requests;
    await wait(350);
    const idleRequests = requests - before;
    costs.length = 0;
    for (let i = 0; i < 8; i++) {
      controller.next();
      await wait(380);
    }
    const transitionCallback = {
      samples: costs.length,
      median: percentile(costs, 0.5),
      p95: percentile(costs, 0.95),
    };
    controller.destroy();
    host.style.marginTop = "2000px";
    const offscreen = api.mountDisplay(host, frames, {
      interval: 100,
      duration: 80,
    });
    await wait(250);
    before = requests;
    await wait(350);
    const offscreenRequests = requests - before;
    offscreen.destroy();
    for (let i = 0; i < 100; i++) {
      const item = api.mountDisplay(host, frames, { autoplay: false });
      item.destroy();
    }
    const cleanup = {
      activeFrames: activeFrames.size,
      activeIntervals: activeIntervals.size,
      ownedElements: host.childElementCount,
    };
    return {
      preparation,
      lifecycle,
      transitionCallback,
      idleRequests,
      offscreenRequests,
      cleanup,
    };
  }, directory);
  const names = (await readdir(directory)).filter((file) =>
    /\.(js|css)$/.test(file),
  );
  const runtime = Buffer.concat(
    await Promise.all(
      names.sort().map((file) => readFile(directory + "/" + file)),
    ),
  );
  const pack = JSON.parse(
    execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
      encoding: "utf8",
    }),
  )[0];
  const report = {
    name,
    date: new Date().toISOString(),
    environment: {
      os: os.platform() + " " + os.release(),
      arch: os.arch(),
      cpu: os.cpus()[0].model,
      node: process.version,
      browser: browser.version(),
      viewport: "1440x900",
    },
    units: "milliseconds; callback CPU excludes style/layout/paint",
    ...measurements,
    runtimeBytes: runtime.length,
    runtimeGzipBytes: gzipSync(runtime).length,
    repositoryPackBytes: pack.size,
    repositoryPackFiles: pack.entryCount,
  };
  await mkdir(".reference/phase3", { recursive: true });
  await writeFile(
    ".reference/phase3/" + name + ".json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  try {
    await browser?.close();
  } finally {
    server.kill();
  }
}
