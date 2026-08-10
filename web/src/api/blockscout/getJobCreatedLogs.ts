import { useQuery } from "@tanstack/react-query";
import type { Address, Hash } from "viem";
import { decodeEventLog, encodeEventTopics } from "viem";
import { agenticCommerceAbi } from "@/abi";
import { networkConfig } from "@/config/network";
import { httpBlockscout } from "./client";
import { buildTopicParams } from "./topicParams";
import type { BlockscoutLogsResponse } from "./types";

export type JobCreatedLog = {
  args: {
    jobId: bigint;
    client: Address;
    provider: Address;
    evaluator: Address;
    expiredAt: number;
    hook: Address;
  };
  blockNumber: bigint;
  transactionHash: Hash;
};

/**
 * Same data as escrow's JobCreated logs (used by useGetBuyerJobs), but fetched from
 * Blockscout instead of eth_getLogs — the RPC caps a single query to a 100_000 block
 * range, which the full fromBlock..latest span since deployment already exceeds.
 */
async function getJobCreatedLogs(params: {
  client?: Address;
}): Promise<JobCreatedLog[]> {
  const topics = encodeEventTopics({
    abi: agenticCommerceAbi,
    eventName: "JobCreated",
    args: { client: params.client, provider: networkConfig.contracts.provider },
  });

  const { data } = await httpBlockscout.get<BlockscoutLogsResponse>("", {
    params: {
      module: "logs",
      action: "getLogs",
      address: networkConfig.contracts.escrow,
      fromBlock: networkConfig.deployedBlock.toString(),
      toBlock: "latest",
      ...buildTopicParams(topics),
    },
  });

  if (data.status !== "1") {
    if (data.message === "No records found") return [];
    throw new Error(data.message || "Blockscout getLogs request failed");
  }

  return data.result.map((log) => {
    const decoded = decodeEventLog({
      abi: agenticCommerceAbi,
      eventName: "JobCreated",
      topics: log.topics as [Hash, ...Hash[]],
      data: log.data as Hash,
    });

    return {
      args: decoded.args as unknown as JobCreatedLog["args"],
      blockNumber: BigInt(log.blockNumber),
      transactionHash: log.transactionHash as Hash,
    };
  });
}

export function useJobCreatedLogs(params: { client?: Address }) {
  return useQuery({
    queryKey: ["blockscout-job-created", params.client],
    queryFn: () => getJobCreatedLogs(params),
    enabled: Boolean(params.client),
  });
}
