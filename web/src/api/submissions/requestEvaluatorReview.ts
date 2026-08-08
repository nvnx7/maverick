import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Address, Hash } from "viem";
import { httpEvaluator } from "../client";

export type RequestEvaluatorReviewParams = {
  jobId: string;
  dataHash: Hash;
  cumulativeAmount: bigint;
  contributor: Address;
};

export type RequestEvaluatorReviewResult = {
  jobId: string;
  contributor: Address;
  dataHash: Hash;
  cumulativeAmount: string;
  txHash: Hash;
};

export function requestEvaluatorReview(
  params: RequestEvaluatorReviewParams,
): Promise<RequestEvaluatorReviewResult> {
  return httpEvaluator
    .post<RequestEvaluatorReviewResult>(
      `/jobs/${params.jobId}/claims/approve`,
      {
        dataHash: params.dataHash,
        cumulativeAmount: params.cumulativeAmount.toString(),
        contributor: params.contributor,
      },
    )
    .then(({ data }) => data);
}

export function useRequestEvaluatorReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestEvaluatorReview,
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["request-submissions", result.jobId],
      });
    },
  });
}

