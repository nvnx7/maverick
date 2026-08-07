import { useMutation } from "@tanstack/react-query";
import type { Hash } from "viem";
import { mock } from "../client";

export type RequestEvaluatorReviewParams = {
  jobId: string;
  dataHash: Hash;
};

export function requestEvaluatorReview(params: RequestEvaluatorReviewParams) {
  return mock(
    { requested: true, jobId: params.jobId, dataHash: params.dataHash },
    500,
  );
}

export function useRequestEvaluatorReview() {
  return useMutation({ mutationFn: requestEvaluatorReview });
}
