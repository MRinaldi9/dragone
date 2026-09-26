// @ts-check
import stylelint from 'stylelint';

/**
 * Minimal structural view of the postcss nodes this rule walks. Only the properties the rule reads
 * are declared; everything else stays untyped.
 *
 * @typedef {CssRuleNode | CssAtRuleNode | CssRootNode} CssNode
 */

/**
 * @typedef {object} CssBaseNode
 * @property {CssNode | undefined} parent
 */

/** @typedef {CssBaseNode & { type: 'rule'; selector: string }} CssRuleNode */

/** @typedef {CssBaseNode & { type: 'atrule'; name: string }} CssAtRuleNode */

/** @typedef {CssBaseNode & { type: 'root' }} CssRootNode */

const ruleName = 'dragone/no-host-nesting';

const {
  createPlugin,
  utils: { ruleMessages, validateOptions, report }
} = stylelint;

/**
 * @param {string} nested
 * @param {string} ancestor
 * @returns {string}
 */
function formatRejected(nested, ancestor) {
  return `Unexpected nesting "${nested}" under host selector "${ancestor}" (see ADR-0008)`;
}

const messages = ruleMessages(ruleName, { rejected: formatRejected });

/**
 * Depth change for CSS nesting brackets.
 *
 * @param {string} char
 * @returns {number}
 */
function depthDelta(char) {
  if (char === '{' || char === '(' || char === '[') {
    return 1;
  }
  if (char === '}' || char === ')' || char === ']') {
    return -1;
  }
  return 0;
}

/**
 * @param {number} depth
 * @param {string} char
 * @returns {number}
 */
function shiftDepth(depth, char) {
  return Math.max(0, depth + depthDelta(char));
}

/**
 * Split a selector list on top-level commas (ignoring `()`, `[]` and strings).
 *
 * @param {string} selector
 * @returns {string[]}
 */
function splitSelectors(selector) {
  const parts = [];
  let current = '';
  let depth = 0;
  let quote = null;
  for (const char of selector) {
    if (quote !== null) {
      current += char;
      if (char === quote) {
        quote = null;
      }
    } else if (char === '"' || char === "'") {
      quote = char;
      current += char;
    } else {
      depth = shiftDepth(depth, char);
      if (char === ',' && depth === 0) {
        parts.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  parts.push(current);
  return parts;
}

/**
 * @param {string} char
 * @returns {boolean}
 */
function isCombinator(char) {
  return (
    char === ' ' || char === '\t' || char === '\n' || char === '>' || char === '+' || char === '~'
  );
}

/**
 * True when a single selector targets the host element itself (`:host`, `:host(...)`,
 * `:host:pseudo`, `:host[attr]`, ...). Descendant selectors (`:host button`, `:host(.expanded) ol`)
 * target content and return false: combinators inside `()`/`[]`/strings don't count.
 *
 * @param {string} selector
 * @returns {boolean}
 */
function targetsHost(selector) {
  const trimmed = selector.trim();
  if (!trimmed.startsWith(':host')) {
    return false;
  }
  let depth = 0;
  let quote = null;
  for (const char of trimmed) {
    if (quote !== null) {
      if (char === quote) {
        quote = null;
      }
    } else if (char === '"' || char === "'") {
      quote = char;
    } else {
      depth = shiftDepth(depth, char);
      if (depth === 0 && isCombinator(char)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Selector of the nearest ancestor rule when it targets the host, else null. At-rules are
 * transparent (`@media`); `@keyframes` blocks are skipped.
 *
 * @param {CssNode} rule
 * @returns {string | null}
 */
function nearestHostAncestor(rule) {
  let { parent } = rule;
  while (parent !== undefined && parent.type !== 'root') {
    if (parent.type === 'atrule') {
      if (parent.name === 'keyframes') {
        return null;
      }
    } else if (parent.type === 'rule') {
      return splitSelectors(parent.selector).some(targetsHost) ? parent.selector : null;
    }
    parent = parent.parent;
  }
  return null;
}

/**
 * @param {unknown} primary
 * @returns {(root: any, result: any) => void}
 */
function ruleFunction(primary) {
  /**
   * @param {any} root
   * @param {any} result
   */
  function check(root, result) {
    if (!primary) {
      return;
    }
    const validOptions = validateOptions(result, ruleName, { actual: primary });
    if (!validOptions) {
      return;
    }
    root.walkRules(
      /** @param {CssRuleNode} rule */
      rule => {
        const ancestor = nearestHostAncestor(rule);
        if (ancestor !== null) {
          report({
            message: messages.rejected(rule.selector, ancestor),
            // Boundary cast: the minimal CssNode view over the real postcss Node.
            node: /** @type {any} */ (rule),
            result,
            ruleName
          });
        }
      }
    );
  }
  return check;
}

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;

export default createPlugin(ruleName, ruleFunction);
