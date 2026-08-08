import {
  createPublicClient,
  createWalletClient,
  http,
  type PublicClient,
  type WalletClient,
} from "viem";
import { type PrivateKeyAccount, privateKeyToAccount } from "viem/accounts";
import { evaluatorOperatorPrivateKey } from "../config/env";
import { networkConfig } from "../config/network";

let account: PrivateKeyAccount | undefined;
let reader: PublicClient | undefined;
let writer: WalletClient | undefined;

export function getEvaluatorAccount(): PrivateKeyAccount {
  account ??= privateKeyToAccount(evaluatorOperatorPrivateKey);
  return account;
}

export function getPublicClient(): PublicClient {
  reader ??= createPublicClient({
    chain: networkConfig.chain,
    transport: http(networkConfig.rpcUrl),
  });
  return reader;
}

export function getWalletClient(): WalletClient {
  writer ??= createWalletClient({
    account: getEvaluatorAccount(),
    chain: networkConfig.chain,
    transport: http(networkConfig.rpcUrl),
  });
  return writer;
}
