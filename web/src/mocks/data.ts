import type {
  BuyerRequest,
  DeviceRecord,
  OpenRequest,
  RequestDetail,
  Submission,
} from "@/types";
import { JobStatus } from "@/types";

// Placeholder data until the provider backend is wired up. Timestamps are fixed
// so server and client renders agree.
const NOW = 1_785_542_400;
const DAY = 86_400;

const CONTRACT = "0x9a3f7b12c4e5d6a8b1c0e2f3a4b5c6d7e8f90112" as const;
const PROVIDER = "0x4e7c1a2b3d5f6081c2a3b4c5d6e7f8091a2b3c4d" as const;
const EVALUATOR = "0xb1c2d3e4f5061728394a5b6c7d8e9f0a1b2c3d4e" as const;
const CLIENT = "0x7f3a9b2c1d4e5f6081a2b3c4d5e6f7089a1b2c3d" as const;

export const buyerRequests: BuyerRequest[] = [
  {
    id: "1041",
    status: JobStatus.Funded,
    spec: {
      modality: "video",
      deviceRequirements: "Head-mounted camera, 1080p minimum, 30fps",
      minItems: 2500,
    },
    budget: 2_500_000_000n,
    spent: 1_240_000_000n,
    submissionCount: 62,
    createdAt: NOW - 6 * DAY,
    providerDecision: "agreed",
  },
  {
    id: "1038",
    status: JobStatus.Submitted,
    spec: {
      modality: "imu-sensor",
      deviceRequirements: "6-axis IMU, 100Hz sampling, wrist-worn",
      minItems: 3000,
    },
    budget: 1_500_000_000n,
    spent: 900_000_000n,
    submissionCount: 30,
    createdAt: NOW - 11 * DAY,
    providerDecision: "agreed",
  },
  {
    id: "1044",
    status: JobStatus.Open,
    spec: {
      modality: "image",
      deviceRequirements: "Rear-facing phone camera, EXIF intact",
      minItems: 1200,
    },
    budget: 0n,
    spent: 0n,
    submissionCount: 0,
    createdAt: NOW - 2 * 3600,
    providerDecision: "pending",
  },
  {
    id: "1032",
    status: JobStatus.Completed,
    spec: {
      modality: "audio",
      deviceRequirements: "Lapel mic, 48kHz, mono",
      minItems: 2000,
    },
    budget: 600_000_000n,
    spent: 600_000_000n,
    submissionCount: 40,
    createdAt: NOW - 24 * DAY,
    providerDecision: "agreed",
  },
  {
    id: "1029",
    status: JobStatus.Rejected,
    spec: {
      modality: "video",
      deviceRequirements: "Drone-mounted, 4K",
      minItems: 9000,
    },
    budget: 0n,
    spent: 0n,
    submissionCount: 0,
    createdAt: NOW - 31 * DAY,
    providerDecision: "declined",
    declineReason: "budget-out-of-range",
  },
];

const FALLBACK_TX: `0x${string}` =
  "0xa3f9c2e17b40d85612fa9e07c4b3d21089ef6a5c47b2d9013e8fa6c2b51d7409";

const CREATED_TX: Record<string, `0x${string}` | undefined> = {
  "1041": "0xa3f9c2e17b40d85612fa9e07c4b3d21089ef6a5c47b2d9013e8fa6c2b51d7409",
  "1038": "0x6b21df405a9c38e714026fbd5a83c917e40d2b86f95a1c07d34e8b620fa95c13",
  "1044": "0x0c58ea9714b3d206f81a4c7e35b92d0186fa47c2e903b8d165af27c04e9b3182",
  "1032": "0xd72e91a05c46b3f827d1e04ba95c637f210d8ae64b93c50172fd8e6ab04c1937",
  "1029": "0x4f18c2a63d095e7b81420fac37d6b5e029417cd8a06f3b295e7c14da608b3f27",
};

export function buildRequestDetail(request: BuyerRequest): RequestDetail {
  return {
    ...request,
    client: CLIENT,
    contract: CONTRACT,
    provider: PROVIDER,
    evaluator: EVALUATOR,
    expiredAt: request.createdAt + 30 * DAY,
    description: JSON.stringify(request.spec),
    createdTxHash: CREATED_TX[request.id] ?? FALLBACK_TX,
  };
}

export const openRequests: OpenRequest[] = [
  {
    id: "1041",
    status: JobStatus.Funded,
    spec: {
      modality: "video",
      deviceRequirements: "Head-mounted camera, 1080p minimum, 30fps",
      minItems: 2500,
    },
    pricePerItem: 1_000_000n,
    budgetRemaining: 1_260_000_000n,
  },
  {
    id: "1038",
    status: JobStatus.Funded,
    spec: {
      modality: "imu-sensor",
      deviceRequirements: "6-axis IMU, 100Hz sampling, wrist-worn",
      minItems: 3000,
    },
    pricePerItem: 500_000n,
    budgetRemaining: 600_000_000n,
  },
  {
    id: "1046",
    status: JobStatus.Funded,
    spec: {
      modality: "audio",
      deviceRequirements: "Binaural mic, urban environments, 48kHz",
      minItems: 1800,
    },
    pricePerItem: 300_000n,
    budgetRemaining: 540_000_000n,
  },
  {
    id: "1047",
    status: JobStatus.Funded,
    spec: {
      modality: "image",
      deviceRequirements: "Street-level, daylight, EXIF intact",
      minItems: 5000,
    },
    pricePerItem: 200_000n,
    budgetRemaining: 1_000_000_000n,
  },
];

export const submissions: Submission[] = [
  {
    id: "sub_8f21",
    jobId: "1041",
    modality: "video",
    dataHash:
      "0x7d4a1f09c3b28e5610af73d2c9b045e83f16a2d740c9be5812a3f7d06c94e185",
    submittedAt: NOW - 3 * 3600,
    status: "pending",
    amount: 1_000_000n,
  },
  {
    id: "sub_7c93",
    jobId: "1041",
    modality: "video",
    dataHash:
      "0x2b9e4c07d1a35f8624be09c7a4d13f5680e2ca917d4b6035f8a1c2e74d09b365",
    submittedAt: NOW - DAY,
    status: "verified",
    amount: 1_000_000n,
  },
  {
    id: "sub_6a15",
    jobId: "1038",
    modality: "imu-sensor",
    dataHash:
      "0x5f18d3b6027ac491e2358d7f0b6c4a2931de85f07a2c6b4931d0e85fa672c418",
    submittedAt: NOW - 3 * DAY,
    status: "paid",
    amount: 500_000n,
    payoutTxHash:
      "0xc41d97a2f5083be617294dc0a8f36b51e7290ac4d13f68b5027ae94c31d6f085",
  },
  {
    id: "sub_5d02",
    jobId: "1038",
    modality: "imu-sensor",
    dataHash:
      "0x91c3ae7205fd684b1c09e37a2d5f48620ba9c1e73df06582a4c9b30e7d16fa25",
    submittedAt: NOW - 5 * DAY,
    status: "paid",
    amount: 500_000n,
    payoutTxHash:
      "0x8b2fa47c1d90e365248fb70ac1d3e69f5027ab4c86d915f072e3ba48c50d97e1",
  },
];

export const requestSubmissions: Record<string, Submission[]> = {
  "1041": submissions.filter((s) => s.jobId === "1041"),
  "1038": submissions.filter((s) => s.jobId === "1038"),
};

export const SIMULATED_CREATE_TX: `0x${string}` =
  "0x3ea71c04b8d295f6017ac4be38d20915fa7c6e043b18d95c27ea60fb4d31c807";

export const SIMULATED_FUND_TX: `0x${string}` =
  "0x9c2d81fa46b3e07528ad91c63f70b4e815d2ca9760f38b41e07a5cd2936bf418";

export const SIMULATED_REGISTER_TX: `0x${string}` =
  "0x5b08e3d71a29c4650fd83b17e2a90c46b5d70f39e814ca27306bd95af12e8c74";

let jobIdCounter = 1050;

/** Each simulated createJob hands back a fresh id. */
export function nextJobId(): string {
  jobIdCounter += 1;
  return String(jobIdCounter);
}

const reviewPolls = new Map<string, number>();

/** A brand-new job reads as pending for the first couple of polls, then agrees. */
export function simulatedReview(jobId: string): "pending" | "agreed" {
  const seen = (reviewPolls.get(jobId) ?? 0) + 1;
  reviewPolls.set(jobId, seen);
  return seen >= 3 ? "agreed" : "pending";
}

export const registeredDevice: DeviceRecord = {
  deviceId: "device:4e7c1a2b3d5f",
  pubkey: "0x4e7c1a2b3d5f6081c2a3b4c5d6e7f8091a2b3c4d",
  registeredAt: NOW - 14 * DAY,
};
