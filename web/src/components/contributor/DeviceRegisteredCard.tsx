"use client";

import { Badge, Box, HStack, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { Button } from "@/components/common/Button";
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
    <Panel maxW="2xl" p={8}>
      <HStack justify="space-between" align="center" mb={6}>
        <Text textStyle="body-lg" fontWeight="700" color="primary">
          Hardware Security Enclave Active
        </Text>
        <Badge
          bg="#E7F8F2"
          color="successGreen"
          border="1px solid"
          borderColor="transparent"
          borderRadius="0"
          px={2.5}
          py={1}
          textStyle="label-mono"
          fontSize="10px"
        >
          ● REGISTERED
        </Badge>
      </HStack>

      <Stack
        gap={1}
        mb={6}
        bg="surfaceNeutral"
        p={4}
        border="1px solid"
        borderColor="border.chrome"
      >
        <DataRow label="Device ID">
          <Mono color="primary" fontWeight="600">
            {device.deviceId}
          </Mono>
        </DataRow>
        <DataRow label="Public key">
          <Mono color="secondary" fontWeight="600">
            {device.pubkey}
          </Mono>
        </DataRow>
        <DataRow label="Registered">
          <Mono color="fg.subtle">{formatDate(device.registeredAt)}</Mono>
        </DataRow>
      </Stack>

      <Box border="1px solid" borderColor="primary" bg="bg.panel" p={4} mb={6}>
        <Text fontSize="13px" color="fg.muted" lineHeight="1.6">
          Every capture submitted from this browser session will be
          cryptographically signed by your device enclave keypair for
          hardware-attested provenance.
        </Text>
      </Box>

      <HStack gap={3}>
        <Button asChild variant="primary" px={6} py={5} fontSize="sm">
          <NextLink href={routes.contributor.browse}>Browse Open Jobs</NextLink>
        </Button>
        <Button variant="outline" px={5} py={5} fontSize="sm" onClick={forget}>
          Forget this device
        </Button>
      </HStack>
    </Panel>
  );
}
