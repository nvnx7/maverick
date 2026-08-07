import {
  MAX_JOB_BUDGET,
  MAX_JOB_TTL,
  MIN_JOB_TTL,
  PRICE_PER_ITEM,
  SUPPORTED_MODALITIES,
} from "../config/constant";
import { networkConfig } from "../config/network";
import type { Job } from "./job";
import { parseSpecPayload } from "./spec";

export type DeclineReason =
  | "untrusted-evaluator"
  | "not-this-provider"
  | "spec-shape-invalid"
  | "unsupported-modality"
  | "expiry-out-of-range"
  | "budget-out-of-range";

export type ReviewDecision =
  | { outcome: "agreed" }
  | { outcome: "declined"; reason: DeclineReason };

const eq = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/** Provider's quote for a spec, from its own rate card. */
export function quoteBudget(modality: string, minItems: number): bigint {
  return (PRICE_PER_ITEM[modality] ?? 0n) * BigInt(minItems);
}

export function reviewJob(job: Job, intendedBudget: bigint): ReviewDecision {
  if (!eq(job.evaluator, networkConfig.contracts.evaluator)) {
    return { outcome: "declined", reason: "untrusted-evaluator" };
  }
  if (!eq(job.provider, networkConfig.contracts.provider)) {
    return { outcome: "declined", reason: "not-this-provider" };
  }

  const spec = parseSpecPayload(job.description);
  if (!spec) return { outcome: "declined", reason: "spec-shape-invalid" };

  if (!SUPPORTED_MODALITIES.has(spec.modality)) {
    return { outcome: "declined", reason: "unsupported-modality" };
  }

  const now = BigInt(Math.floor(Date.now() / 1000));
  if (job.expiredAt < now + MIN_JOB_TTL || job.expiredAt > now + MAX_JOB_TTL) {
    return { outcome: "declined", reason: "expiry-out-of-range" };
  }

  const floor = quoteBudget(spec.modality, spec.minItems);
  if (intendedBudget < floor || intendedBudget > MAX_JOB_BUDGET) {
    return { outcome: "declined", reason: "budget-out-of-range" };
  }

  return { outcome: "agreed" };
}
