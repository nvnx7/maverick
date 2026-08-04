"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { arcTestnet } from "wagmi/chains";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";

export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Provider(props: ColorModeProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={defaultSystem}>
          <ColorModeProvider {...props} />
        </ChakraProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
