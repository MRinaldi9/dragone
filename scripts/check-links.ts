import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

interface BrokenLink {
  file: string;
  line: number;
  link: string;
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const IGNORED_DIRS = new Set([
  '.angular',
  '.git',
  '.husky',
  'coverage',
  'dist',
  'node_modules',
  'storybook-static'
]);

/** Docs that must keep their relative links valid. */
const isCheckedDoc = (filePath: string): boolean => {
  const rel = relative(ROOT, filePath).split(sep).join('/');
  return rel === 'AGENTS.md' || rel.endsWith('/AGENTS.md') || rel.startsWith('docs/');
};

const collectMarkdown = (dir: string): string[] => {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        found.push(...collectMarkdown(full));
      }
    } else if (extname(entry.name) === '.md' && isCheckedDoc(full)) {
      found.push(full);
    }
  }
  return found;
};

/** Blank out fenced blocks (keeping newlines) and inline code so examples are skipped. */
const stripCode = (text: string): string =>
  text.replace(/```[\s\S]*?```/g, block => block.replace(/[^\n]/g, '')).replace(/`[^`\n]*`/g, '');

const isExternal = (link: string): boolean => /^(?:[a-z][a-z\d+.-]*:|#|\/\/)/i.test(link);

const decode = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const lineAt = (text: string, index: number): number => text.slice(0, index).split('\n').length;

const isBrokenLink = (file: string, link: string): boolean => {
  if (isExternal(link)) {
    return false;
  }
  const path = decode(link.split('#')[0]);
  return path !== '' && !existsSync(resolve(dirname(file), path));
};

const findBrokenLinks = (file: string): BrokenLink[] => {
  const text = stripCode(readFileSync(file, 'utf8'));
  const pattern = /\[[^\]]*\]\((?<target>[^)\s]+)(?:\s+"[^"]*")?\)/g;
  const broken: BrokenLink[] = [];
  for (const match of text.matchAll(pattern)) {
    const link = match.groups?.['target'];
    if (link !== undefined && isBrokenLink(file, link)) {
      broken.push({ file: relative(ROOT, file), line: lineAt(text, match.index ?? 0), link });
    }
  }
  return broken;
};

const main = (): number => {
  const files = collectMarkdown(ROOT);
  const broken = files.flatMap(file => findBrokenLinks(file));

  if (broken.length > 0) {
    for (const item of broken) {
      console.error(`${item.file}:${item.line} -> ${item.link}`);
    }
    console.error(`\n${broken.length} broken link(s) found.`);
    return 1;
  }

  process.stdout.write(`Checked ${files.length} markdown files: all relative links resolve.\n`);
  return 0;
};

process.exit(main());
