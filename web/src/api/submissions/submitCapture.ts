import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Address, Hash } from "viem";
import { http } from "../client";

export type SubmitCaptureParams = {
  jobId: string;
  deviceId: string;
  dataHash: Hash;
  signature: Hash;
  payoutAddress: Address;
  dataRef: string;
};

export type SubmitCaptureResult = {
  jobId: string;
  contributor: Address;
  dataHash: Hash;
  fileCount: number;
  cumulativeAmount: bigint;
  txHash: Hash;
};

type SubmitCaptureResponse = Omit<SubmitCaptureResult, "cumulativeAmount"> & {
  cumulativeAmount: string;
};

export function submitCapture(
  params: SubmitCaptureParams,
): Promise<SubmitCaptureResult> {
  return http
    .post<SubmitCaptureResponse>(`/jobs/${params.jobId}/claims`, {
      address: params.payoutAddress,
      dataHash: params.dataHash,
    })
    .then(({ data }) => ({
      ...data,
      cumulativeAmount: BigInt(data.cumulativeAmount),
    }));
}

export function useSubmitCapture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitCapture,
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["contributor-claims", result.jobId],
      });
    },
  });
}
