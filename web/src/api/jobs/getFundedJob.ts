import { useMemo } from "react";
import { useReadContract } from "wagmi";
import { dataCommerceAbi } from "@/abi";
import { PRICE_PER_ITEM } from "@/config/constants";
import { networkConfig } from "@/config/network";
import { type FundedRequest, JobStatus, type RequestSpec } from "@/types";
import { decodeSpec } from "@/utils/spec";

const FALLBACK_SPEC: RequestSpec = {
  modality: "video",
  deviceRequirements: "",
  minItems: 0,
};

/** Same underlying read as useGetJob, shaped for the contributor's browse card. */
export function useGetFundedJob(id?: string) {
  const jobId = id ? BigInt(id) : undefined;

  const query = useReadContract({
    address: networkConfig.contracts.dataCommerce as `0x${string}`,
    abi: dataCommerceAbi,
    functionName: "getJob",
    args: jobId !== undefined ? [jobId] : undefined,
    query: { enabled: jobId !== undefined },
  });

  const data = useMemo<FundedRequest | undefined>(() => {
    if (!id || !query.data) return undefined;
    const job = query.data;
    if (job.status !== JobStatus.Funded) return undefined;
    const spec = decodeSpec(job.description) ?? FALLBACK_SPEC;

    return {
      id,
      status: job.status as JobStatus,
      spec,
      pricePerItem: PRICE_PER_ITEM[spec.modality],
      budgetRemaining: job.budget - job.settledAmount,
    };
  }, [id, query.data]);

  return { data, isPending: query.isPending, isError: query.isError };
}
