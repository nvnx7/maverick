import type { Client, PublicClient, WalletClient } from "viem";

/**
 * viem accepts either a single client or a public/wallet pair for `getContract`.
 * Its own `KeyedClient` type is not exported, so the pair is restated here.
 */
export type ContractClient =
  | Client
  | { public: PublicClient; wallet?: WalletClient }
  | { public?: PublicClient; wallet: WalletClient };
