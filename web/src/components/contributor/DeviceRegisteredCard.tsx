"use client";

import { Box, Button, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { DataRow } from "@/components/common/DataRow";
import { Mono } from "@/components/common/Mono";
import { Panel } from "@/components/common/Panel";
import { routes } from "@/config/routes";
import { useDevice } from "@/hooks/useDevice";
import { formatDate } from "@/utils/format";

export function DeviceRegisteredCard() {
  const { device, forget } = useDevice();

  if (!device) return null;

  return (
    <Panel maxW="2xl">
      <Text fontWeight="500" color="brand.fg" mb={5}>
        This device is registered
      </Text>

      <Stack gap={0} mb={6}>
        <DataRow label="Device ID">
          <Mono>{device.deviceId}</Mono>
        </DataRow>
        <DataRow label="Public key">
          <Mono color="chain.fg">{device.pubkey}</Mono>
        </DataRow>
        <DataRow label="Registered">
          <Mono color="fg.muted">{formatDate(device.registeredAt)}</Mono>
        </DataRow>
      </Stack>

      <Box borderWidth="1px" borderColor="border" bg="bg.subtle" p={4} mb={6}>
        <Text fontSize="sm" color="fg.muted">
          Registration is self-reported for now — this is an MVP limitation, not
          a security promise. Anyone can register a keypair under any device ID.
        </Text>
      </Box>

      <Stack direction="row" gap={3}>
        <Button asChild colorPalette="brand" size="sm">
          <NextLink href={routes.contributor.browse}>Browse requests</NextLink>
        </Button>
        <Button
          size="sm"
          variant="outline"
          borderColor="border"
          color="fg.muted"
          onClick={forget}
        >
          Forget this device
        </Button>
      </Stack>
    </Panel>
  );
}
