
export const SUPPORTED_MODALITIES = new Set([
  "imu-sensor",
  "video",
  "audio",
  "image",
]);

/** USDC, 6 decimals. This provider's own rate card — not buyer-negotiated. */
export const PRICE_PER_ITEM: Record<string, bigint> = {
  "imu-sensor": 500_000n, // 0.50 USDC
  video: 1_000_000n,
  audio: 300_000n,
  image: 200_000n,
};

export const MAX_JOB_BUDGET = 5_000_000_000n; // 5,000 USDC ceiling
export const MIN_JOB_TTL = 3_600n; // 1 hour
export const MAX_JOB_TTL = 7_776_000n; // 90 days

export const JOB_STATUS = [
  "Open",
  "Funded",
  "Submitted",
  "Completed",
  "Rejected",
  "Expired",
] as const;

export type JobStatus = (typeof JOB_STATUS)[number];
