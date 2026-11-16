import type { PageWindowEllipsis, PageWindowItem, PageWindowPage } from '../pagination.model';

const ELLIPSIS_BEFORE: PageWindowEllipsis = { kind: 'ellipsis', key: 'ellipsis-before' };
const ELLIPSIS_AFTER: PageWindowEllipsis = { kind: 'ellipsis', key: 'ellipsis-after' };

function pageCell(page: number): PageWindowPage {
  return { kind: 'page', key: `page-${page}`, page };
}

function pageRange(start: number, end: number): number[] {
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
}

// Builds the cells for a single candidate window (`[1, …, start..end, …, pageCount]`).
// The leading ellipsis is kept whenever `start > 1` to hold the strip's fixed width; the trailing
// ellipsis appears only when it actually hides a page (`end < pageCount - 1`).
function windowCells(start: number, end: number, pageCount: number): PageWindowItem[] {
  const cells: PageWindowItem[] = [];

  if (start > 1) {
    cells.push(pageCell(1), ELLIPSIS_BEFORE);
  }
  cells.push(...pageRange(start, end).map(page => pageCell(page)));
  if (end < pageCount - 1) {
    cells.push(ELLIPSIS_AFTER);
  }
  if (end < pageCount) {
    cells.push(pageCell(pageCount));
  }

  return cells;
}

function centredStart(current: number, length: number, pageCount: number): number {
  const offset = Math.floor((length - 1) / 2);

  return Math.max(1, Math.min(current - offset, pageCount - length + 1));
}

/**
 * Builds the fixed-width (`siblingCount * 2 + 3` cells) sequence of page numbers and ellipses
 * around `currentPage` for a strip of `pageCount` pages.
 */
// Keeps the current page away from the window edges when possible so stepping back is a direct
// page click, and assigns stable `key`s so `@for` preserves DOM focus across window shifts.
export function buildPageWindow(
  currentPage: number,
  pageCount: number,
  siblingCount = 1
): PageWindowItem[] {
  if (pageCount <= 0) {
    return [];
  }

  const siblings = Math.max(1, Math.trunc(siblingCount));
  const current = Math.min(Math.max(currentPage, 1), pageCount);
  const slots = siblings * 2 + 3;

  if (pageCount <= slots) {
    return pageRange(1, pageCount).map(page => pageCell(page));
  }

  // A longer window could not fit the first page, the last page and their ellipses in the budget.
  const maxLength = slots - 2;

  // Shortest centred window first. A window with a page on each side of the current one wins: it is
  // the one that makes stepping back a click away.
  let fitting: PageWindowItem[] | undefined;

  for (let length = 1; length <= maxLength; length += 1) {
    const start = centredStart(current, length, pageCount);
    const end = start + length - 1;
    const cells = windowCells(start, end, pageCount);

    if (cells.length !== slots) {
      continue;
    }
    if (start < current && end > current) {
      return cells;
    }
    fitting ??= cells;
  }

  if (fitting) {
    return fitting;
  }

  // The window of `slots - 4` pages always fits when it falls inside the strip, and at the ends a
  // longer one takes its place, so a candidate is always found above; the guard is what keeps the
  // strip's width fixed if that ever stops holding.
  return windowCells(current, current, pageCount);
}
