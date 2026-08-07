import { useMemo } from "react";
import { useContractEvents, useReadContract } from "wagmi";
import { agenticCommerceAbi, dataCommerceAbi } from "@/abi";
import { networkConfig } from "@/config/network";
import type { JobStatus, RequestDetail, RequestSpec } from "@/types";
import { decodeSpec } from "@/utils/spec";

const FALLBACK_SPEC: RequestSpec = {
  modality: "video",
  deviceRequirements: "",
  minItems: 0,
};

export function useGetJob(id?: string) {
  const jobId = id ? BigInt(id) : undefined;

  const jobQuery = useReadContract({
    address: networkConfig.contracts.dataCommerce as `0x${string}`,
    abi: dataCommerceAbi,
    functionName: "getJob",
    args: jobId !== undefined ? [jobId] : undefined,
    query: { enabled: jobId !== undefined },
  });

  const createdQuery = useContractEvents({
    address: networkConfig.contracts.escrow as `0x${string}`,
    abi: agenticCommerceAbi,
    eventName: "JobCreated",
    args: jobId !== undefined ? { jobId } : undefined,
    fromBlock: networkConfig.deployedBlock,
    query: { enabled: jobId !== undefined },
  });

  const data = useMemo<RequestDetail | undefined>(() => {
    if (!id || !jobQuery.data) return undefined;
    const job = jobQuery.data;
    const createdTxHash = createdQuery.data?.[0]?.transactionHash;

    return {
      id,
      status: job.status as JobStatus,
      spec: decodeSpec(job.description) ?? FALLBACK_SPEC,
      budget: job.budget,
      spent: job.settledAmount,
      submissionCount: 0,
      createdAt: 0,
      // A job only exists on-chain once a provider has already accepted it.
      providerDecision: "agreed",
      description: job.description,
      client: job.client,
      provider: job.provider,
      evaluator: job.evaluator,
      contract: networkConfig.contracts.escrow as `0x${string}`,
      expiredAt: job.expiredAt,
      createdTxHash,
    };
  }, [id, jobQuery.data, createdQuery.data]);

  // The log lookup is supplementary, so it gates neither loading nor error state — the
  // page renders as soon as getJob returns.
  return {
    data,
    isPending: jobQuery.isPending,
    isError: jobQuery.isError,
    error: jobQuery.error,
    refetch: jobQuery.refetch,
  };
}
