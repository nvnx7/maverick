import { anvil, arcTestnet as arcTestnetChain } from "viem/chains";
import { env, rpcArcTestnet, rpcLocal } from "./env";

/** Gas on Arc is paid in USDC; there is no separate native token. */
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as const;
const USDC_DECIMALS = 6;

export const local = {
  chain: anvil,
  rpcUrl: rpcLocal,
  explorerUrl: "",
  contracts: {
    dataCommerce: "",
    escrow: "",
    usdc: USDC_ADDRESS,
    usdcDecimals: USDC_DECIMALS,
  },
};

export const arcTestnet = {
  chain: arcTestnetChain,
  rpcUrl: rpcArcTestnet,
  explorerUrl: "https://testnet.arcscan.app",
  contracts: {
    dataCommerce: "",
    escrow: "",
    usdc: USDC_ADDRESS,
    usdcDecimals: USDC_DECIMALS,
  },
};

const networkConfigs = {
  [anvil.id]: local,
  [arcTestnetChain.id]: arcTestnet,
};

const chainId = env === "production" ? arcTestnet.chain.id : local.chain.id;
export const networkConfig = networkConfigs[chainId];
