import { useQuery } from "@tanstack/react-query";
import { registeredDevice } from "@/mocks/data";
import type { DeviceRecord } from "@/types";
import { mock } from "./client";

/** Read-through cache of the on-chain device registry. */
export function getDevice(deviceId: string): Promise<DeviceRecord | null> {
  return mock(
    deviceId === registeredDevice.deviceId ? registeredDevice : null,
    250,
  );
}

export function useGetDevice(deviceId?: string) {
  return useQuery({
    queryKey: ["device", deviceId],
    queryFn: () => getDevice(deviceId as string),
    enabled: Boolean(deviceId),
  });
}
