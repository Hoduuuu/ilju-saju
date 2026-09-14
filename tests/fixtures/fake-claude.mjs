#!/usr/bin/env node
const mode = process.env.FAKE_CLAUDE_MODE ?? "ok";
const out = (value) => process.stdout.write(`${JSON.stringify(value)}\n`);

let stdin = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  stdin += chunk;
});
process.stdin.on("end", () => {
  if (mode === "hang") {
    setTimeout(() => {}, 60_000);
    return;
  }
  if (mode === "exit1") {
    process.stderr.write("boom\n");
    process.exit(1);
  }
  out({ type: "system", subtype: "init" });
  if (mode === "auth") {
    out({ type: "result", subtype: "success", is_error: true, result: "Not logged in · Please run /login" });
    return;
  }
  const leaked = Boolean(
    process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || process.env.CF_API_TOKEN || process.env.CF_ACCOUNT_ID,
  );
  const text = `## [summary]\n키워드: 가, 나, 다\nARGS:${process.argv.slice(2).join("|")}\nLEAKED:${leaked}\nSTDIN:${stdin}`;
  for (const piece of [text.slice(0, 12), text.slice(12)]) {
    out({ type: "stream_event", event: { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: piece } } });
  }
  out({ type: "result", subtype: "success", is_error: false, result: text });
});
