import { Hono } from "hono";
import { stringToHex } from "viem";
import { JOB_STATUS } from "../config/constant";
import { getJob, type Job, rejectOpenJob, setJobBudget } from "../lib/commerce";
import { quoteBudget, type ReviewDecision, reviewJob } from "../lib/review";
import { parseSpecPayload } from "../lib/spec";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const OPEN = 0;

function parseJobId(raw: string): bigint | null {
  try {
    const id = BigInt(raw);
    return id > 0n ? id : null;
  } catch {
    return null;
  }
}

/** Provider quotes from its own rate card; an unparseable spec quotes zero and is declined. */
function intendedBudgetFor(job: Job): bigint {
  const spec = parseSpecPayload(job.description);
  return spec ? quoteBudget(spec.modality, spec.minItems) : 0n;
}

function review(job: Job): {
  decision: ReviewDecision;
  intendedBudget: bigint;
} {
  const intendedBudget = intendedBudgetFor(job);
  return { decision: reviewJob(job, intendedBudget), intendedBudget };
}

function declineReason(decision: ReviewDecision) {
  return decision.outcome === "declined" ? decision.reason : undefined;
}

export const jobs = new Hono()
  // Reviews the job and reports whether its budget should be set. Reads only — never writes.
  .get("/:id/status", async (c) => {
    const jobId = parseJobId(c.req.param("id"));
    if (jobId === null) return c.json({ error: "invalid job id" }, 400);

    const job = await getJob(jobId);
    if (job.client === ZERO_ADDRESS)
      return c.json({ error: "job not found" }, 404);

    const { decision, intendedBudget } = review(job);

    return c.json({
      jobId: jobId.toString(),
      onChainStatus: JOB_STATUS[job.status],
      budget: job.budget.toString(),
      intendedBudget: intendedBudget.toString(),
      providerDecision: decision.outcome,
      declineReason: declineReason(decision),
    });
  })
  // Acts on the review: sets the budget when agreed, rejects when declined.
  .post("/:id/activate", async (c) => {
    const jobId = parseJobId(c.req.param("id"));
    if (jobId === null) return c.json({ error: "invalid job id" }, 400);

    const job = await getJob(jobId);
    if (job.client === ZERO_ADDRESS)
      return c.json({ error: "job not found" }, 404);

    const { decision, intendedBudget } = review(job);

    // Stateless idempotency: a job that has left Open, or already carries a budget, has
    // been acted on. Report current state rather than resending a transaction.
    if (job.status !== OPEN || job.budget > 0n) {
      return c.json({
        jobId: jobId.toString(),
        onChainStatus: JOB_STATUS[job.status],
        budget: job.budget.toString(),
        providerDecision: decision.outcome,
        declineReason: declineReason(decision),
        alreadyActivated: true,
      });
    }

    if (decision.outcome === "declined") {
      const txHash = await rejectOpenJob(
        jobId,
        stringToHex(decision.reason, { size: 32 }),
      );
      return c.json({
        jobId: jobId.toString(),
        providerDecision: "declined",
        declineReason: decision.reason,
        txHash,
      });
    }

    const txHash = await setJobBudget(jobId, intendedBudget);
    return c.json({
      jobId: jobId.toString(),
      providerDecision: "agreed",
      budget: intendedBudget.toString(),
      txHash,
    });
  });
