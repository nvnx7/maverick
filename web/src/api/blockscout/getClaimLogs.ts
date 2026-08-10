import { useQuery } from "@tanstack/react-query";
import { agenticCommerceAbi } from "@/abi";
import { networkConfig } from "@/config/network";
import { getContractLogs } from "./getContractLogs";

/** ClaimSubmitted only indexes jobId and provider — see useGetContributorClaims. */
export function useClaimSubmittedLogs(params: {
  jobId?: bigint;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: ["blockscout-claim-submitted", params.jobId?.toString()],
    queryFn: () =>
      getContractLogs({
        address: networkConfig.contracts.escrow,
        abi: agenticCommerceAbi,
        eventName: "ClaimSubmitted",
        args: {
          jobId: params.jobId,
          provider: networkConfig.contracts.provider,
        },
        fromBlock: networkConfig.deployedBlock,
      }),
    enabled: params.enabled,
  });
}

export function useClaimApprovedLogs(params: {
  jobId?: bigint;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: ["blockscout-claim-approved", params.jobId?.toString()],
    queryFn: () =>
      getContractLogs({
        address: networkConfig.contracts.escrow,
        abi: agenticCommerceAbi,
        eventName: "ClaimApproved",
        args: { jobId: params.jobId },
        fromBlock: networkConfig.deployedBlock,
      }),
    enabled: params.enabled,
  });
}

/** ClaimSettled carries the deliverable so it can be matched to a submitted claim. */
export function useClaimSettledLogs(params: {
  jobId?: bigint;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: ["blockscout-claim-settled", params.jobId?.toString()],
    queryFn: () =>
      getContractLogs({
        address: networkConfig.contracts.escrow,
        abi: agenticCommerceAbi,
        eventName: "ClaimSettled",
        args: { jobId: params.jobId },
        fromBlock: networkConfig.deployedBlock,
      }),
    enabled: params.enabled,
  });
}
