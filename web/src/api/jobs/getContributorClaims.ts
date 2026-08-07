import { useMemo } from "react";
import type { Address, Hash } from "viem";
import { decodeAbiParameters } from "viem";
import { useContractEvents } from "wagmi";
import { agenticCommerceAbi } from "@/abi";
import { networkConfig } from "@/config/network";

export type ContributorClaim = {
  jobId: string;
  contributor: Address;
  cumulativeAmount: bigint;
  delta: bigint;
  deliverable: Hash;
  blockNumber: bigint;
  transactionHash: Hash;
};

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
 * ClaimSubmitted only indexes jobId and provider, not the contributor — it's inside the
 * non-indexed optParams — so every claim for the job is fetched and decoded, then
 * filtered down to the given contributor.
 */
export function useGetContributorClaims(params: {
  jobId?: string;
  contributor?: Address;
}) {
  const { jobId, contributor } = params;
  const jobIdBigInt = jobId ? BigInt(jobId) : undefined;

  const claimsQuery = useContractEvents({
    address: networkConfig.contracts.escrow,
    abi: agenticCommerceAbi,
    eventName: "ClaimSubmitted",
    args: {
      jobId: jobIdBigInt,
      provider: networkConfig.contracts.provider,
    },
    fromBlock: networkConfig.deployedBlock,
    query: { enabled: jobIdBigInt !== undefined && Boolean(contributor) },
  });

  const data = useMemo<ContributorClaim[]>(() => {
    if (!claimsQuery.data || !contributor) return [];

    return claimsQuery.data
      .map((log): ContributorClaim | null => {
        const {
          jobId: logJobId,
          cumulativeAmount,
          delta,
          deliverable,
          optParams,
        } = log.args;
        if (
          logJobId === undefined ||
          cumulativeAmount === undefined ||
          delta === undefined ||
          deliverable === undefined ||
          optParams === undefined
        ) {
          return null;
        }

        const claimContributor = decodeContributor(optParams);
        if (!claimContributor) return null;

        return {
          jobId: logJobId.toString(),
          contributor: claimContributor,
          cumulativeAmount,
          delta,
          deliverable,
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
        };
      })
      .filter((claim): claim is ContributorClaim => claim !== null)
      .filter(
        (claim) =>
          claim.contributor.toLowerCase() === contributor.toLowerCase(),
      );
  }, [claimsQuery.data, contributor]);

  return {
    data,
    isPending: claimsQuery.isPending,
    isError: claimsQuery.isError,
    error: claimsQuery.error,
  };
}
