import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { chain } from "./chain";
import { rpcArcTestnet } from "./env";

export const wagmiConfig = createConfig({
  chains: [chain],
  connectors: [injected()],
  // Falls back to the chain's default RPC when the env var is unset.
  transports: { [chain.id]: http(rpcArcTestnet) },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
