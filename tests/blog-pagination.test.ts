import assert from "node:assert/strict";
import test from "node:test";
import {
  BLOG_PAGE_SIZE,
  getBlogPagePath,
  parseBlogPage,
} from "../src/utils/blog-pagination";

test("the blog defaults to page one without a page parameter", () => {
  assert.equal(parseBlogPage(new URLSearchParams()), 1);
  assert.equal(parseBlogPage(new URLSearchParams("utm_source=email")), 1);
});

test("positive page numbers and leading zeros resolve to the same page", () => {
  for (const [value, expected] of [
    ["1", 1],
    ["2", 2],
    ["008", 8],
    ["100", 100],
  ] as const) {
    assert.equal(parseBlogPage(new URLSearchParams({ page: value })), expected);
  }
});

test("malformed and duplicate page parameters are rejected", () => {
  for (const value of [
    "",
    "0",
    "000",
    "-1",
    "+2",
    "1.5",
    "1e2",
    "0x10",
    "abc",
    "NaN",
    "Infinity",
    " 2",
    "2 ",
    "2\n",
    "２",
  ]) {
    assert.equal(
      parseBlogPage(new URLSearchParams({ page: value })),
      null,
      JSON.stringify(value)
    );
  }

  for (const query of ["page=2&page=3", "page=2&page=2", "page=&page=1"]) {
    assert.equal(parseBlogPage(new URLSearchParams(query)), null, query);
  }
});

test("unsafe page numbers and offsets are rejected before querying", () => {
  const lastSafePage = Math.floor(Number.MAX_SAFE_INTEGER / BLOG_PAGE_SIZE) + 1;
  assert.equal(
    parseBlogPage(new URLSearchParams({ page: String(lastSafePage) })),
    lastSafePage
  );

  for (const value of [
    String(lastSafePage + 1),
    String(Number.MAX_SAFE_INTEGER),
    "9007199254740993",
    "9".repeat(400),
  ]) {
    assert.equal(
      parseBlogPage(new URLSearchParams({ page: value })),
      null,
      value
    );
  }
});

test("page links use the bare archive URL only for page one", () => {
  assert.equal(getBlogPagePath(1), "/blog");
  assert.equal(getBlogPagePath(2), "/blog?page=2");
  assert.equal(getBlogPagePath(8), "/blog?page=8");
});
