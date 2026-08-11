import { useMemo } from "react";
import type { Address, Hash } from "viem";
import { decodeAbiParameters } from "viem";
import {
  useClaimApprovedLogs,
  useClaimSettledLogs,
  useClaimSubmittedLogs,
} from "@/api/blockscout/getClaimLogs";
import { useGetJob } from "@/api/jobs";
import type { Modality } from "@/config/constants";
import type { Submission } from "@/types";

/** optParams is abi.encode(contributor) — see DataCommerce.submitJobClaim. */
function decodeContributor(optParams: Hash): Address | null {
  try {
    const [contributor] = decodeAbiParameters([{ type: "address" }], optParams);
    return contributor;
  } catch {
    return null;
  }
}

/**
 * The buyer's view of a request's submissions, taken from the escrow's claim events.
 *
 * Unlike the contributor list this isn't filtered by address — the buyer sees every
 * contributor's claim on their job.
 *
 * Read from the chain rather than from storage: uploaded files are not submissions.
 * A capture is written to the bucket by /upload/init before any claim is submitted, so
 * listing the job's storage prefix also turns up abandoned or never-claimed uploads.
 * A ClaimSubmitted event is the only thing that actually asserts a submission.
 */
export function useGetRequestSubmissions(id?: string) {
  const jobId = id ? BigInt(id) : undefined;
  const enabled = jobId !== undefined;

  const submittedQuery = useClaimSubmittedLogs({ jobId, enabled });
  const approvedQuery = useClaimApprovedLogs({ jobId, enabled });
  const settledQuery = useClaimSettledLogs({ jobId, enabled });
  const job = useGetJob(id);

  const data = useMemo<Submission[]>(() => {
    if (!submittedQuery.data) return [];

    const paid = new Set<Hash>();
    for (const log of [
      ...(approvedQuery.data ?? []),
      ...(settledQuery.data ?? []),
    ]) {
      if (log.args.deliverable) paid.add(log.args.deliverable);
    }

    return submittedQuery.data
      .map((log): Submission | null => {
        const { cumulativeAmount, delta, deliverable, optParams } = log.args;
        if (
          cumulativeAmount === undefined ||
          delta === undefined ||
          deliverable === undefined ||
          optParams === undefined
        ) {
          return null;
        }

        const contributor = decodeContributor(optParams);
        if (!contributor) return null;

        return {
          // The claim hash is unique per submission, so it doubles as the row key.
          id: deliverable,
          jobId: id as string,
          contributor,
          modality: (job.data?.spec.modality ?? "image") as Modality,
          dataHash: deliverable,
          submittedAt: log.blockTimestamp,
          // Approval is what releases funds here, so there is no separate
          // "verified but unpaid" state to represent.
          status: paid.has(deliverable) ? "paid" : "pending",
          amount: delta,
          cumulativeAmount,
        };
      })
      .filter((submission): submission is Submission => submission !== null)
      .sort((a, b) => b.submittedAt - a.submittedAt);
  }, [
    submittedQuery.data,
    approvedQuery.data,
    settledQuery.data,
    id,
    job.data?.spec.modality,
  ]);

  return {
    data,
    isPending: submittedQuery.isPending,
    isError: submittedQuery.isError,
    error: submittedQuery.error,
  };
}
