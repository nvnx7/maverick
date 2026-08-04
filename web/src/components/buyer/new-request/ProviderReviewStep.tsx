"use client";

import { Box, Button, HStack, Spinner, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { useEffect } from "react";
import { useGetRequestStatus } from "@/api/getRequestStatus";
import { ExplorerLink } from "@/components/common/ExplorerLink";
import { Mono } from "@/components/common/Mono";
import { Panel } from "@/components/common/Panel";
import { routes } from "@/config/routes";
import { declineCopy } from "@/utils/decline";
import { useNewRequest } from "./NewRequestContext";
import { StepLabel } from "./StepLabel";

export function ProviderReviewStep() {
  const { created, markAgreed } = useNewRequest();
  const { data } = useGetRequestStatus(created?.jobId, true);

  const decision = data?.providerDecision ?? "pending";

  useEffect(() => {
    if (decision === "agreed") markAgreed();
  }, [decision, markAgreed]);

  if (!created) return null;

  return (
    <Panel>
      <StepLabel step={1} label="Request created" />

      <HStack gap={3} mb={4}>
        <Mono fontSize="lg">#{created.jobId}</Mono>
        <ExplorerLink value={created.txHash} kind="tx" />
      </HStack>

      {decision === "declined" ? (
        <Box borderWidth="1px" borderColor="warn.muted" bg="warn.subtle" p={4}>
          <Text fontWeight="500" color="warn.fg" mb={2}>
            The provider declined this request
          </Text>
          <Text fontSize="sm" color="fg.muted" mb={3}>
            {declineCopy(data?.declineReason)}
          </Text>
          <HStack justify="space-between" gap={4} wrap="wrap">
            <Mono fontSize="xs" color="warn.fg">
              {data?.declineReason}
            </Mono>
            <Button asChild size="xs" variant="outline" borderColor="border">
              <NextLink href={routes.buyer.newRequest}>Start over</NextLink>
            </Button>
          </HStack>
        </Box>
      ) : (
        <HStack gap={3} color="fg.muted">
          <Spinner size="xs" />
          <Text fontSize="sm">
            Waiting for the provider to review it. Nothing has been funded yet.
          </Text>
        </HStack>
      )}
    </Panel>
  );
}
