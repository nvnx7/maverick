import { parseAbi } from "viem";
import { dataCommerceAddress } from "../config/env";
import {
  getOperatorAccount,
  getPublicClient,
  getWalletClient,
} from "./clients";

export type Job = {
  client: `0x${string}`;
  status: number;
  provider: `0x${string}`;
  expiredAt: bigint;
  evaluator: `0x${string}`;
  budget: bigint;
  paymentToken: `0x${string}`;
  description: string;
  settledAmount: bigint;
  payoutReceiver: `0x${string}`;
};

export const dataCommerceAbi = parseAbi([
  "struct Job { address client; uint8 status; address provider; uint48 expiredAt; address evaluator; uint48 submittedAt; uint256 budget; address hook; address paymentToken; uint256 providerAgentId; string description; uint256 settledAmount; address payoutReceiver; }",
  "function getJob(uint256 jobId) view returns (Job)",
  "function setJobBudget(uint256 jobId, uint256 budget)",
  "function rejectOpenJob(uint256 jobId, bytes32 reason)",
]);

export async function getJob(jobId: bigint): Promise<Job> {
  const job = await getPublicClient().readContract({
    address: dataCommerceAddress,
    abi: dataCommerceAbi,
    functionName: "getJob",
    args: [jobId],
  });

  return {
    client: job.client,
    status: job.status,
    provider: job.provider,
    expiredAt: BigInt(job.expiredAt),
    evaluator: job.evaluator,
    budget: job.budget,
    paymentToken: job.paymentToken,
    description: job.description,
    settledAmount: job.settledAmount,
    payoutReceiver: job.payoutReceiver,
  };
}

/** Routed through DataCommerce: only the ProviderAgent may call the escrow. */
export async function setJobBudget(
  jobId: bigint,
  budget: bigint,
): Promise<`0x${string}`> {
  const wallet = getWalletClient();
  return wallet.writeContract({
    account: getOperatorAccount(),
    chain: wallet.chain,
    address: dataCommerceAddress,
    abi: dataCommerceAbi,
    functionName: "setJobBudget",
    args: [jobId, budget],
  });
}

export async function rejectOpenJob(
  jobId: bigint,
  reason: `0x${string}`,
): Promise<`0x${string}`> {
  const wallet = getWalletClient();
  return wallet.writeContract({
    account: getOperatorAccount(),
    chain: wallet.chain,
    address: dataCommerceAddress,
    abi: dataCommerceAbi,
    functionName: "rejectOpenJob",
    args: [jobId, reason],
  });
}
