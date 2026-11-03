import type { PageWindowItem } from '../pagination.model';
import { buildPageWindow } from './page-window';

const page = (value: number): PageWindowItem => ({
  kind: 'page',
  key: `page-${value}`,
  page: value
});
const before = (): PageWindowItem => ({ kind: 'ellipsis', key: 'ellipsis-before' });
const after = (): PageWindowItem => ({ kind: 'ellipsis', key: 'ellipsis-after' });

describe(buildPageWindow, () => {
  it('should return no pages when the page count is not positive', () => {
    expect(buildPageWindow(1, 0)).toEqual([]);
    expect(buildPageWindow(1, -3)).toEqual([]);
  });

  it('should return every page when the strip fits', () => {
    expect(buildPageWindow(1, 7, 2)).toEqual([
      page(1),
      page(2),
      page(3),
      page(4),
      page(5),
      page(6),
      page(7)
    ]);
    expect(buildPageWindow(3, 5, 2)).toEqual([page(1), page(2), page(3), page(4), page(5)]);
  });

  it('should keep the first pages and the last page on the first page', () => {
    expect(buildPageWindow(1, 10, 2)).toEqual([
      page(1),
      page(2),
      page(3),
      page(4),
      page(5),
      after(),
      page(10)
    ]);
  });

  it('should show the leading ellipsis from the third page on', () => {
    // Page 2 still reaches the first page, so nothing is skipped before the window.
    expect(buildPageWindow(2, 10, 2)).not.toContainEqual(before());
    expect(buildPageWindow(3, 10, 2)).toEqual([
      page(1),
      before(),
      page(2),
      page(3),
      page(4),
      after(),
      page(10)
    ]);
  });

  it('should center the window on a middle page', () => {
    expect(buildPageWindow(5, 10, 2)).toEqual([
      page(1),
      before(),
      page(4),
      page(5),
      page(6),
      after(),
      page(10)
    ]);
    expect(buildPageWindow(21, 42, 2)).toEqual([
      page(1),
      before(),
      page(20),
      page(21),
      page(22),
      after(),
      page(42)
    ]);
  });

  it('should keep the page before the current one in the window', () => {
    // The window is centred on the current page so the page before it stays clickable, whatever the
    // page count: that is the whole point of the shape, and it is where a growing window failed.
    for (const pageCount of [8, 10, 11, 20, 42]) {
      for (let current = 2; current <= pageCount; current += 1) {
        const pages = buildPageWindow(current, pageCount, 2).filter(item => item.kind === 'page');

        expect(pages.map(item => item.page)).toContain(current - 1);
      }
    }
  });

  it('should keep the last pages and the first page on the last page', () => {
    expect(buildPageWindow(10, 10, 2)).toEqual([
      page(1),
      before(),
      page(6),
      page(7),
      page(8),
      page(9),
      page(10)
    ]);
  });

  it('should keep the cell count constant, so the strip never changes width', () => {
    const counts = new Set<number>();

    for (let current = 1; current <= 10; current += 1) {
      counts.add(buildPageWindow(current, 10, 2).length);
    }

    expect([...counts]).toEqual([7]);
  });

  it('should always keep the current page inside the window', () => {
    for (let current = 1; current <= 40; current += 1) {
      const pages = buildPageWindow(current, 40, 2).filter(item => item.kind === 'page');

      expect(pages.map(item => item.page)).toContain(current);
    }
  });

  it('should clamp an out-of-range current page', () => {
    expect(buildPageWindow(0, 10, 2)).toEqual(buildPageWindow(1, 10, 2));
    expect(buildPageWindow(99, 10, 2)).toEqual(buildPageWindow(10, 10, 2));
  });

  it('should size the strip from the sibling count', () => {
    expect(buildPageWindow(3, 10, 1)).toEqual([page(1), before(), page(3), after(), page(10)]);
    expect(buildPageWindow(3, 10, 1)).toHaveLength(5);
    // Below 1 the window would not be able to hold the current page, so it is treated as 1.
    expect(buildPageWindow(3, 10, 0)).toEqual(buildPageWindow(3, 10, 1));
  });

  it('should give every cell a unique, stable key', () => {
    const keys = buildPageWindow(5, 20, 2).map(item => item.key);

    expect(new Set(keys).size).toBe(keys.length);
  });
});
