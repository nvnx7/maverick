"use client";

import { Stack, Text, Heading } from "@chakra-ui/react";
import { useRegisterDevice } from "@/api/devices";
import { Button } from "@/components/common/Button";
import { Panel } from "@/components/common/Panel";
import { LoadingBlock } from "@/components/common/QueryState";
import { useDevice } from "@/hooks/useDevice";
import { DeviceRegisteredCard } from "./DeviceRegisteredCard";

export function DeviceSetupPanel() {
  const { device, ready, provision } = useDevice();
  const registerDevice = useRegisterDevice();

  if (!ready) return <LoadingBlock label="Checking device hardware status" />;
  if (device) return <DeviceRegisteredCard />;

  async function handleSetup() {
    const next = provision();
    await registerDevice.mutateAsync({
      deviceId: next.deviceId,
      pubkey: next.pubkey,
    });
  }

  return (
    <Panel maxW="2xl" p={8}>
      <Stack gap={5} align="flex-start">
        <Heading textStyle="headline-md" color="primary" fontSize="22px" fontWeight="700">
          Set Up Contributor Hardware Device
        </Heading>

        <Text textStyle="body-md" color="fg.muted" lineHeight="1.7" fontSize="15px">
          This provisions an isolated cryptographic signing key on your local device. Your private key remains strictly on this device. Every dataset submission is signed by this enclave key to verify proof of hardware capture before disburser payouts are unlocked.
        </Text>

        <Button
          variant="primary"
          px={8}
          py={6}
          fontSize="md"
          onClick={handleSetup}
          loading={registerDevice.isPending}
          loadingText="Registering Device Key"
        >
          Set Up Hardware Device
        </Button>

        {registerDevice.isError && (
          <Text fontSize="sm" color="red.500" fontWeight="600">
            {registerDevice.error.message}
          </Text>
        )}
      </Stack>
    </Panel>
  );
}

