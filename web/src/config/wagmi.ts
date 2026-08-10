import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rabbyWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { walletConnectProjectId } from "./env";
import { arcTestnet, local, networkConfig } from "./network";

// We don't offer WalletConnect as a connect method, but RainbowKit's named
// wallet connectors (MetaMask, Rabby, Coinbase) still fall back to its
// WalletConnect-backed QR flow when that wallet isn't detected in-browser
// (always true during SSR), and eagerly construct that fallback connector
// even if it's never used — see walletConnectProjectId in ./env.
// injectedWallet connects directly to whatever extension is actually
// installed, bypassing WalletConnect entirely, and is a reliable fallback
// when browser-extension conflicts throw off a named wallet's detection.
const connectors = connectorsForWallets(
  [
    {
      groupName: "Installed",
      wallets: [metaMaskWallet, rabbyWallet, coinbaseWallet, injectedWallet],
    },
  ],
  {
    appName: "Maverick",
    projectId: walletConnectProjectId,
  },
);

export const wagmiConfig = createConfig({
  connectors,
  chains: [networkConfig.chain],
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
