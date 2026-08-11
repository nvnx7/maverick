export const env = process.env.NODE_ENV as string;
export const isDev = env === "development";

export const rpcLocal = process.env.NEXT_PUBLIC_RPC_LOCAL as string;
// export const rpcArcTestnet = process.env.NEXT_PUBLIC_RPC_ARC_TESTNET as string;
export const rpcArcTestnet = 'https://rpc.testnet.arc.network' as string;

export const apiProvider = process.env.NEXT_PUBLIC_API_PROVIDER as string;
export const apiEvaluator = process.env.NEXT_PUBLIC_API_EVALUATOR as string;

export const apiKeyBlockscout = process.env
  .NEXT_PUBLIC_API_KEY_BLOCKSCOUT as string;
export const walletConnectProjectId = "maverick-app";
