import { networkConfig } from "@/config/network";

export function addressUrl(address: string): string {
  return `${networkConfig.explorerUrl}/address/${address}`;
}

export function txUrl(hash: string): string {
  return `${networkConfig.explorerUrl}/tx/${hash}`;
}
