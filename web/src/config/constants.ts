/** Mirrors the provider's rate card in provider/src/config/constant.ts. */
export const MODALITIES = ["imu-sensor", "video", "audio", "image"] as const;

export type Modality = (typeof MODALITIES)[number];

export const MODALITY_LABELS: Record<Modality, string> = {
  "imu-sensor": "IMU / motion sensor",
  video: "Video",
  audio: "Audio",
  image: "Image",
};

/** A property of the token itself, so it belongs here rather than in the per-network config. */
export const USDC_DECIMALS = 6;

/** USDC, 6 decimals. */
export const PRICE_PER_ITEM: Record<Modality, bigint> = {
  "imu-sensor": 500_000n,
  video: 1_000_000n,
  audio: 300_000n,
  image: 200_000n,
};

export const MAX_JOB_BUDGET = 5_000_000_000n;
