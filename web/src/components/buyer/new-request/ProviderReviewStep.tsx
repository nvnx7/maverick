"use client";

import { Box, HStack, Spinner, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { useEffect } from "react";
import { useGetRequestStatus } from "@/api/review";
import { Button } from "@/components/common/Button";
import { ExplorerLink } from "@/components/common/ExplorerLink";
import { Mono } from "@/components/common/Mono";
import { Panel } from "@/components/common/Panel";
import { routes } from "@/config/routes";
import { declineCopy } from "@/utils/decline";
import { useNewRequest } from "./NewRequestContext";
import { StepLabel } from "./StepLabel";

export function ProviderReviewStep() {
  const { created, markAgreed } = useNewRequest();
  const { data } = useGetRequestStatus({ id: created?.jobId, poll: true });

  const decision = data?.providerDecision ?? "pending";

  useEffect(() => {
    if (decision === "agreed") markAgreed();
  }, [decision, markAgreed]);

  if (!created) return null;

  return (
    <Panel p={8}>
      <StepLabel step={1} label="Request Registered On-Chain" />

      <HStack gap={3} mb={4}>
        <Mono fontSize="lg" color="primary" fontWeight="700">#{created.jobId}</Mono>
        <ExplorerLink value={created.txHash} kind="tx" />
      </HStack>

      {decision === "declined" ? (
        <Box border="1px solid" borderColor="red.600" bg="surfaceNeutral" p={4}>
          <Text fontWeight="700" color="primary" mb={2}>
            The provider agent declined this request
          </Text>
          <Text fontSize="14px" color="fg.muted" mb={3}>
            {declineCopy(data?.declineReason)}
          </Text>
          <HStack justify="space-between" gap={4} wrap="wrap">
            <Mono fontSize="12px" color="red.600" fontWeight="700">
              {data?.declineReason}
            </Mono>
            <Button asChild size="sm" variant="outline" px={4} py={2}>
              <NextLink href={routes.buyer.newRequest}>Start Over</NextLink>
            </Button>
          </HStack>
        </Box>
      ) : (
        <HStack gap={3} color="primary" bg="surfaceNeutral" p={4} border="1px solid" borderColor="border.chrome">
          <Spinner size="sm" color="secondary" />
          <Text fontSize="14px" fontWeight="600">
            Waiting for provider agent review. No USDC has been transferred yet.
          </Text>
        </HStack>
      )}
    </Panel>
  );
}

