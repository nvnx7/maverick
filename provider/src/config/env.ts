import dotenv from "dotenv";
import type { Hex } from "viem";

dotenv.config();

export const env = process.env.NODE_ENV as string;

export const rpcLocal = process.env.RPC_LOCAL as string;
export const rpcArcTestnet = process.env.RPC_ARC_TESTNET as string;

export const providerOperatorPrivateKeyLocal = process.env
  .PROVIDER_PRIVATE_KEY_LOCAL as Hex;
export const providerOperatorPrivateKeyArcTestnet = process.env
  .PROVIDER_PRIVATE_KEY_ARC_TESTNET as Hex;

export const providerOperatorPrivateKey = env === "production"
  ? providerOperatorPrivateKeyArcTestnet
  : providerOperatorPrivateKeyLocal;

