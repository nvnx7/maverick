import { parseAbi } from "viem";
import { networkConfig } from "../config/network";
import {
  getEvaluatorAccount,
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
  "function approveJobClaim(uint256 jobId, uint256 cumulativeAmount, bytes32 deliverable, address contributor)",
  "function rejectJobClaim(uint256 jobId, uint256 cumulativeAmount, bytes32 deliverable, bytes32 reason, address contributor)",
]);

export async function getJob(jobId: bigint): Promise<Job> {
  const job = await getPublicClient().readContract({
    address: networkConfig.contracts.dataCommerce,
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

/** Routed through DataCommerce: only the EvaluatorAgent may call the escrow. */
export async function approveJobClaim(
  jobId: bigint,
  cumulativeAmount: bigint,
  deliverable: `0x${string}`,
  contributor: `0x${string}`,
): Promise<`0x${string}`> {
  const wallet = getWalletClient();
  return wallet.writeContract({
    account: getEvaluatorAccount(),
    chain: wallet.chain,
    address: networkConfig.contracts.dataCommerce,
    abi: dataCommerceAbi,
    functionName: "approveJobClaim",
    args: [jobId, cumulativeAmount, deliverable, contributor],
  });
}

export async function rejectJobClaim(
  jobId: bigint,
  cumulativeAmount: bigint,
  deliverable: `0x${string}`,
  reason: `0x${string}`,
  contributor: `0x${string}`,
): Promise<`0x${string}`> {
  const wallet = getWalletClient();
  return wallet.writeContract({
    account: getEvaluatorAccount(),
    chain: wallet.chain,
    address: networkConfig.contracts.dataCommerce,
    abi: dataCommerceAbi,
    functionName: "rejectJobClaim",
    args: [jobId, cumulativeAmount, deliverable, reason, contributor],
  });
}
