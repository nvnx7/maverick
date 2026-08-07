import { type Address, type Chain, zeroAddress } from "viem";
import { anvil, arcTestnet as arcTestnetChain } from "viem/chains";
import { env, rpcArcTestnet, rpcLocal } from "./env";

export type NetworkConfig = {
  chain: Chain;
  rpcUrl: string;
  explorerUrl: string;
  deployedBlock: bigint;
  contracts: {
    dataCommerce: Address;
    escrow: Address;
    provider: Address;
    evaluator: Address;
    usdc: Address;
  };
};

export const local: NetworkConfig = {
  chain: anvil,
  rpcUrl: rpcLocal,
  explorerUrl: "",
  deployedBlock: 0n,
  contracts: {
    dataCommerce: "0x0B306BF915C4d645ff596e518fAf3F9669b97016",
    escrow: "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
    provider: "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1",
    evaluator: "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE",
    usdc: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  },
};

export const arcTestnet: NetworkConfig = {
  chain: arcTestnetChain,
  rpcUrl: rpcArcTestnet,
  explorerUrl: "https://testnet.arcscan.app",
  deployedBlock: 0n,
  contracts: {
    dataCommerce: zeroAddress,
    escrow: zeroAddress,
    provider: zeroAddress,
    evaluator: zeroAddress,
    usdc: "0x3600000000000000000000000000000000000000",
  },
};

const networkConfigs: Record<number, NetworkConfig> = {
  [anvil.id]: local,
  [arcTestnetChain.id]: arcTestnet,
};

const chainId = env === "production" ? arcTestnet.chain.id : local.chain.id;
export const networkConfig = networkConfigs[chainId] as NetworkConfig;
