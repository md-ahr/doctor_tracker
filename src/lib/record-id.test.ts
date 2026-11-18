import { expect, test } from "vitest";

import { isRecordId } from "@/lib/record-id";

test("accepts the 24-character hex ids the API issues", () => {
  expect(isRecordId("65f1c0a2b4d9e81f2a3c4d5e")).toBe(true);
  expect(isRecordId("65F1C0A2B4D9E81F2A3C4D5E")).toBe(true);
});

test("rejects anything a record id can never be", () => {
  expect(isRecordId("")).toBe(false);
  expect(isRecordId("65f1c0a2b4d9e81f2a3c4d5")).toBe(false);
  expect(isRecordId("65f1c0a2b4d9e81f2a3c4d5ef")).toBe(false);
  expect(isRecordId("gafk-94fd73d15dc04370189dfg")).toBe(false);
  expect(isRecordId("../../../etc/passwd")).toBe(false);
});
