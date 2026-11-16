/** A page number cell of the page strip. */
export interface PageWindowPage {
  readonly kind: 'page';
  /** Stable identity across window shifts, for `@for` tracking: `page-3`. */
  readonly key: string;
  readonly page: number;
}

/** A skipped run of pages, rendered as "…". */
export interface PageWindowEllipsis {
  readonly kind: 'ellipsis';
  /** Stable identity across window shifts, for `@for` tracking: `ellipsis-before`. */
  readonly key: string;
}

/** One cell of the page strip. */
export type PageWindowItem = PageWindowPage | PageWindowEllipsis;
