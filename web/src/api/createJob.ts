import { useMutation } from "@tanstack/react-query";
import { readContract, signTypedData, writeContractSync } from "@wagmi/core";
import type { Hash } from "viem";
import { keccak256, parseEventLogs, stringToBytes, zeroAddress } from "viem";
import { useAccount, useConfig } from "wagmi";
import { dataCommerceAbi } from "@/abi";
import { networkConfig } from "@/config/network";
import type { RequestSpec } from "@/types";
import { encodeSpec } from "@/utils/spec";

export type CreateJobParams = {
  spec: RequestSpec;
  budget: bigint;
  expiresInDays: number;
};

export type CreateJobResult = {
  jobId: string;
  txHash: Hash;
};

/** How long the buyer's signed authorization stays redeemable. */
const AUTH_WINDOW_SECONDS = 600n;

/**
 * Signs the buyer's EIP-712 job-creation authorization, then submits it via
 * DataCommerce.createDataJob. provider/evaluator are read from DataCommerce itself —
 * the signature must commit to the exact addresses the contract will reconstruct
 * on-chain, or verification fails.
 */
export function useCreateJob() {
  const config = useConfig();
  const { address } = useAccount();

  return useMutation({
    mutationFn: async ({
      spec,
      budget,
      expiresInDays,
    }: CreateJobParams): Promise<CreateJobResult> => {
      if (!address) throw new Error("Connect a wallet first.");

      const dataCommerce = networkConfig.contracts
        .dataCommerce as `0x${string}`;
      const escrow = networkConfig.contracts.escrow as `0x${string}`;

      const [provider, evaluator] = await Promise.all([
        readContract(config, {
          address: dataCommerce,
          abi: dataCommerceAbi,
          functionName: "providerAgent",
        }),
        readContract(config, {
          address: dataCommerce,
          abi: dataCommerceAbi,
          functionName: "evaluatorAgent",
        }),
      ]);

      // uint48 in the ABI decodes/encodes as a plain number, not bigint.
      const expiredAt = Math.floor(Date.now() / 1000) + expiresInDays * 86_400;
      const description = encodeSpec(spec);
      const hook = zeroAddress;
      const providerAgentId = 0n;
      // No dedicated nonce service yet; wall-clock ms comfortably fits uint72.
      const nonce = BigInt(Date.now());
      const deadline =
        BigInt(Math.floor(Date.now() / 1000)) + AUTH_WINDOW_SECONDS;

      const sig = await signTypedData(config, {
        domain: {
          name: "ERC8183",
          version: "1",
          chainId: networkConfig.chain.id,
          verifyingContract: escrow,
        },
        types: {
          CreateJobAuthorization: [
            { name: "signer", type: "address" },
            { name: "provider", type: "address" },
            { name: "evaluator", type: "address" },
            { name: "expiredAt", type: "uint48" },
            { name: "descriptionHash", type: "bytes32" },
            { name: "hook", type: "address" },
            { name: "providerAgentId", type: "uint256" },
            { name: "nonce", type: "uint72" },
            { name: "deadline", type: "uint256" },
          ],
        },
        primaryType: "CreateJobAuthorization",
        message: {
          signer: address,
          provider,
          evaluator,
          expiredAt,
          descriptionHash: keccak256(stringToBytes(description)),
          hook,
          providerAgentId,
          nonce,
          deadline,
        },
      });

      const receipt = await writeContractSync(config, {
        address: dataCommerce,
        abi: dataCommerceAbi,
        functionName: "createDataJob",
        args: [
          { expiredAt, description, hook, providerAgentId, budget },
          { signer: address, nonce, deadline, sig },
        ],
      });

      const [created] = parseEventLogs({
        abi: dataCommerceAbi,
        eventName: "DataJobCreated",
        logs: receipt.logs,
      });
      if (!created) {
        throw new Error("createDataJob did not emit DataJobCreated");
      }

      return {
        jobId: created.args.jobId.toString(),
        txHash: receipt.transactionHash,
      };
    },
  });
}
