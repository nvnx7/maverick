"use client";

import { Heading, HStack, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { Button } from "@/components/common/Button";
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
    <Panel p={8}>
      <Heading textStyle="body-lg" fontWeight="700" color="primary" mb={2}>
        Request Funded & Active in Escrow
      </Heading>
      <Text fontSize="14px" color="fg.muted" mb={5} lineHeight="1.6">
        Contributors can now capture and submit data against this request.
        Payouts disburse automatically upon verification.
      </Text>

      <Stack
        gap={1}
        mb={6}
        bg="surfaceNeutral"
        p={4}
        border="1px solid"
        borderColor="border.chrome"
      >
        <DataRow label="Request ID">
          <Mono color="primary" fontWeight="700">
            #{created.jobId}
          </Mono>
        </DataRow>
        <DataRow label="Escrow Locked">
          <UsdcAmount
            value={created.budget}
            color="primary"
            fontWeight="700"
            fontSize="14px"
          />
        </DataRow>
        <DataRow label="Funding Tx Hash">
          <ExplorerLink value={fundTxHash} kind="tx" />
        </DataRow>
      </Stack>

      <HStack gap={3}>
        <Button asChild variant="primary" px={6} py={5} fontSize="sm">
          <NextLink href={routes.buyer.request(created.jobId)}>
            View Request Details
          </NextLink>
        </Button>
        <Button asChild variant="outline" px={6} py={5} fontSize="sm">
          <NextLink href={routes.buyer.dashboard}>Buyer Dashboard</NextLink>
        </Button>
      </HStack>
    </Panel>
  );
}
