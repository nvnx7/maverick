import { useMutation, useQueryClient } from "@tanstack/react-query";
import { writeContractSync } from "@wagmi/core";
import type { Address, Hash } from "viem";
import { useConfig } from "wagmi";
import { dataCommerceAbi } from "@/abi";
import { networkConfig } from "@/config/network";

export type ApproveClaimParams = {
  jobId: string;
  cumulativeAmount: bigint;
  deliverable: Hash;
  contributor: Address;
};

export function useApproveClaim() {
  const config = useConfig();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      cumulativeAmount,
      deliverable,
      contributor,
    }: ApproveClaimParams): Promise<{ txHash: Hash }> => {
      const receipt = await writeContractSync(config, {
        address: networkConfig.contracts.dataCommerce,
        abi: dataCommerceAbi,
        functionName: "approveJobClaim",
        args: [BigInt(jobId), cumulativeAmount, deliverable, contributor],
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
