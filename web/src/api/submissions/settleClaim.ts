import { useMutation, useQueryClient } from "@tanstack/react-query";
import { writeContractSync } from "@wagmi/core";
import { type Address, encodeAbiParameters, type Hash } from "viem";
import { useConfig } from "wagmi";
import { agenticCommerceAbi } from "@/abi";
import { networkConfig } from "@/config/network";

export type SettleClaimParams = {
  jobId: string;
  cumulativeAmount: bigint;
  deliverable: Hash;
  contributor: Address;
};

export function useSettleClaim() {
  const config = useConfig();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      cumulativeAmount,
      deliverable,
      contributor,
    }: SettleClaimParams): Promise<{ txHash: Hash }> => {
      const receipt = await writeContractSync(config, {
        address: networkConfig.contracts.escrow,
        abi: agenticCommerceAbi,
        functionName: "settleClaim",
        args: [
          BigInt(jobId),
          cumulativeAmount,
          deliverable,
          encodeAbiParameters([{ type: "address" }], [contributor]),
        ],
      });

      return { txHash: receipt.transactionHash };
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({
        queryKey: ["request-submissions", params.jobId],
      });
    },
  });
}
