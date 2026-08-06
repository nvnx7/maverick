import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";
import type { DeviceRecord } from "@/types";
import { mock } from "../client";

export type RegisterDeviceParams = {
  deviceId: string;
  pubkey: Address;
};

export function registerDevice(
  params: RegisterDeviceParams,
): Promise<DeviceRecord> {
  return mock(
    {
      deviceId: params.deviceId,
      pubkey: params.pubkey,
      registeredAt: Math.floor(Date.now() / 1000),
    },
    900,
  );
}

export function useRegisterDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerDevice,
    onSuccess: (device) => {
      queryClient.setQueryData(["device", device.deviceId], device);
    },
  });
}
