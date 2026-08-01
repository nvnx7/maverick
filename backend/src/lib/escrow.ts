import type { Address, Hash } from "viem";

// TODO: gatekeeper call to escrow.release() once the contract is deployed (SPEC.md §9).
export async function releasePayout(
  _specId: string,
  _payoutAddress: Address,
  _amount: bigint,
): Promise<Hash> {
  throw new Error("not implemented");
}
