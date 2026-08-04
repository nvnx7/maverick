import { JobStatus } from "@/types";

export type Tone = "brand" | "chain" | "warn" | "gray";

/**
 * The contract's literal enum name. Deliberately not translated into friendlier
 * product copy — showing the real on-chain state is the point.
 */
export function jobStatusName(status: JobStatus): string {
  return JobStatus[status];
}

export const JOB_STATUS_TONE: Record<JobStatus, Tone> = {
  [JobStatus.Open]: "warn",
  [JobStatus.Funded]: "brand",
  [JobStatus.Submitted]: "chain",
  [JobStatus.Completed]: "brand",
  [JobStatus.Rejected]: "warn",
  [JobStatus.Expired]: "gray",
};
