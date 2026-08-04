import type { Address, Hash } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const STORAGE_KEY = "maverick.device";

export type StoredDevice = {
  deviceId: string;
  privateKey: Hash;
  pubkey: Address;
  registeredAt: number;
};

/** Generated and kept in this browser. The private key is never transmitted. */
export function createDevice(): StoredDevice {
  const privateKey = generatePrivateKey();
  const { address } = privateKeyToAccount(privateKey);
  return {
    deviceId: `device:${address.slice(2, 14).toLowerCase()}`,
    privateKey,
    pubkey: address,
    registeredAt: Math.floor(Date.now() / 1000),
  };
}

export function readDevice(): StoredDevice | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredDevice;
  } catch {
    return null;
  }
}

export function saveDevice(device: StoredDevice): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(device));
}

export function clearDevice(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

/** Signs {dataHash, timestamp, payoutAddress} — payoutAddress is inside the payload
 *  so a valid submission can't be replayed against a different wallet. */
export async function signSubmission(
  device: StoredDevice,
  payload: { dataHash: Hash; timestamp: number; payoutAddress: Address },
): Promise<Hash> {
  const account = privateKeyToAccount(device.privateKey);
  return account.signMessage({
    message: JSON.stringify(payload),
  });
}
