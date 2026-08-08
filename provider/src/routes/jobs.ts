import { Hono } from "hono";
import { zeroAddress } from "viem";
import { JOB_STATUS } from "../config/constant";
import { getJob, type Job, setJobBudget } from "../lib/job";
import { quoteBudget, reviewJob } from "../lib/review";
import { parseSpecPayload } from "../lib/spec";


const OPEN = 0;

function parseJobId(raw: string): bigint | null {
  try {
    const id = BigInt(raw);
    return id > 0n ? id : null;
  } catch {
    return null;
  }
}

function intendedBudgetFor(job: Job): bigint {
  const spec = parseSpecPayload(job.description);
  return spec ? quoteBudget(spec.modality, spec.minItems) : 0n;
}

export const jobs = new Hono()
  // Reviews the job and reports whether its budget should be set. Reads only — never writes.
  .get("/:id/status", async (c) => {
    const jobId = parseJobId(c.req.param("id"));
    if (jobId === null) return c.json({ error: "invalid job id" }, 400);

    const job = await getJob(jobId);
    if (job.client === zeroAddress)
      return c.json({ error: "job not found" }, 404);

    const intendedBudget = intendedBudgetFor(job);
    const reviewDecision = reviewJob(job, intendedBudget);
    const declineReason = reviewDecision.outcome === "declined" ? reviewDecision.reason : undefined;

    return c.json({
      jobId: jobId.toString(),
      onChainStatus: JOB_STATUS[job.status],
      budget: job.budget.toString(),
      intendedBudget: intendedBudget.toString(),
      providerDecision: reviewDecision.outcome,
      declineReason: declineReason,
    });
  })
  // Acts on the review: sets the budget when agreed, rejects when declined.
  .post("/:id/activate", async (c) => {
    const jobId = parseJobId(c.req.param("id"));
    if (jobId === null) return c.json({ error: "invalid job id" }, 400);

    const job = await getJob(jobId);
    if (job.client === zeroAddress)
      return c.json({ error: "job not found" }, 404);

    const intendedBudget = intendedBudgetFor(job);
    const reviewDecision = reviewJob(job, intendedBudget);
    const declineReason = reviewDecision.outcome === "declined" ? reviewDecision.reason : undefined;

    // Stateless idempotency: a job that has left Open, or already carries a budget, has
    // been acted on. Report current state rather than resending a transaction.
    if (job.status !== OPEN || job.budget > 0n) {
      return c.json({
        jobId: jobId.toString(),
        onChainStatus: JOB_STATUS[job.status],
        budget: job.budget.toString(),
        providerDecision: reviewDecision.outcome,
        declineReason: declineReason,
        alreadyActivated: true,
      });
    }

    if (reviewDecision.outcome === "declined") {
      // const txHash = await rejectOpenJob(
      //   jobId,
      //   stringToHex(reviewDecision.reason, { size: 32 }),
      // );
      return c.json({
        jobId: jobId.toString(),
        providerDecision: "declined",
        declineReason: reviewDecision.reason,
        // txHash,
      });
    }

    const txHash = await setJobBudget(jobId, intendedBudget);
    return c.json({
      jobId: jobId.toString(),
      providerDecision: "agreed",
      budget: intendedBudget.toString(),
      txHash,
    });
  })
  .get("/:id/files", async (c) => {
    const jobId = parseJobId(c.req.param("id"));
    if (jobId === null) return c.json({ error: "invalid job id" }, 400);

    const job = await getJob(jobId);
    if (job.client === zeroAddress) return c.json({ error: "job not found" }, 404);

    const { getJobFiles } = await import("../lib/storage");
    const files = await getJobFiles(jobId.toString());

    return c.json({ files });
  });
