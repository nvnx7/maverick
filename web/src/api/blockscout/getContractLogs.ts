import type {
  Abi,
  Address,
  ContractEventName,
  EncodeEventTopicsParameters,
  GetContractEventsParameters,
  GetContractEventsReturnType,
  Hash,
} from "viem";
import { decodeEventLog, encodeEventTopics } from "viem";
import { httpBlockscout } from "./client";
import { buildTopicParams } from "./topicParams";
import type { BlockscoutLogsResponse } from "./types";

/**
 * Fetches and decodes contract event logs from Blockscout instead of eth_getLogs — the
 * RPC caps a single query to a 100_000 block range, which any fromBlock..latest span
 * since deployment is prone to exceed. Shared by every api/jobs event query.
 */
export async function getContractLogs<
  const abi extends Abi,
  eventName extends ContractEventName<abi>,
>(params: {
  address: Address;
  abi: abi;
  eventName: eventName;
  args?: GetContractEventsParameters<abi, eventName>["args"];
  fromBlock: bigint;
}): Promise<GetContractEventsReturnType<abi, eventName>> {
  const topics = encodeEventTopics({
    abi: params.abi,
    eventName: params.eventName,
    args: params.args,
  } as EncodeEventTopicsParameters<abi, eventName>);

  const { data } = await httpBlockscout.get<BlockscoutLogsResponse>("", {
    params: {
      module: "logs",
      action: "getLogs",
      address: params.address,
      fromBlock: params.fromBlock.toString(),
      toBlock: "latest",
      ...buildTopicParams(topics),
    },
  });

  if (data.status !== "1") {
    if (data.message === "No records found") {
      return [] as unknown as GetContractEventsReturnType<abi, eventName>;
    }
    throw new Error(data.message || "Blockscout getLogs request failed");
  }

  return data.result.map((log) => {
    const decoded = decodeEventLog({
      abi: params.abi,
      eventName: params.eventName,
      topics: log.topics as [Hash, ...Hash[]],
      data: log.data as Hash,
    });

    return {
      ...decoded,
      blockNumber: BigInt(log.blockNumber),
      transactionHash: log.transactionHash as Hash,
    };
  }) as unknown as GetContractEventsReturnType<abi, eventName>;
}
