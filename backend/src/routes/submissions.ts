import type { Context } from "hono";
import { recoverTypedDataAddress } from "viem";
import { getDevicePubkey } from "../lib/device-registry";
import { submissionDomain, submissionTypes } from "../lib/eip712";
import { ApiError, errorResponse } from "../lib/errors";
import { releasePayout } from "../lib/escrow";
import { getSpec } from "../lib/specs-store";
import { submitCaptureSchema } from "../schemas/submit-capture";
import type { SubmissionResult } from "../types";

export async function submitCapture(c: Context) {
  const specId = c.req.param("id");
  if (!specId) {
    return errorResponse(
      c,
      new ApiError(400, "bad_request", "missing spec id"),
    );
  }

  const body = await c.req.json().catch(() => null);
  const parsed = submitCaptureSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(
      c,
      new ApiError(400, "bad_request", "missing or malformed field"),
    );
  }

  const { deviceId, dataHash, timestamp, payoutAddress, signature } =
    parsed.data;

  const spec = await getSpec(specId);
  if (!spec) {
    return errorResponse(
      c,
      new ApiError(404, "spec_not_found", `no spec with id ${specId}`),
    );
  }

  if (spec.status !== "active") {
    return c.json(
      {
        submissionId: crypto.randomUUID(),
        result: "failed",
        reason: "spec_not_active",
      } satisfies SubmissionResult,
      200,
    );
  }

  const devicePubkey = await getDevicePubkey(deviceId);
  if (!devicePubkey) {
    return c.json(
      {
        submissionId: crypto.randomUUID(),
        result: "failed",
        reason: "unregistered_device",
      } satisfies SubmissionResult,
      200,
    );
  }

  let recovered: `0x${string}`;
  try {
    recovered = await recoverTypedDataAddress({
      domain: submissionDomain,
      types: submissionTypes,
      primaryType: "Submission",
      message: {
        specId,
        deviceId,
        dataHash,
        timestamp: BigInt(timestamp),
        payoutAddress,
      },
      signature,
    });
  } catch {
    return c.json(
      {
        submissionId: crypto.randomUUID(),
        result: "failed",
        reason: "invalid_signature",
      } satisfies SubmissionResult,
      200,
    );
  }

  if (recovered.toLowerCase() !== devicePubkey.toLowerCase()) {
    return c.json(
      {
        submissionId: crypto.randomUUID(),
        result: "failed",
        reason: "invalid_signature",
      } satisfies SubmissionResult,
      200,
    );
  }

  if (spec.remainingBudget < spec.pricePerItem) {
    return c.json(
      {
        submissionId: crypto.randomUUID(),
        result: "failed",
        reason: "budget_exhausted",
      } satisfies SubmissionResult,
      200,
    );
  }

  const payoutTxHash = await releasePayout(
    specId,
    payoutAddress,
    spec.pricePerItem,
  );

  return c.json(
    {
      submissionId: crypto.randomUUID(),
      result: "passed",
      payoutTxHash,
    } satisfies SubmissionResult,
    200,
  );
}
