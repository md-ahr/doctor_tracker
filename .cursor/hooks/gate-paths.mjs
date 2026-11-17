import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function markerPath() {
  const id = createHash("sha256").update(process.cwd()).digest("hex").slice(0, 16);
  return join(tmpdir(), `doctor-tracker-${id}.edited`);
}

export function passStampPath() {
  return `${markerPath()}.ok`;
}
