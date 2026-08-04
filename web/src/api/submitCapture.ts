import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Address, Hash } from "viem";
import type { Submission } from "@/types";
import { mock } from "./client";

export type SubmitCaptureParams = {
  jobId: string;
  deviceId: string;
  dataHash: Hash;
  signature: Hash;
  payoutAddress: Address;
  dataRef: string;
};

export function submitCapture(
  params: SubmitCaptureParams,
): Promise<Pick<Submission, "id" | "jobId" | "dataHash" | "status">> {
  return mock(
    {
      id: `sub_${params.dataHash.slice(2, 6)}`,
      jobId: params.jobId,
      dataHash: params.dataHash,
      status: "pending" as const,
    },
    1000,
  );
}

export function useSubmitCapture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitCapture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-submissions"] });
    },
  });
}
