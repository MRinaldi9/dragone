#!/usr/bin/env node
/**
 * PostToolUse hook: runs oxfmt on the file Claude Code just edited, mirroring the "Format Dragone
 * UI staged files" job in lefthook.yml so `pnpm format:check` cannot fail in CI over formatting
 * alone.
 *
 * Reads the hook payload from stdin and takes `tool_input.file_path`. Exits 0 in every case except
 * a malformed payload: a formatter failure must not block the edit.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { extname, relative, resolve, sep } from 'node:path';

const FORMATTED = new Set(['.ts', '.html', '.css', '.js', '.mjs', '.json']);
/** Generated output: never reformat, it is not ours to touch. */
const SKIPPED_DIRS = new Set([
  '.angular',
  '.husky',
  'coverage',
  'dist',
  'node_modules',
  'out-tsc',
  'storybook-static'
]);

const readStdin = async () => {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
};

const projectDir = process.env['CLAUDE_PROJECT_DIR'] ?? process.cwd();

const raw = await readStdin();
if (raw.trim() === '') {
  process.exit(0);
}

let filePath = undefined;
try {
  filePath = JSON.parse(raw)?.tool_input?.file_path;
} catch {
  process.exit(0);
}

if (typeof filePath !== 'string' || filePath === '') {
  process.exit(0);
}

const absolute = resolve(projectDir, filePath);
const rel = relative(projectDir, absolute);

// Outside the project, or inside generated output.
if (rel === '' || rel.startsWith('..') || rel.split(sep).some(part => SKIPPED_DIRS.has(part))) {
  process.exit(0);
}

if (!FORMATTED.has(extname(absolute)) || !existsSync(absolute)) {
  process.exit(0);
}

try {
  execFileSync('pnpm', ['exec', 'oxfmt', absolute], {
    cwd: projectDir,
    shell: process.platform === 'win32',
    stdio: 'ignore'
  });
} catch {
  // Oxfmt rejects files it cannot parse (e.g. a half-written edit). Not a hook failure.
}

process.exit(0);
