import { useMutation } from "@tanstack/react-query";
import { signTypedData } from "@wagmi/core";
import type { Address, Hash } from "viem";
import { keccak256, parseEventLogs, stringToBytes, zeroAddress } from "viem";
import { type Config, useAccount, useConfig } from "wagmi";
import { dataCommerceAbi } from "@/abi";
import { writeAndWait } from "@/api/tx";
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
 * Signs the buyer's EIP-712 job-creation authorization.
 *
 * @dev Returns the signed job fields alongside the signature. createDataJob must be
 *      called with exactly the values that were signed, so they are derived once here
 *      rather than recomputed by the caller — nonce and both timestamps read the clock
 *      and would otherwise differ between signing and submitting, failing verification.
 *      provider/evaluator likewise have to be the addresses the contract reconstructs
 *      on-chain, which is what networkConfig pins.
 */
const getAuthorizationSignature = async (params: {
  config: Config;
  signer: Address;
  spec: RequestSpec;
  expiresInDays: number;
}) => {
  const { config, signer, spec, expiresInDays } = params;
  const { escrow, provider, evaluator } = networkConfig.contracts;

  // uint48 in the ABI decodes/encodes as a plain number, not bigint.
  const expiredAt = Math.floor(Date.now() / 1000) + expiresInDays * 86_400;
  const description = encodeSpec(spec);
  const hook = zeroAddress;
  const providerAgentId = 0n;
  // No dedicated nonce service yet; wall-clock ms comfortably fits uint72.
  const nonce = BigInt(Date.now());
  const deadline = BigInt(Math.floor(Date.now() / 1000)) + AUTH_WINDOW_SECONDS;

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
      signer,
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

  return {
    job: { expiredAt, description, hook, providerAgentId },
    auth: { signer, nonce, deadline, sig },
  };
};

/** Signs the buyer's authorization, then submits it via DataCommerce.createDataJob. */
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

      const { job, auth } = await getAuthorizationSignature({
        config,
        signer: address,
        spec,
        expiresInDays,
      });

      // budget is not part of the authorization: the typehash never covers it.
      const receipt = await writeAndWait(config, {
        address: networkConfig.contracts.dataCommerce,
        abi: dataCommerceAbi,
        functionName: "createDataJob",
        args: [{ ...job }, auth],
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
