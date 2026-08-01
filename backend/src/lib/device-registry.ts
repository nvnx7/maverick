import type { Address } from "viem";

// TODO: read-through cache of the on-chain Device Registry (SPEC.md §8).
export async function getDevicePubkey(
  _deviceId: string,
): Promise<Address | null> {
  return null;
}
