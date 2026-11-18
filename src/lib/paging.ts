/** Row counts the portal offers on every list screen. */
export const PAGE_SIZE_OPTIONS = [15, 30, 50] as const;

export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

/** Lists are one-based; page 1 is the default and is left out of the URL. */
export const FIRST_PAGE = 1;

export const DEFAULT_PAGE_SIZE: PageSize = PAGE_SIZE_OPTIONS[0];
