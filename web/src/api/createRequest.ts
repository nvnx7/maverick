import { useMutation } from "@tanstack/react-query";
import type { Hash } from "viem";
import { nextJobId, SIMULATED_CREATE_TX } from "@/mocks/data";
import type { RequestSpec } from "@/types";
import { mock } from "./client";

export type CreateRequestParams = {
  spec: RequestSpec;
  budget: bigint;
  expiresInDays: number;
};

export type CreateRequestResult = {
  jobId: string;
  txHash: Hash;
};

/** Stubbed write — becomes wagmi useWriteContract against DataCommerce.createSignetJob. */
export function createRequest(
  _params: CreateRequestParams,
): Promise<CreateRequestResult> {
  return mock({ jobId: nextJobId(), txHash: SIMULATED_CREATE_TX }, 1400);
}

export function useCreateRequest() {
  return useMutation({ mutationFn: createRequest });
}
