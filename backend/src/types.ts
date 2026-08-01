export const MODALITIES = ["imu-sensor", "video", "audio", "image"] as const;
export type Modality = (typeof MODALITIES)[number];

export type CreateSpecResponse = {
  specId: string;
  status: "payment_verified_pending_settlement";
  modality: string;
  pricePerItem: string;
  totalBudget: string;
  remainingBudget: string;
};

export type SubmissionResult =
  | { submissionId: string; result: "passed"; payoutTxHash: `0x${string}` }
  | {
      submissionId: string;
      result: "failed";
      reason:
        | "invalid_signature"
        | "unregistered_device"
        | "spec_not_active"
        | "budget_exhausted";
    };
