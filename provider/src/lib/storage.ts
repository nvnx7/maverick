import type { StoredManifest } from "./manifest";

/** Stub — no real object storage yet. */
export async function uploadToS3(
  key: string,
  manifest: StoredManifest,
): Promise<void> {
  console.log(`[stub] uploadToS3 ${key}`, manifest);
}
