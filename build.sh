#!/bin/bash
set -e
code --uninstall-extension vladstudio.biome-bunx-formatter || true
rm -f biome-bunx-formatter-*.vsix
bun run compile
vsce package
code --install-extension biome-bunx-formatter-*.vsix
