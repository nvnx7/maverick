import { useQuery } from "@tanstack/react-query";
import type {
  DeclineReason,
  JobStatus,
  ProviderDecision,
  RequestStatusReport,
} from "@/types";
import { http } from "../client";

type StatusResponse = {
  jobId: string;
  onChainStatus: keyof typeof JobStatus;
  budget: string;
  intendedBudget: string;
  providerDecision: ProviderDecision;
  declineReason?: DeclineReason;
};

/** GET /jobs/:id/status — the provider's read-only review. Never writes. */
export async function getProviderJobStatus(
  id: string,
): Promise<RequestStatusReport> {
  const { data } = await http.get<StatusResponse>(`/jobs/${id}/status`);
  return {
    jobId: data.jobId,
    onChainStatus: data.onChainStatus,
    budget: BigInt(data.budget),
    intendedBudget: BigInt(data.intendedBudget),
    providerDecision: data.providerDecision,
    declineReason: data.declineReason,
  };
}

export function useGetRequestStatus(params: {
  id?: string;
  poll?: boolean;
  enabled?: boolean;
}) {
  const { id, poll = false, enabled = true } = params;
  return useQuery({
    queryKey: ["request-status", id],
    queryFn: () => getProviderJobStatus(id as string),
    enabled: Boolean(id) && enabled,
    refetchInterval: poll ? 2500 : false,
  });
}
