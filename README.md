# Biome (bunx) Formatter

A minimal VSCode formatter that runs [Biome](https://biomejs.dev) via `bunx @biomejs/biome` — no global install, no local `node_modules` requirement.

## Why

The official Biome extension expects Biome to be installed in your project (or globally). This one doesn't: it shells out to `bunx`, which fetches and caches `@biomejs/biome` on first use. Useful when you work across many repos and don't want to install Biome in each one.

## Requirements

- [Bun](https://bun.sh) on your `PATH` (or at `~/.bun/bin/bunx`, `/opt/homebrew/bin/bunx`, or `/usr/local/bin/bunx`)
- A `biome.json` (or `biome.jsonc`) somewhere in the workspace — Biome auto-discovers it from the workspace folder

## Setup

Set this extension as the default formatter for the languages you want, in your User or Workspace `settings.json`:

```json
{
  "editor.formatOnSave": true,
  "[typescript]":      { "editor.defaultFormatter": "vladstudio.biome-bunx-formatter" },
  "[typescriptreact]": { "editor.defaultFormatter": "vladstudio.biome-bunx-formatter" },
  "[javascript]":      { "editor.defaultFormatter": "vladstudio.biome-bunx-formatter" },
  "[javascriptreact]": { "editor.defaultFormatter": "vladstudio.biome-bunx-formatter" },
  "[json]":            { "editor.defaultFormatter": "vladstudio.biome-bunx-formatter" },
  "[jsonc]":           { "editor.defaultFormatter": "vladstudio.biome-bunx-formatter" }
}
```

Reload the window. Hit your format shortcut (default ⌥⇧F on macOS) or save the file.

## Supported languages

JavaScript, TypeScript, JSX, TSX, JSON, JSONC, CSS, HTML, Vue, Svelte, Astro, GraphQL, YAML.

## How it works

On format, the extension spawns `bunx @biomejs/biome format --stdin-file-path=<file>` with `cwd` set to the workspace folder, pipes the buffer over stdin, and replaces the document with stdout. On nonzero exit (e.g. syntax error) it logs to the **Biome (bunx)** output channel and makes no edits — the file is never wiped.

First format is slow while bunx downloads `@biomejs/biome`; subsequent runs are fast (Bun caches the package).

## License

MIT
