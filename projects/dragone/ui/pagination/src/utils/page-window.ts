import type { PageWindowEllipsis, PageWindowItem, PageWindowPage } from '../pagination.model';

const ELLIPSIS_BEFORE: PageWindowEllipsis = { kind: 'ellipsis', key: 'ellipsis-before' };
const ELLIPSIS_AFTER: PageWindowEllipsis = { kind: 'ellipsis', key: 'ellipsis-after' };

function pageCell(page: number): PageWindowPage {
  return { kind: 'page', key: `page-${page}`, page };
}

function pageRange(start: number, end: number): number[] {
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
}

/**
 * The cells for one window: the first page behind a gap, the window itself, then a gap and the last
 * page. The leading gap carries its ellipsis even when the window opens on page 2 and so hides
 * nothing — it is the cue that the earlier pages are collapsed, and keeping it is what holds the
 * strip's shape. The trailing one appears only when it hides a page, so the pages next to the end
 * are reachable instead of sitting behind an ellipsis that hides nothing.
 */
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

/** The start of a `length`-page window centred on the current page, clamped to the strip. */
function centredStart(current: number, length: number, pageCount: number): number {
  const offset = Math.floor((length - 1) / 2);

  return Math.max(1, Math.min(current - offset, pageCount - length + 1));
}

/**
 * Builds the page strip: the first page, the last page and, between them, a window of page numbers
 * with the current page in the middle, an ellipsis on each side where a run is skipped.
 *
 * The strip renders `siblingCount * 2 + 3` cells whatever the current page, so its width never
 * changes as the user navigates. The current page sits in the middle of the numbers rather than at
 * their edge: that is what leaves the page before it on screen, so stepping back is a click on a
 * page number and not a trip to the previous button. Among the windows that fill the budget the
 * shortest one wins, which is why the leading ellipsis starts at page 3 — from there the page
 * before the current one costs a cell the strip does not have to spare, and page 2 would otherwise
 * give up its trailing ellipsis to reach the first page. Where the window cannot stay centred, at
 * the ends, it grows towards the middle instead, spending on one more page number the cell an
 * ellipsis would have used. `siblingCount` below 1 is treated as 1. Every cell carries a stable
 * `key` so the strip can `@for`-track by identity: when the window slides, the page buttons that
 * survive are moved rather than destroyed, which keeps keyboard focus on the button the user just
 * activated.
 */
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
