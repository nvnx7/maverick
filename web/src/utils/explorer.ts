import { EXPLORER_URL } from "@/config/chain";

export function addressUrl(address: string): string {
  return `${EXPLORER_URL}/address/${address}`;
}

export function txUrl(hash: string): string {
  return `${EXPLORER_URL}/tx/${hash}`;
}
