import { useMutation } from "@tanstack/react-query";
import type { Hash } from "viem";
import { SIMULATED_FUND_TX } from "@/mocks/data";
import { mock } from "./client";

export type FundRequestParams = {
  jobId: string;
  amount: bigint;
};

/** Stubbed write — becomes USDC approve followed by DataCommerce.fund. */
export function fundRequest(
  _params: FundRequestParams,
): Promise<{ txHash: Hash }> {
  return mock({ txHash: SIMULATED_FUND_TX }, 1600);
}

export function useFundRequest() {
  return useMutation({ mutationFn: fundRequest });
}
