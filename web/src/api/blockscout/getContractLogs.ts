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
 * A decoded log, plus the block time Blockscout returns alongside it. Event data alone
 * carries no timestamp, and fetching one block per log just to date a row is wasteful
 * when the API already includes it.
 */
export type DecodedLog<
  abi extends Abi,
  eventName extends ContractEventName<abi>,
> = GetContractEventsReturnType<abi, eventName>[number] & {
  blockTimestamp: number;
};

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
}): Promise<DecodedLog<abi, eventName>[]> {
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

  // An empty match is a normal result, not a failure. Blockscout signals it with
  // status "0" and a not-found message whose exact wording varies by deployment and
  // endpoint ("No logs found", "No records found"), so match the shape rather than one
  // literal — treating it as an error surfaced a red failure block on every job that
  // simply had no claims yet.
  if (data.status !== "1") {
    if (/^no .*found$/i.test(data.message?.trim() ?? "")) {
      return [];
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
      // Hex ("0x…") or decimal, depending on the deployment; Number handles both.
      blockTimestamp: Number(log.timeStamp),
    };
  }) as unknown as DecodedLog<abi, eventName>[];
}
