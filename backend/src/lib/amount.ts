import { parseUnits } from "viem";

const USDC_DECIMALS = 6;
const DECIMAL_RE = /^\d+(\.\d{1,6})?$/;

export function parseUsdcAmount(value: string): bigint | null {
  if (!DECIMAL_RE.test(value)) return null;
  const amount = parseUnits(value, USDC_DECIMALS);
  return amount > 0n ? amount : null;
}
