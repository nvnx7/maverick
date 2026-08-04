import { type Modality, PRICE_PER_ITEM } from "@/config/constants";

/** The provider's own rate card. A budget under this quote gets declined. */
export function quoteBudget(modality: Modality, minItems: number): bigint {
  const items = Number.isFinite(minItems) ? Math.floor(minItems) : 0;
  return PRICE_PER_ITEM[modality] * BigInt(Math.max(0, items));
}
