"use client";

import { Button, Stack, Text } from "@chakra-ui/react";
import { useRegisterDevice } from "@/api/registerDevice";
import { Panel } from "@/components/common/Panel";
import { LoadingBlock } from "@/components/common/QueryState";
import { useDevice } from "@/hooks/useDevice";
import { DeviceRegisteredCard } from "./DeviceRegisteredCard";

export function DeviceSetupPanel() {
  const { device, ready, provision } = useDevice();
  const registerDevice = useRegisterDevice();

  if (!ready) return <LoadingBlock label="Checking this device" />;
  if (device) return <DeviceRegisteredCard />;

  async function handleSetup() {
    const next = provision();
    await registerDevice.mutateAsync({
      deviceId: next.deviceId,
      pubkey: next.pubkey,
    });
  }

  return (
    <Panel maxW="2xl">
      <Stack gap={5} align="flex-start">
        <Text fontWeight="500">Set up this device</Text>

        <Text color="fg.muted" lineHeight="1.7">
          This creates a signing key on this device. It stays on this device —
          we never see your private key. Every capture you submit gets signed
          with it, and that signature is what releases your payout.
        </Text>

        <Button
          colorPalette="brand"
          onClick={handleSetup}
          loading={registerDevice.isPending}
          loadingText="Registering"
        >
          Set up this device
        </Button>

        {registerDevice.isError && (
          <Text fontSize="sm" color="warn.fg">
            {registerDevice.error.message}
          </Text>
        )}
      </Stack>
    </Panel>
  );
}
