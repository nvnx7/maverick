import { Hono } from "hono";
import { getAddress, isAddress, zeroAddress } from "viem";
import { z } from "zod";
import { JOB_STATUS } from "../config/constant";
import { getJob, submitJobClaim } from "../lib/job";
import { quoteBudget } from "../lib/review";
import { parseSpecPayload } from "../lib/spec";
import { getStoredManifest } from "../lib/storage";

const BYTES32 = /^0x[0-9a-fA-F]{64}$/;
const FUNDED = 1;
const SUBMITTED = 2;

const claimSchema = z
  .object({
    contributor: z.string().optional(),
    address: z.string().optional(),
    dataHash: z.custom<`0x${string}`>(
      (value) => typeof value === "string" && BYTES32.test(value),
      "dataHash must be a 32-byte hex string",
    ),
  })
  .transform((value, ctx) => {
    const rawContributor = value.contributor ?? value.address;
    if (!rawContributor || !isAddress(rawContributor)) {
      ctx.addIssue({
        code: "custom",
        message: "contributor address must be an EVM address",
      });
      return z.NEVER;
    }

    return {
      contributor: getAddress(rawContributor) as `0x${string}`,
      dataHash: value.dataHash,
    };
  });

function parseJobId(raw: string): bigint | null {
  try {
    const id = BigInt(raw);
    return id > 0n ? id : null;
  } catch {
    return null;
  }
}

export const claims = new Hono().post("/:id/claims", async (c) => {
  const jobId = parseJobId(c.req.param("id"));
  if (jobId === null) return c.json({ error: "invalid job id" }, 400);

  const body = await c.req.json().catch(() => null);
  const parsed = claimSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: parsed.error.issues[0]?.message ?? "invalid request body" },
      400,
    );
  }

  const job = await getJob(jobId);
  if (job.client === zeroAddress) {
    return c.json({ error: "job not found" }, 404);
  }
  if (job.status !== FUNDED && job.status !== SUBMITTED) {
    return c.json(
      {
        error: "job is not claimable",
        onChainStatus: JOB_STATUS[job.status],
      },
      409,
    );
  }

  const spec = parseSpecPayload(job.description);
  if (!spec) return c.json({ error: "job spec is invalid" }, 422);

  const { contributor, dataHash } = parsed.data;
  const manifest = await getStoredManifest(jobId.toString(), dataHash);
  if (!manifest) return c.json({ error: "upload manifest not found" }, 404);
  if (manifest.jobId !== jobId.toString() || manifest.dataHash !== dataHash) {
    return c.json({ error: "upload manifest does not match claim" }, 409);
  }
  if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
    return c.json({ error: "upload manifest has no files" }, 422);
  }

  const claimAmount = quoteBudget(spec.modality, manifest.files.length);
  if (claimAmount === 0n) {
    return c.json({ error: "unsupported modality" }, 422);
  }

  console.log({
    job,
    claimAmount,
    cumulativeAmount: job.settledAmount + claimAmount,
    budget: job.budget,
  })

  const cumulativeAmount = job.settledAmount + claimAmount;
  if (cumulativeAmount > job.budget) {
    return c.json({ error: "claim exceeds job budget" }, 409);
  }

  const txHash = await submitJobClaim(
    jobId,
    cumulativeAmount,
    dataHash,
    contributor,
  );

  return c.json({
    jobId: jobId.toString(),
    contributor,
    dataHash,
    fileCount: manifest.files.length,
    cumulativeAmount: cumulativeAmount.toString(),
    txHash,
  });
});

export const claimFiles = new Hono().get("/:id/claims/:dataHash/files", async (c) => {
  const jobId = parseJobId(c.req.param("id"));
  if (jobId === null) return c.json({ error: "invalid job id" }, 400);

  const dataHash = c.req.param("dataHash");
  if (!BYTES32.test(dataHash)) {
    return c.json({ error: "invalid dataHash format" }, 400);
  }

  // Ensure the job exists and is accessible
  const job = await getJob(jobId);
  if (job.client === zeroAddress) {
    return c.json({ error: "job not found" }, 404);
  }

  const manifest = await getStoredManifest(jobId.toString(), dataHash as `0x${string}`);
  if (!manifest) return c.json({ error: "upload manifest not found" }, 404);

  const { getFileDownloadUrls } = await import("../lib/storage");
  const files = await getFileDownloadUrls(jobId.toString(), manifest);

  return c.json({ files });
});

claims.route("/", claimFiles);
