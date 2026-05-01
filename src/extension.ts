import * as vscode from "vscode";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname } from "node:path";

const LANGUAGES = [
  "javascript",
  "javascriptreact",
  "typescript",
  "typescriptreact",
  "json",
  "jsonc",
  "css",
  "html",
  "vue",
  "svelte",
  "astro",
  "graphql",
  "yaml",
];

function resolveBunx(): string {
  const candidates = [
    `${process.env.HOME}/.bun/bin/bunx`,
    "/opt/homebrew/bin/bunx",
    "/usr/local/bin/bunx",
  ];
  for (const p of candidates) if (existsSync(p)) return p;
  return "bunx";
}

export function activate(context: vscode.ExtensionContext) {
  const output = vscode.window.createOutputChannel("Biome (bunx)");
  const bunx = resolveBunx();
  context.subscriptions.push(output);

  const provider: vscode.DocumentFormattingEditProvider = {
    async provideDocumentFormattingEdits(document) {
      const cwd =
        vscode.workspace.getWorkspaceFolder(document.uri)?.uri.fsPath ??
        dirname(document.uri.fsPath);
      const text = document.getText();

      try {
        const formatted = await runBiome(bunx, text, document.uri.fsPath, cwd);
        if (formatted === text) return [];
        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(text.length),
        );
        return [vscode.TextEdit.replace(fullRange, formatted)];
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        output.appendLine(`[${new Date().toISOString()}] ${msg}`);
        output.show(true);
        return [];
      }
    },
  };

  for (const lang of LANGUAGES) {
    context.subscriptions.push(
      vscode.languages.registerDocumentFormattingEditProvider(lang, provider),
    );
  }
}

function runBiome(
  bunx: string,
  input: string,
  filePath: string,
  cwd: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      bunx,
      ["@biomejs/biome", "format", `--stdin-file-path=${filePath}`],
      { cwd },
    );
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => {
      stdout += d.toString();
    });
    proc.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`biome exited ${code}: ${stderr || stdout}`));
    });
    proc.stdin.end(input);
  });
}
