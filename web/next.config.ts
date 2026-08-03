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
};

export default nextConfig;
