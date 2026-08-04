"use client";

import { Button, HStack, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { DataRow } from "@/components/common/DataRow";
import { ExplorerLink } from "@/components/common/ExplorerLink";
import { Mono } from "@/components/common/Mono";
import { Panel } from "@/components/common/Panel";
import { UsdcAmount } from "@/components/common/UsdcAmount";
import { routes } from "@/config/routes";
import { useNewRequest } from "./NewRequestContext";

export function RequestFundedSummary() {
  const { created, fundTxHash } = useNewRequest();

  if (!created || !fundTxHash) return null;

  return (
    <Panel>
      <Text fontWeight="500" color="brand.fg" mb={2}>
        Funded
      </Text>
      <Text fontSize="sm" color="fg.muted" mb={5}>
        Contributors can submit against this request now. Payouts release per
        verified submission, not in one lump at the end.
      </Text>

      <Stack gap={0} mb={6}>
        <DataRow label="Request">
          <Mono>#{created.jobId}</Mono>
        </DataRow>
        <DataRow label="In escrow">
          <UsdcAmount value={created.budget} color="brand.fg" />
        </DataRow>
        <DataRow label="Funding transaction">
          <ExplorerLink value={fundTxHash} kind="tx" />
        </DataRow>
      </Stack>

      <HStack gap={3}>
        <Button asChild colorPalette="brand" size="sm">
          <NextLink href={routes.buyer.request(created.jobId)}>
            View request
          </NextLink>
        </Button>
        <Button asChild size="sm" variant="outline" borderColor="border">
          <NextLink href={routes.buyer.dashboard}>All requests</NextLink>
        </Button>
      </HStack>
    </Panel>
  );
}
