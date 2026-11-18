import { expect, test } from "vitest";
import { z } from "zod";

import { readField, readPage, readPageSize } from "@/lib/url-state/list-params";

test("reads a one-based page and falls back on malformed input", () => {
  expect(readPage(null)).toBe(1);
  expect(readPage("3")).toBe(3);
  expect(readPage("0")).toBe(1);
  expect(readPage("-2")).toBe(1);
  expect(readPage("1.5")).toBe(1);
  expect(readPage("page")).toBe(1);
});

test("reads an offered page size only", () => {
  expect(readPageSize(null, [15, 30, 50], 15)).toBe(15);
  expect(readPageSize("30", [15, 30, 50], 15)).toBe(30);
  expect(readPageSize("999", [15, 30, 50], 15)).toBe(15);
  expect(readPageSize("many", [15, 30, 50], 15)).toBe(15);
});

test("reads a field through its schema and falls back when it fails", () => {
  const trimmed = z.string().trim().max(5);
  const condition = z.union([z.literal(""), z.literal("stable")]);

  expect(readField(trimmed, "  Noah  ", "")).toBe("Noah");
  expect(readField(trimmed, "this is too long", "")).toBe("");
  expect(readField(condition, "stable", "")).toBe("stable");
  expect(readField(condition, "critical", "")).toBe("");
  expect(readField(condition, null, "")).toBe("");
});
