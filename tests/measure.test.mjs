import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { fork, spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

const cwd = fileURLToPath(new URL("..", import.meta.url));

test(
  "measurement rejects an occupied port without querying its existing server",
  { timeout: 10000 },
  async (t) => {
    let requests = 0;
    const occupied = createServer((request, response) => {
      requests++;
      response.writeHead(200).end("Another server");
    });
    await new Promise((resolve) => occupied.listen(0, "127.0.0.1", resolve));
    t.after(() => new Promise((resolve) => occupied.close(resolve)));
    const child = spawn(process.execPath, ["scripts/measure.mjs"], {
      cwd,
      env: { ...process.env, PORT: String(occupied.address().port) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    t.after(() => {
      if (child.exitCode === null) child.kill();
    });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    const [code] = await once(child, "close");
    assert.notEqual(code, 0);
    assert.match(stderr, /exited before listening|EADDRINUSE/);
    assert.equal(requests, 0);
  },
);

test(
  "fixture server reports its own ephemeral port and closes with its parent channel",
  { timeout: 10000 },
  async (t) => {
    const child = fork("scripts/serve.mjs", [], {
      cwd,
      env: { ...process.env, PORT: "0" },
      stdio: ["ignore", "pipe", "pipe", "ipc"],
    });
    t.after(() => {
      if (child.exitCode === null) child.kill();
    });
    const [message] = await once(child, "message");
    assert.equal(message.type, "listening");
    assert.ok(Number.isInteger(message.port) && message.port > 0);
    const response = await fetch(
      "http://127.0.0.1:" + message.port + "/tests/runtime.html",
    );
    assert.equal(response.status, 200);
    assert.match(await response.text(), /Nanodes runtime tests/);
    const exited = once(child, "exit");
    child.disconnect();
    const [code] = await exited;
    assert.equal(code, 0);
  },
);
