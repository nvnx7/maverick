import { useQuery } from "@tanstack/react-query";
import { buyerRequests, simulatedReview } from "@/mocks/data";
import { JobStatus, type RequestStatusReport } from "@/types";
import { mock } from "../client";

/** GET /jobs/:id/status — the provider's read-only review of a job. */
export function getRequestStatus(id: string): Promise<RequestStatusReport> {
  const known = buyerRequests.find((item) => item.id === id);

  if (known) {
    return mock({
      jobId: id,
      onChainStatus: JobStatus[known.status] as keyof typeof JobStatus,
      budget: known.budget,
      intendedBudget: known.budget,
      providerDecision: known.providerDecision,
      declineReason: known.declineReason,
    });
  }

  const decision = simulatedReview(id);
  return mock({
    jobId: id,
    onChainStatus: (decision === "agreed"
      ? "Funded"
      : "Open") as keyof typeof JobStatus,
    budget: 0n,
    intendedBudget: 0n,
    providerDecision: decision,
  });
}

/** Polls while the provider has not decided yet. */
export function useGetRequestStatus(id?: string, poll = false) {
  return useQuery({
    queryKey: ["request-status", id],
    queryFn: () => getRequestStatus(id as string),
    enabled: Boolean(id),
    refetchInterval: poll ? 2500 : false,
  });
}
