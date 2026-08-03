import { type Job, JobStatus, type RawJob } from "../types/job";

export function normalizeJob(job: RawJob): Job {
  return {
    ...job,
    status: job.status as JobStatus,
    expiredAt: BigInt(job.expiredAt),
    submittedAt: BigInt(job.submittedAt),
  };
}

/** Undefined when the chain returns an ordinal this SDK does not know about. */
export function jobStatusName(status: JobStatus): string | undefined {
  return JobStatus[status];
}

/** A job id is only valid once assigned; the escrow counts from 1. */
export function isValidJobId(value: bigint): boolean {
  return value > 0n;
}
