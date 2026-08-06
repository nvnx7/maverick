import { useMutation } from "@tanstack/react-query";
import { writeContractSync } from "@wagmi/core";
import { erc20Abi, type Hash } from "viem";
import { useConfig } from "wagmi";
import { agenticCommerceAbi } from "@/abi";
import { networkConfig } from "@/config/network";

export type FundJobParams = {
  jobId: string;
  amount: bigint;
};

/** USDC approve, then AgenticCommerce.fund — funding is called directly on the escrow. */
export function useFundJob() {
  const config = useConfig();

  return useMutation({
    mutationFn: async ({
      jobId,
      amount,
    }: FundJobParams): Promise<{ txHash: Hash }> => {
      const escrow = networkConfig.contracts.escrow as `0x${string}`;
      const usdc = networkConfig.contracts.usdc as `0x${string}`;

      await writeContractSync(config, {
        address: usdc,
        abi: erc20Abi,
        functionName: "approve",
        args: [escrow, amount],
      });

      const receipt = await writeContractSync(config, {
        address: escrow,
        abi: agenticCommerceAbi,
        functionName: "fund",
        args: [BigInt(jobId), usdc, amount, "0x"],
      });

      return { txHash: receipt.transactionHash };
    },
  });
}
