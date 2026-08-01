export type SpecRecord = {
  id: string;
  status: "payment_verified_pending_settlement" | "active" | "closed";
  pricePerItem: bigint;
  remainingBudget: bigint;
};

// TODO: back with real persistence (SPEC.md §11).
export async function getSpec(_specId: string): Promise<SpecRecord | null> {
  return null;
}
