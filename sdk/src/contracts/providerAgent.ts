import { type Address, type GetContractReturnType, getContract } from "viem";
import { providerAgentAbi } from "../abis/providerAgent";
import type { ContractClient } from "./client";

export type ProviderAgentContract<TClient extends ContractClient> =
  GetContractReturnType<typeof providerAgentAbi, TClient, Address>;

export function getProviderAgent<TClient extends ContractClient>(
  address: Address,
  client: TClient,
): ProviderAgentContract<TClient> {
  return getContract({ address, abi: providerAgentAbi, client });
}
