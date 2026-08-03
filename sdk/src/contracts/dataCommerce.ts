import { type Address, type GetContractReturnType, getContract } from "viem";
import { dataCommerceAbi } from "../abis/dataCommerce";
import type { ContractClient } from "./client";

export type DataCommerceContract<TClient extends ContractClient> =
  GetContractReturnType<typeof dataCommerceAbi, TClient, Address>;

export function getDataCommerce<TClient extends ContractClient>(
  address: Address,
  client: TClient,
): DataCommerceContract<TClient> {
  return getContract({ address, abi: dataCommerceAbi, client });
}
