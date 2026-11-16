// @ts-check

/**
 * Custom Oxlint JS plugin (using Oxlint's `createOnce` alternative API) enforcing concise,
 * consumer-facing JSDoc in `@dragone/ui`:
 *
 * 1. `/** JSDoc *\/` is reserved for exported public API symbols (never in `.spec.ts`, never on
 *    `private` / `protected` / `#private` members, never on non-exported helpers).
 * 2. No ADR citations (`ADR-XXXX`) or implementation-rationale clauses (`because`, `hence`, `which is
 *    why`, `so that`, `instead of`, `deliberately`, `intentionally`) in JSDoc prose.
 * 3. Strict prose line budget: max 2 prose lines on class/interface members, max 4 prose lines on
 *    top-level exported declarations (excluding `@tag` lines and fenced code blocks).
 */

const RATIONALE_PATTERN =
  /\b(ADR-\d+|because|hence|which is why|for the same reason|deliberately|intentionally|so that|instead of)\b/i;

const REDUNDANT_TS_TYPE_TAG_PATTERN =
  /^\s*@(?:param|returns?|type|typedef|property|prop)\s+\{[^}]+\}/m;

const MEMBER_NODE_TYPES = new Set([
  'PropertyDefinition',
  'MethodDefinition',
  'AccessorProperty',
  'TSAbstractPropertyDefinition',
  'TSAbstractMethodDefinition',
  'TSPropertySignature',
  'TSMethodSignature'
]);

const TOP_LEVEL_DECL_TYPES = new Set([
  'ClassDeclaration',
  'FunctionDeclaration',
  'VariableDeclaration',
  'TSTypeAliasDeclaration',
  'TSInterfaceDeclaration',
  'TSEnumDeclaration'
]);

const METADATA_TAG_PATTERN =
  /^@(?:default(?:Value)?|deprecated|param|returns?|see|throws|template|typeParam)\b/;

/**
 * Strip leading `*` and whitespace from each line of a JSDoc block value.
 *
 * @param {string} rawValue
 * @returns {string[]}
 */
function extractJsdocLines(rawValue) {
  return rawValue.split(/\r?\n/).map(line => line.replace(/^\s*\*\s?/, '').trim());
}

/**
 * Extract only the prose lines of a JSDoc block, excluding empty lines, fenced code blocks,
 * `@example` blocks, and concise metadata `@tag` lines. Narrative tags (`@note`, `@remarks`,
 * `@usageNotes`, `@description`) still count as prose so rationale cannot hide behind a tag.
 *
 * @param {string} rawValue
 * @returns {string[]}
 */
function extractProseLines(rawValue) {
  const lines = extractJsdocLines(rawValue);
  /** @type {string[]} */
  const prose = [];
  let inCodeBlock = false;
  let inExampleBlock = false;
  let inMetadataTag = false;

  for (const line of lines) {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock || line.length === 0) {
      continue;
    }
    if (line.startsWith('@example')) {
      inExampleBlock = true;
      inMetadataTag = false;
      continue;
    }
    if (line.startsWith('@')) {
      inExampleBlock = false;
      if (METADATA_TAG_PATTERN.test(line)) {
        inMetadataTag = true;
        continue;
      }
      inMetadataTag = false;
      const tagContent = line.replace(/^@\w+\s*/, '').trim();
      if (tagContent.length > 0) {
        prose.push(tagContent);
      }
      continue;
    }
    if (!inExampleBlock && !inMetadataTag) {
      prose.push(line);
    }
  }
  return prose;
}

/**
 * Extract all non-code text from a JSDoc block (including tag descriptions) to check for rationale
 * keywords.
 *
 * @param {string} rawValue
 * @returns {string}
 */
function extractAllNonCodeText(rawValue) {
  const lines = extractJsdocLines(rawValue);
  /** @type {string[]} */
  const text = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (!inCodeBlock && line.length > 0) {
      text.push(line);
    }
  }
  return text.join(' ').replace(/`[^`]*`/g, '');
}

/**
 * Find the AST declaration node immediately following a JSDoc comment.
 *
 * @param {any} sourceCode
 * @param {any} comment
 * @returns {any | null}
 */
function findTargetNode(sourceCode, comment) {
  const tokenAfter = sourceCode.getTokenAfter(comment, { includeComments: false });
  if (!tokenAfter) {
    return null;
  }
  let node = sourceCode.getNodeByRangeIndex(tokenAfter.range[0]);
  while (
    node &&
    node.parent &&
    node.parent.type !== 'Program' &&
    node.parent.type !== 'ClassBody' &&
    node.parent.type !== 'TSInterfaceBody' &&
    node.parent.type !== 'TSTypeLiteral' &&
    node.type !== 'ExportNamedDeclaration' &&
    node.type !== 'ExportDefaultDeclaration'
  ) {
    node = node.parent;
  }
  return node;
}

/**
 * Collect local identifier names exported via `export { Foo, Bar as Baz }` in the file.
 *
 * @param {any} programNode
 * @returns {Set<string>}
 */
function collectSpecifierExportedNames(programNode) {
  const names = new Set();
  for (const stmt of programNode.body ?? []) {
    if (stmt.type === 'ExportNamedDeclaration' && !stmt.declaration && stmt.specifiers) {
      for (const spec of stmt.specifiers) {
        const localName = spec.local?.name ?? spec.local?.value;
        if (typeof localName === 'string') {
          names.add(localName);
        }
      }
    }
  }
  return names;
}

/**
 * Whether a top-level declaration node is exported from the module.
 *
 * @param {any} node
 * @param {Set<string>} exportedNames
 * @returns {boolean}
 */
function isExportedTopLevel(node, exportedNames) {
  if (!node) {
    return false;
  }
  if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
    return true;
  }
  if (
    node.parent?.type === 'ExportNamedDeclaration' ||
    node.parent?.type === 'ExportDefaultDeclaration'
  ) {
    return true;
  }
  if (node.id?.name && exportedNames.has(node.id.name)) {
    return true;
  }
  if (node.type === 'VariableDeclaration') {
    return (node.declarations ?? []).some(
      /** @param {any} d */ d => d.id?.name && exportedNames.has(d.id.name)
    );
  }
  return false;
}

const conciseJsdocRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce concise, consumer-focused JSDoc on exported API symbols and forbid implementation rationale in JSDoc.'
    },
    schema: [],
    messages: {
      noJsdocInSpec:
        'Do not use "/** JSDoc */" in test files; use "//" line comments for test notes.',
      noJsdocOnNonPublicMember:
        'Do not use "/** JSDoc */" on {{visibility}} class members; reserve JSDoc for public API and use "//" when an implementation note is needed.',
      noJsdocOnInternalSymbol:
        'Do not use "/** JSDoc */" on non-exported internal declarations; use "//" line comments only if the code is not self-explanatory.',
      noRationaleInJsdoc:
        'Keep implementation rationale ("{{keyword}}") out of JSDoc; state only what the API does for consumers, and move "why" to "//" comments or docs/adr/.',
      memberJsdocTooLong:
        'Member JSDoc has {{count}} prose lines (max 2). Keep property/method JSDoc to 1–2 concise sentences.',
      topLevelJsdocTooLong:
        'Top-level JSDoc has {{count}} prose lines (max 4, excluding code blocks and @tags). Keep class/function JSDoc brief and consumer-focused.',
      noRedundantTypeInTsJsdoc:
        'Do not declare "{type}" annotations in TypeScript JSDoc tags; rely on TypeScript types instead.'
    }
  },
  /** @param {any} context */
  createOnce(context) {
    let isSpecFile = false;
    let isStoryFile = false;

    return {
      before() {
        const { filename, sourceCode } = context;
        if (filename.endsWith('.d.ts') || !sourceCode.text.includes('/**')) {
          return false;
        }
        isSpecFile = filename.endsWith('.spec.ts') || filename.endsWith('.test.ts');
        isStoryFile = filename.endsWith('.stories.ts') || filename.endsWith('.story.ts');
      },
      /** @param {any} programNode */
      Program(programNode) {
        const { sourceCode } = context;
        const comments = sourceCode.getAllComments();
        const exportedNames = collectSpecifierExportedNames(programNode);

        for (const comment of comments) {
          if (comment.type !== 'Block' || !comment.value.startsWith('*')) {
            continue;
          }

          if (isSpecFile) {
            context.report({
              loc: comment.loc,
              messageId: 'noJsdocInSpec'
            });
            continue;
          }

          const target = findTargetNode(sourceCode, comment);
          if (!target) {
            continue;
          }

          // Check visibility on class members
          if (MEMBER_NODE_TYPES.has(target.type)) {
            if (target.key?.type === 'PrivateIdentifier') {
              context.report({
                loc: comment.loc,
                messageId: 'noJsdocOnNonPublicMember',
                data: { visibility: '#private' }
              });
              continue;
            }
            if (target.accessibility === 'private' || target.accessibility === 'protected') {
              context.report({
                loc: comment.loc,
                messageId: 'noJsdocOnNonPublicMember',
                data: { visibility: target.accessibility }
              });
              continue;
            }
          }

          // Check non-exported top-level declarations (except in story files where Meta/helpers might sit)
          if (
            !isStoryFile &&
            TOP_LEVEL_DECL_TYPES.has(target.type) &&
            !isExportedTopLevel(target, exportedNames)
          ) {
            context.report({
              loc: comment.loc,
              messageId: 'noJsdocOnInternalSymbol'
            });
            continue;
          }

          if (REDUNDANT_TS_TYPE_TAG_PATTERN.test(comment.value)) {
            context.report({
              loc: comment.loc,
              messageId: 'noRedundantTypeInTsJsdoc'
            });
          }

          // Check prose for rationale keywords and line length budget
          const proseLines = extractProseLines(comment.value);
          const allNonCodeText = extractAllNonCodeText(comment.value);
          const rationaleMatch = RATIONALE_PATTERN.exec(allNonCodeText);
          if (rationaleMatch) {
            context.report({
              loc: comment.loc,
              messageId: 'noRationaleInJsdoc',
              data: { keyword: rationaleMatch[1] }
            });
          }

          if (MEMBER_NODE_TYPES.has(target.type)) {
            if (proseLines.length > 2) {
              context.report({
                loc: comment.loc,
                messageId: 'memberJsdocTooLong',
                data: { count: String(proseLines.length) }
              });
            }
          } else if (proseLines.length > 4) {
            context.report({
              loc: comment.loc,
              messageId: 'topLevelJsdocTooLong',
              data: { count: String(proseLines.length) }
            });
          }
        }
      }
    };
  }
};

export default {
  meta: {
    name: 'dragone'
  },
  rules: {
    'concise-jsdoc': conciseJsdocRule
  }
};
