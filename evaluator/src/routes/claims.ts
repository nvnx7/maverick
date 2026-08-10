import { Hono } from "hono";
import { getAddress, isAddress, zeroAddress } from "viem";
import { z } from "zod";
import { JOB_STATUS } from "../config/constant";
import { approveJobClaim, getJob } from "../lib/job";
import { computeDataHash, sortFilesByName } from "../lib/manifest";
import { getStoredManifest } from "../lib/storage";

const BYTES32 = /^0x[0-9a-fA-F]{64}$/;
const FUNDED = 1;
const SUBMITTED = 2;

const approveSchema = z
  .object({
    contributor: z.string().optional(),
    address: z.string().optional(),
    dataHash: z.custom<`0x${string}`>(
      (value) => typeof value === "string" && BYTES32.test(value),
      "dataHash must be a 32-byte hex string",
    ),
    cumulativeAmount: z
      .string()
      .regex(/^\d+$/, "cumulativeAmount must be a numeric string"),
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
      cumulativeAmount: BigInt(value.cumulativeAmount),
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

export const claims = new Hono()
  /**
   * POST /jobs/:id/claims/approve
   *
   * Verifies the uploaded manifest's data hash matches what was signed by the
   * device, then calls DataCommerce.approveJobClaim on behalf of the evaluator
   * operator so the contributor can settle their payout.
   *
   * Body: { dataHash, cumulativeAmount, contributor }
   */
  .post("/:id/claims/approve", async (c) => {
    const jobId = parseJobId(c.req.param("id"));
    if (jobId === null) return c.json({ error: "invalid job id" }, 400);

    const body = await c.req.json().catch(() => null);
    const parsed = approveSchema.safeParse(body);
    console.log('parsed', parsed)
    if (!parsed.success) {
      return c.json(
        { error: parsed.error.issues[0]?.message ?? "invalid request body" },
        400,
      );
    }

    const job = await getJob(jobId);
    console.log('job', job);
    if (job.client === zeroAddress) {
      return c.json({ error: "job not found" }, 404);
    }
    if (job.status !== FUNDED && job.status !== SUBMITTED) {
      return c.json(
        {
          error: "job is not in a claimable state (Funded or Submitted)",
          onChainStatus: JOB_STATUS[job.status],
        },
        409,
      );
    }

    const { contributor, dataHash, cumulativeAmount } = parsed.data;

    // Fetch the upload manifest written by the provider and verify the hash.
    const manifest = await getStoredManifest(jobId.toString(), dataHash);
    console.log('manifest', manifest)
    if (!manifest) return c.json({ error: "upload manifest not found" }, 404);

    // Re-derive the data hash from the stored files to confirm the manifest
    // wasn't tampered with and matches what the device signed.
    const recomputedHash = computeDataHash(sortFilesByName(manifest.files));
    if (recomputedHash !== dataHash) {
      return c.json(
        {
          error: "data hash mismatch — manifest files do not hash to dataHash",
        },
        422,
      );
    }

    const txHash = await approveJobClaim(
      jobId,
      cumulativeAmount,
      dataHash,
      contributor,
    );

    return c.json({
      jobId: jobId.toString(),
      contributor,
      dataHash,
      cumulativeAmount: cumulativeAmount.toString(),
      txHash,
    });
  });
