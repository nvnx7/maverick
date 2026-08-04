import type { Hash } from "viem";

function toHex(buffer: ArrayBuffer): Hash {
  const hex = Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `0x${hex}`;
}

/** Hashes locally — the file never leaves the device to produce this. */
export async function hashFile(file: File): Promise<Hash> {
  return toHex(await crypto.subtle.digest("SHA-256", await file.arrayBuffer()));
}

/** One capture hashes to itself; a batch hashes to the digest of its parts. */
export async function hashFiles(files: File[]): Promise<Hash> {
  const hashes = await Promise.all(files.map(hashFile));
  const first = hashes[0];
  if (!first) throw new Error("Select at least one file to hash.");
  if (hashes.length === 1) return first;

  const joined = new TextEncoder().encode(hashes.join(""));
  return toHex(await crypto.subtle.digest("SHA-256", joined));
}
