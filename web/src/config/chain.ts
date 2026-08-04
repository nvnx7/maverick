import { arcTestnet } from "viem/chains";

export const chain = arcTestnet;

export const EXPLORER_URL = "https://testnet.arcscan.app";

/** Gas on Arc is paid in USDC; there is no separate native token. */
export const USDC_ADDRESS =
  "0x3600000000000000000000000000000000000000" as const;

export const USDC_DECIMALS = 6;
