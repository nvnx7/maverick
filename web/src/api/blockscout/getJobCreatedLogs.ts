import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { agenticCommerceAbi } from "@/abi";
import { networkConfig } from "@/config/network";
import { getContractLogs } from "./getContractLogs";

function getJobCreatedLogs(params: { client?: Address }) {
  return getContractLogs({
    address: networkConfig.contracts.escrow,
    abi: agenticCommerceAbi,
    eventName: "JobCreated",
    args: { client: params.client, provider: networkConfig.contracts.provider },
    fromBlock: networkConfig.deployedBlock,
  });
}

/** Used by both useGetBuyerJobs (client-scoped) and useGetFundedJobs (provider-wide browse). */
export function useJobCreatedLogs(params: {
  client?: Address;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["blockscout-job-created", params.client],
    queryFn: () => getJobCreatedLogs(params),
    enabled: params.enabled ?? true,
  });
}
