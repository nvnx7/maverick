import {
  createPublicClient,
  createWalletClient,
  http,
  type PublicClient,
  type WalletClient,
} from "viem";
import { type PrivateKeyAccount, privateKeyToAccount } from "viem/accounts";
import { arcTestnet } from "../config/chain";
import { operatorPrivateKey, rpcUrl } from "../config/env";

// Built on first use, not at import: chain config may be absent (or empty) in a fresh
// checkout, and the server should still boot and serve /health.
let account: PrivateKeyAccount | undefined;
let reader: PublicClient | undefined;
let writer: WalletClient | undefined;

export function getOperatorAccount(): PrivateKeyAccount {
  account ??= privateKeyToAccount(operatorPrivateKey);
  return account;
}

export function getPublicClient(): PublicClient {
  reader ??= createPublicClient({ chain: arcTestnet, transport: http(rpcUrl) });
  return reader;
}

export function getWalletClient(): WalletClient {
  writer ??= createWalletClient({
    account: getOperatorAccount(),
    chain: arcTestnet,
    transport: http(rpcUrl),
  });
  return writer;
}
