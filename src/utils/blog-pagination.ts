export const BLOG_PAGE_SIZE = 12;

export function parseBlogPage(searchParams: URLSearchParams): number | null {
  const values = searchParams.getAll("page");

  if (values.length === 0) return 1;
  if (values.length !== 1 || !/^\d+$/.test(values[0])) return null;

  const page = Number(values[0]);
  const offset = (page - 1) * BLOG_PAGE_SIZE;

  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(offset)
  ) {
    return null;
  }

  return page;
}

export function getBlogPagePath(page: number): string {
  return page === 1 ? "/blog" : `/blog?page=${page}`;
}
