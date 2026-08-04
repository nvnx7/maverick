import type { SubmissionStatus } from "@/types";
import type { Tone } from "./job";

/**
 * Payout timing is the provider's discretion, not protocol-enforced — `verified`
 * says so plainly rather than implying an imminent transfer.
 */
export const SUBMISSION_STATUS_COPY: Record<
  SubmissionStatus,
  { label: string; tone: Tone }
> = {
  pending: { label: "Pending verification", tone: "warn" },
  verified: { label: "Verified — payout pending", tone: "chain" },
  paid: { label: "Paid", tone: "brand" },
};
