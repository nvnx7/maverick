"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/config/wagmi";
import { system } from "@/theme";
import { ColorModeProvider } from "./color-mode";

export function Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
      }),
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={system}>
          {/* Dark-only by design — the palette has no light variant. */}
          <ColorModeProvider forcedTheme="dark">{children}</ColorModeProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
