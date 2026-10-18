import assert from "node:assert/strict";
import test from "node:test";
import { mergeCacheHints } from "../src/utils/emdash-blog";

test("merged cache hints keep every tag once", () => {
  const merged = mergeCacheHints([
    { tags: ["blog"] },
    { tags: ["blog", "01ENTRY"] },
    {},
  ]);

  assert.deepEqual(merged.tags, ["blog", "01ENTRY"]);
});

test("merged cache hints keep the latest lastModified", () => {
  const older = new Date("2026-01-01T00:00:00Z");
  const newer = new Date("2026-06-01T00:00:00Z");

  const merged = mergeCacheHints([
    { tags: ["blog"], lastModified: older },
    { tags: ["blog"], lastModified: newer },
    { tags: ["blog"] },
  ]);

  assert.equal(merged.lastModified, newer);
});

test("merging empty hints returns an empty hint", () => {
  assert.deepEqual(mergeCacheHints([]), {});
  assert.deepEqual(mergeCacheHints([{}, { tags: [] }]), {});
});
