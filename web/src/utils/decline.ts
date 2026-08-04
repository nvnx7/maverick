import type { DeclineReason } from "@/types";

/** Plain language for the buyer. The raw enum stays visible next to it. */
export const DECLINE_REASON_COPY: Record<DeclineReason, string> = {
  "untrusted-evaluator":
    "This request named an evaluator the provider doesn't recognise. Recreate it using the default evaluator.",
  "not-this-provider": "This request was addressed to a different provider.",
  "spec-shape-invalid":
    "The provider couldn't read the request details stored on-chain. Recreate the request.",
  "unsupported-modality":
    "The provider doesn't source this data type. Pick another modality.",
  "expiry-out-of-range":
    "The deadline has to fall between 1 hour and 90 days from now.",
  "budget-out-of-range":
    "The budget is under the provider's quote or over its 5,000 USDC ceiling.",
};

export function declineCopy(reason: DeclineReason | undefined): string {
  return reason
    ? DECLINE_REASON_COPY[reason]
    : "The provider declined this request without giving a reason.";
}
