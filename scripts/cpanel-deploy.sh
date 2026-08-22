#!/usr/bin/env bash

set -Eeuo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js and npm are not available to the cPanel deployment process." >&2
  echo "Enable Node.js 20.9+ for this application in cPanel, then deploy again." >&2
  exit 1
fi

NODE_IS_SUPPORTED="$(node -p "const [major, minor] = process.versions.node.split('.').map(Number); major > 20 || (major === 20 && minor >= 9)")"
if [[ "$NODE_IS_SUPPORTED" != "true" ]]; then
  echo "Node.js 20.9 or newer is required; cPanel is using $(node --version)." >&2
  exit 1
fi

echo "Installing dependencies with $(node --version) and npm $(npm --version)..."
npm ci --include=dev

echo "Building the production Next.js application..."
npm run build

echo "Removing development-only packages..."
npm prune --omit=dev

# Passenger watches this file and restarts the configured Node application.
mkdir -p tmp
touch tmp/restart.txt

echo "cPanel deployment completed successfully."
