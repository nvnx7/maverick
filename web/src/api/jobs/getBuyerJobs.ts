import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { Address } from "viem";
import { usePublicClient, useReadContracts } from "wagmi";
import { dataCommerceAbi } from "@/abi";
import { useJobCreatedLogs } from "@/api/blockscout/getJobCreatedLogs";
import { networkConfig } from "@/config/network";
import type { BuyerRequest, JobStatus, RequestSpec } from "@/types";
import { decodeSpec } from "@/utils/spec";

const FALLBACK_SPEC: RequestSpec = {
  modality: "video",
  deviceRequirements: "",
  minItems: 0,
};

export function useGetBuyerJobs(params: { buyer?: Address }) {
  const { buyer } = params;
  const dataCommerce = networkConfig.contracts.dataCommerce as `0x${string}`;
  const publicClient = usePublicClient();

  const createdQuery = useJobCreatedLogs({ client: buyer });

  const logs = createdQuery.data ?? [];
  const jobIds = useMemo(
    () =>
      [...new Set(logs.map((log) => log.args.jobId))].filter(
        (jobId): jobId is bigint => jobId !== undefined,
      ),
    [logs],
  );
  const blockNumbers = useMemo(
    () => [...new Set(logs.map((log) => log.blockNumber))],
    [logs],
  );

  const jobsQuery = useReadContracts({
    contracts: jobIds.map(
      (jobId) =>
        ({
          address: dataCommerce,
          abi: dataCommerceAbi,
          functionName: "getJob",
          args: [jobId],
        }) as const,
    ),
    query: { enabled: jobIds.length > 0 },
  });

  /** eth_getLogs never carries a timestamp, so each distinct block is fetched once. */
  const blocksQuery = useQuery({
    queryKey: ["buyer-jobs-blocks", blockNumbers.map(String)],
    queryFn: async () => {
      const entries = await Promise.all(
        blockNumbers.map(async (blockNumber) => {
          const block = await publicClient?.getBlock({ blockNumber });
          return [
            blockNumber.toString(),
            Number(block?.timestamp ?? 0n),
          ] as const;
        }),
      );
      return new Map(entries);
    },
    enabled: blockNumbers.length > 0 && Boolean(publicClient),
  });

  const data = useMemo<BuyerRequest[]>(() => {
    if (!jobsQuery.data) return [];

    return jobIds
      .map((jobId, index): BuyerRequest | null => {
        const result = jobsQuery.data[index];
        if (result?.status !== "success") return null;
        const job = result.result;
        const log = logs.find((entry) => entry.args.jobId === jobId);
        const createdAt = log
          ? (blocksQuery.data?.get(log.blockNumber.toString()) ?? 0)
          : 0;

        return {
          id: jobId.toString(),
          status: job.status as JobStatus,
          spec: decodeSpec(job.description) ?? FALLBACK_SPEC,
          budget: job.budget,
          spent: job.settledAmount,
          submissionCount: 0,
          createdAt,
          providerDecision: "agreed",
        };
      })
      .filter((request): request is BuyerRequest => request !== null)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [jobIds, jobsQuery.data, logs, blocksQuery.data]);

  return {
    data,
    // A disabled query reports `pending` forever, so jobsQuery must only count while it
    // actually has ids to fetch — otherwise a buyer with no jobs never stops loading.
    isPending:
      createdQuery.isPending || (jobIds.length > 0 && jobsQuery.isPending),
    isError: createdQuery.isError || jobsQuery.isError,
    error: createdQuery.error ?? jobsQuery.error,
  };
}
