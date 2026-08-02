import dotenv from "dotenv";

dotenv.config();

export const nodeEnv = process.env.NODE_ENV as string;
export const rpcUrl = process.env.RPC_ARC_TESTNET as string;

/** EvaluatorAgent contract — the on-chain evaluator seat, not an operator key. */
export const evaluatorAddress = process.env.ADDRESS_EVALUATOR as `0x${string}`;
/** ProviderAgent contract — this provider's on-chain seat, not the operator key. */
export const providerAddress = process.env.ADDRESS_PROVIDER as `0x${string}`;
/** DataCommerce entrypoint. Provider writes route through it, never direct to the escrow. */
export const dataCommerceAddress = process.env
  .ADDRESS_DATA_COMMERCE as `0x${string}`;

/** Holds PROVIDER_ROLE on DataCommerce; drives the ProviderAgent. */
export const operatorPrivateKey = process.env
  .PROVIDER_OPERATOR_PRIVATE_KEY as `0x${string}`;
