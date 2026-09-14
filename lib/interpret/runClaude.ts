import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { ERROR_MESSAGES, classifyError, createClaudeEventParser, type InterpretEvent } from "./claudeEvents";

export interface RunClaudeOptions {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
  bin?: string;
}

export function buildClaudeArgs(systemPrompt: string, model: string): string[] {
  return [
    "-p",
    "--output-format", "stream-json",
    "--verbose",
    "--include-partial-messages",
    "--tools", "",
    "--no-session-persistence",
    "--strict-mcp-config",
    "--setting-sources", "project",
    "--model", model,
    "--system-prompt", systemPrompt,
  ];
}

/** claude -p를 실행해 이벤트를 전달한다. 항상 resolve된다. */
export function runClaude(options: RunClaudeOptions, onEvent: (event: InterpretEvent) => void): Promise<void> {
  return new Promise((resolve) => {
    if (options.signal?.aborted) {
      resolve();
      return;
    }

    const env = { ...process.env };
    delete env.ANTHROPIC_API_KEY;
    delete env.ANTHROPIC_AUTH_TOKEN;

    const workDir = mkdtempSync(path.join(os.tmpdir(), "saju-claude-"));
    const parser = createClaudeEventParser();
    let settled = false;
    let terminalSent = false;
    let stderr = "";

    const emit = (event: InterpretEvent) => {
      if (settled || terminalSent) return;
      if (event.type !== "text") terminalSent = true;
      onEvent(event);
    };

    const settle = (finalEvent?: InterpretEvent) => {
      if (settled) return;
      if (finalEvent) emit(finalEvent);
      settled = true;
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", onAbort);
      rmSync(workDir, { recursive: true, force: true });
      resolve();
    };

    const child = spawn(options.bin ?? process.env.CLAUDE_BIN ?? "claude", buildClaudeArgs(options.systemPrompt, options.model ?? "sonnet"), {
      cwd: workDir,
      env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    /** SIGTERM을 보내고, 3초 안에 종료되지 않으면 SIGKILL로 확실히 정리한다. settle()은 이를 기다리지 않는다. */
    const terminate = () => {
      child.kill("SIGTERM");
      const killTimer = setTimeout(() => {
        if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
      }, 3_000);
      killTimer.unref();
    };

    const timer = setTimeout(() => {
      terminate();
      settle({ type: "error", code: "timeout", message: ERROR_MESSAGES.timeout });
    }, options.timeoutMs ?? 120_000);

    const onAbort = () => {
      terminalSent = true;
      terminate();
      settle();
    };
    options.signal?.addEventListener("abort", onAbort, { once: true });

    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => parser.push(chunk).forEach(emit));
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.on("error", (error: NodeJS.ErrnoException) => {
      settle(
        error.code === "ENOENT"
          ? { type: "error", code: "not_installed", message: ERROR_MESSAGES.not_installed }
          : { type: "error", code: "failed", message: `${ERROR_MESSAGES.failed} (${error.message})` },
      );
    });
    child.on("close", (code) => {
      parser.flush().forEach(emit);
      settle(code === 0 ? { type: "done" } : { type: "error", ...classifyError(stderr || `종료 코드 ${code}`) });
    });
    child.stdin.on("error", () => {
      // 프로세스가 먼저 종료되면 EPIPE가 날 수 있다. close 이벤트에서 처리한다.
    });
    child.stdin.end(options.userPrompt);
  });
}
