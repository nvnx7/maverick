import { useMemo } from "react";
import { useContractEvents, useReadContracts } from "wagmi";
import { dataCommerceAbi } from "@/abi";
import type { Modality } from "@/config/constants";
import { PRICE_PER_ITEM } from "@/config/constants";
import { networkConfig } from "@/config/network";
import { JobStatus, type OpenRequest, type RequestSpec } from "@/types";
import { decodeSpec } from "@/utils/spec";

const FALLBACK_SPEC: RequestSpec = {
  modality: "video",
  deviceRequirements: "",
  minItems: 0,
};

/**
 * Job ids come from DataJobCreated logs; each id is then read individually for the
 * status/description a card needs, since neither event carries them.
 */
export function useGetOpenJobs(modality?: Modality) {
  const dataCommerce = networkConfig.contracts.dataCommerce as `0x${string}`;

  const createdQuery = useContractEvents({
    address: dataCommerce,
    abi: dataCommerceAbi,
    eventName: "DataJobCreated",
    fromBlock: 0n,
  });

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

  const data = useMemo<OpenRequest[]>(() => {
    if (!jobsQuery.data) return [];

    return jobIds
      .map((jobId, index): OpenRequest | null => {
        const result = jobsQuery.data[index];
        if (result?.status !== "success") return null;
        const job = result.result;
        if (job.status !== JobStatus.Open) return null;

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
      .filter((request): request is OpenRequest => request !== null);
  }, [jobIds, jobsQuery.data, modality]);

  return {
    data,
    isPending: createdQuery.isPending || jobsQuery.isPending,
    isError: createdQuery.isError || jobsQuery.isError,
  };
}
