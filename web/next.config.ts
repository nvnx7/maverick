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
    return [
      {
        source: "/api/blockscout",
        destination: `https://api.blockscout.com/v2/api?apikey=${process.env.BLOCKSCOUT_API_KEY}`,
      },
    ];
  },
};

export default nextConfig;
