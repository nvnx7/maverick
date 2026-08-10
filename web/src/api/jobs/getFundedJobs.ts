import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import { dataCommerceAbi } from "@/abi";
import { useJobCreatedLogs } from "@/api/blockscout/getJobCreatedLogs";
import type { Modality } from "@/config/constants";
import { PRICE_PER_ITEM } from "@/config/constants";
import { networkConfig } from "@/config/network";
import { type FundedRequest, JobStatus, type RequestSpec } from "@/types";
import { decodeSpec } from "@/utils/spec";

const FALLBACK_SPEC: RequestSpec = {
  modality: "video",
  deviceRequirements: "",
  minItems: 0,
};

/**
 * Job ids come from the escrow's JobCreated logs, filtered to our ProviderAgent.
 * No client filter here — the browse list spans every buyer. Each id is then read
 * individually for the status/description a card needs, since the event carries neither.
 */
export function useGetFundedJobs(modality?: Modality) {
  const dataCommerce = networkConfig.contracts.dataCommerce as `0x${string}`;
  const createdQuery = useJobCreatedLogs({});

  const jobIds = useMemo(
    () =>
      [
        ...new Set((createdQuery.data ?? []).map((log) => log.args.jobId)),
      ].filter((jobId): jobId is bigint => jobId !== undefined),
    [createdQuery.data],
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

  const data = useMemo<FundedRequest[]>(() => {
    if (!jobsQuery.data) return [];

    return jobIds
      .map((jobId, index): FundedRequest | null => {
        const result = jobsQuery.data[index];
        if (result?.status !== "success") return null;
        const job = result.result;
        if (job.status !== JobStatus.Funded) return null;

        const spec = decodeSpec(job.description) ?? FALLBACK_SPEC;
        if (modality && spec.modality !== modality) return null;

        return {
          id: jobId.toString(),
          status: job.status as JobStatus,
          spec,
          pricePerItem: PRICE_PER_ITEM[spec.modality],
          budgetRemaining: job.budget - job.settledAmount,
        };
      })
      .filter((request): request is FundedRequest => request !== null);
  }, [jobIds, jobsQuery.data, modality]);

  return {
    data,
    // A disabled query reports `pending` forever, so jobsQuery must only count while it
    // actually has ids to fetch — otherwise an empty chain never stops loading.
    isPending:
      createdQuery.isPending || (jobIds.length > 0 && jobsQuery.isPending),
    isError: createdQuery.isError || jobsQuery.isError,
  };
}
