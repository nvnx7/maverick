import type { RequestSpec } from "@/types";

/** `job.description` carries the spec as JSON; the provider parses it defensively. */
export function encodeSpec(spec: RequestSpec): string {
  return JSON.stringify(spec);
}

export function decodeSpec(raw: string): RequestSpec | null {
  try {
    return JSON.parse(raw) as RequestSpec;
  } catch {
    return null;
  }
}
