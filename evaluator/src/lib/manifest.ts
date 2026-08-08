import canonicalize from "canonicalize";
import { keccak256, stringToBytes } from "viem";

export type ManifestFile = {
  name: string;
  hash: `0x${string}`;
  mimeType: string;
  size: number;
};

export type ManifestStatus = "provisional" | "verified";

export type StoredManifest = {
  jobId: string;
  /** Sorted, byte-identical to the hash input. */
  files: ManifestFile[];
  /** The computed hash, embedded for convenience. */
  dataHash: `0x${string}`;
  status: ManifestStatus;
  createdAt: number;
  verifiedAt?: number;
};

/**
 * Orders by raw UTF-8 bytes rather than locale collation, which varies by machine
 * and locale and would hand the same file set a different dataHash elsewhere.
 */
export function sortFilesByName(files: ManifestFile[]): ManifestFile[] {
  return [...files].sort((a, b) =>
    Buffer.compare(Buffer.from(a.name, "utf8"), Buffer.from(b.name, "utf8")),
  );
}

/**
 * keccak256 over the JCS-canonical JSON of the sorted file list.
 *
 * This preimage is consensus-critical: the device signs the result and the
 * evaluator recomputes it to verify, so this must stay byte-identical to the
 * provider's implementation in provider/src/lib/manifest.ts.
 */
export function computeDataHash(sortedFiles: ManifestFile[]): `0x${string}` {
  const canonical = canonicalize(sortedFiles);
  if (canonical === undefined) {
    throw new Error("file list could not be canonicalized");
  }
  return keccak256(stringToBytes(canonical));
}
