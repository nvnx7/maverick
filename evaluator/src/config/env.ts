import dotenv from "dotenv";
import type { Hex } from "viem";

dotenv.config();

export const env = process.env.NODE_ENV as string;

export const rpcLocal = process.env.RPC_LOCAL as string;
export const rpcArcTestnet = process.env.RPC_ARC_TESTNET as string;

export const evaluatorOperatorPrivateKeyLocal = process.env
  .EVALUATOR_PRIVATE_KEY_LOCAL as Hex;
export const evaluatorOperatorPrivateKeyArcTestnet = process.env
  .EVALUATOR_PRIVATE_KEY_ARC_TESTNET as Hex;

export const evaluatorOperatorPrivateKey =
  env === "production"
    ? evaluatorOperatorPrivateKeyArcTestnet
    : evaluatorOperatorPrivateKeyLocal;

export const s3EndpointUrl = process.env.S3_ENDPOINT_URL as string;
export const s3BucketName = process.env.S3_BUCKET_NAME as string;
export const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID as string;
export const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY as string;
