import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { arcTestnet, local, networkConfig } from "./network";

export const wagmiConfig = createConfig({
  chains: [networkConfig.chain],
  connectors: [injected()],
  // wagmi's transports type wants every chain id reachable across the union
  // networkConfig.chain can take, not just whichever one is active.
  transports: {
    [local.chain.id]: http(local.rpcUrl),
    [arcTestnet.chain.id]: http(arcTestnet.rpcUrl),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
