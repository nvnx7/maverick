import { type Address, type GetContractReturnType, getContract } from "viem";
import { evaluatorAgentAbi } from "../abis/evaluatorAgent";
import type { ContractClient } from "./client";

export type EvaluatorAgentContract<TClient extends ContractClient> =
  GetContractReturnType<typeof evaluatorAgentAbi, TClient, Address>;

export function getEvaluatorAgent<TClient extends ContractClient>(
  address: Address,
  client: TClient,
): EvaluatorAgentContract<TClient> {
  return getContract({ address, abi: evaluatorAgentAbi, client });
}
