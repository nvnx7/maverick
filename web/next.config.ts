import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile above the repo makes Next infer the wrong workspace root.
  turbopack: {
    root: path.join(path.dirname(fileURLToPath(import.meta.url)), ".."),
  },
  // Next 16 cannot use the TypeScript 7 compiler API; drive tsc through its CLI instead.
  experimental: {
    useTypeScriptCli: true,
    optimizePackageImports: ["@chakra-ui/react"],
  },
  // Proxies Blockscout calls through our own origin so the browser never talks to
  // api.blockscout.com directly: sidesteps their CORS restrictions and keeps the paid
  // API key server-side instead of shipping it in the client bundle.
  async rewrites() {
    if (!process.env.NEXT_PUBLIC_API_KEY_BLOCKSCOUT) {
      throw new Error(
        "NEXT_PUBLIC_API_KEY_BLOCKSCOUT is not set — Blockscout requests would silently go out unauthenticated.",
      );
    }

    return [
      {
        source: "/api/blockscout",
        destination: `https://api.blockscout.com/v2/api?apikey=${process.env.NEXT_PUBLIC_API_KEY_BLOCKSCOUT}`,
      },
    ];
  },
};

export default nextConfig;
