import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Hash } from "viem";
import type { DeclineReason, JobStatus, ProviderDecision } from "@/types";
import { httpProvider } from "../client";

type ActivateResponse = {
  jobId: string;
  providerDecision: ProviderDecision;
  onChainStatus?: keyof typeof JobStatus;
  budget?: string;
  declineReason?: DeclineReason;
  txHash?: Hash;
  alreadyActivated?: boolean;
};

export type ActivateResult = {
  jobId: string;
  providerDecision: ProviderDecision;
  budget?: bigint;
  declineReason?: DeclineReason;
  txHash?: Hash;
  alreadyActivated: boolean;
};

/** POST /jobs/:id/activate — sets the budget when agreed, rejects when declined. */
export async function activateRequest(id: string): Promise<ActivateResult> {
  const { data } = await httpProvider.post<ActivateResponse>(
    `/jobs/${id}/activate`,
  );
  return {
    jobId: data.jobId,
    providerDecision: data.providerDecision,
    budget: data.budget === undefined ? undefined : BigInt(data.budget),
    declineReason: data.declineReason,
    txHash: data.txHash,
    alreadyActivated: data.alreadyActivated ?? false,
  };
}

export function useActivateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activateRequest,
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["request-status", result.jobId],
      });
    },
  });
}
