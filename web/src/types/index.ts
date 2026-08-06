import { JobStatus } from "@repo/sdk";
import type { Address, Hash } from "viem";
import type { Modality } from "@/config/constants";

export { JobStatus };

export type ProviderDecision = "pending" | "agreed" | "declined";

/** Mirrors provider/src/lib/review.ts. */
export type DeclineReason =
  | "untrusted-evaluator"
  | "not-this-provider"
  | "spec-shape-invalid"
  | "unsupported-modality"
  | "expiry-out-of-range"
  | "budget-out-of-range";

/** The JSON payload encoded into the on-chain job description. */
export type RequestSpec = {
  modality: Modality;
  deviceRequirements: string;
  minItems: number;
};

export type BuyerRequest = {
  id: string;
  status: JobStatus;
  spec: RequestSpec;
  budget: bigint;
  spent: bigint;
  submissionCount: number;
  createdAt: number;
  providerDecision: ProviderDecision;
  declineReason?: DeclineReason;
};

export type RequestDetail = BuyerRequest & {
  client: Address;
  provider: Address;
  evaluator: Address;
  contract: Address;
  expiredAt: number;
  description: string;
  /** Absent when the JobCreated log is out of the scanned range. */
  createdTxHash?: Hash;
};

export type OpenRequest = {
  id: string;
  status: JobStatus;
  spec: RequestSpec;
  pricePerItem: bigint;
  budgetRemaining: bigint;
};

export type RequestStatusReport = {
  jobId: string;
  onChainStatus: keyof typeof JobStatus;
  budget: bigint;
  intendedBudget: bigint;
  providerDecision: ProviderDecision;
  declineReason?: DeclineReason;
};

export type SubmissionStatus = "pending" | "verified" | "paid";

export type Submission = {
  id: string;
  jobId: string;
  modality: Modality;
  dataHash: Hash;
  submittedAt: number;
  status: SubmissionStatus;
  amount: bigint;
  payoutTxHash?: Hash;
};

export type DeviceRecord = {
  deviceId: string;
  pubkey: Hash;
  registeredAt: number;
};
