"use client";

import { Box, Button, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useFundJob, useGetJob } from "@/api/jobs";
import { useActivateRequest, useGetRequestStatus } from "@/api/review";
import { DataRow } from "@/components/common/DataRow";
import { ExplorerLink } from "@/components/common/ExplorerLink";
import { Mono } from "@/components/common/Mono";
import { Panel } from "@/components/common/Panel";
import { UsdcAmount } from "@/components/common/UsdcAmount";
import { useRequestId } from "@/hooks/useRequestId";
import { JobStatus } from "@/types";
import { declineCopy } from "@/utils/decline";

export function RequestProviderReview() {
  const id = useRequestId();
  const [checked, setChecked] = useState(false);
  const job = useGetJob(id);
  const status = useGetRequestStatus({ id, enabled: checked });
  const activate = useActivateRequest();
  const fund = useFundJob();

  if (!job.data) return null;
  if (job.data.status !== JobStatus.Open) return null;

  const report = status.data;
  const agreed = report?.providerDecision === "agreed";
  const declined = report?.providerDecision === "declined";
  const quotedBudget = report?.intendedBudget ?? activate.data?.budget;
  const busy = activate.isPending || fund.isPending;

  async function handleAgreeAndFund() {
    const result = await activate.mutateAsync(id);
    const amount = result.budget;
    if (!amount) return;
    await fund.mutateAsync({ jobId: id, amount });
    await job.refetch?.();
  }

  return (
    <Panel mb={6}>
      <Heading size="sm" fontWeight="500" color="fg.muted" mb={2}>
        Provider review
      </Heading>

      <Text fontSize="sm" color="fg.muted" mb={4}>
        Check the provider's quote before writing a budget on-chain.
      </Text>

      {report && (
        <Box mb={4}>
          <DataRow label="On-chain status">
            <Mono>{report.onChainStatus}</Mono>
          </DataRow>
          <DataRow label="Budget set on-chain">
            <UsdcAmount value={report.budget} />
          </DataRow>
          <DataRow label="Decision">
            <Mono color={declined ? "warn.fg" : "fg"}>
              {report.providerDecision}
            </Mono>
          </DataRow>
        </Box>
      )}

      {agreed && quotedBudget !== undefined && (
        <Box
          borderWidth="1px"
          borderColor="brand.muted"
          bg="brand.subtle"
          p={4}
          mb={4}
        >
          <Text fontSize="sm" color="fg.muted" mb={1}>
            Provider quoted
          </Text>
          <UsdcAmount value={quotedBudget} color="brand.fg" fontSize="xl" />
        </Box>
      )}

      {declined && (
        <Box
          borderWidth="1px"
          borderColor="warn.muted"
          bg="warn.subtle"
          p={4}
          mb={4}
        >
          <Text fontSize="sm" color="fg.muted" mb={2}>
            {declineCopy(report?.declineReason)}
          </Text>
          <Mono fontSize="xs" color="warn.fg">
            {report?.declineReason}
          </Mono>
        </Box>
      )}

      {activate.data?.txHash && (
        <Box mb={4}>
          <DataRow label="Activation tx">
            <ExplorerLink value={activate.data.txHash} kind="tx" />
          </DataRow>
        </Box>
      )}

      {activate.data?.alreadyActivated && (
        <Text fontSize="sm" color="fg.muted" mb={4}>
          Already acted on — the provider reported current state instead of
          resending a transaction.
        </Text>
      )}

      <Stack gap={3}>
        {!agreed && !declined && (
          <HStack gap={3} wrap="wrap">
            <Button
              variant="outline"
              borderColor="border"
              onClick={() => {
                setChecked(true);
                if (checked) status.refetch();
              }}
              loading={status.isFetching}
              loadingText="Checking"
            >
              Check Status
            </Button>
          </HStack>
        )}

        {agreed && (
          <HStack gap={3} wrap="wrap">
            <Button
              colorPalette="brand"
              onClick={handleAgreeAndFund}
              loading={busy}
              loadingText={activate.isPending ? "Activating" : "Funding"}
            >
              Agree And Fund
            </Button>
            <Button variant="outline" borderColor="border">
              Decline
            </Button>
          </HStack>
        )}
      </Stack>

      {status.isError && (
        <Text fontSize="sm" color="warn.fg" mt={3}>
          {status.error?.message}
        </Text>
      )}
      {activate.isError && (
        <Text fontSize="sm" color="warn.fg" mt={3}>
          {activate.error.message}
        </Text>
      )}
      {fund.isError && (
        <Text fontSize="sm" color="warn.fg" mt={3}>
          {fund.error.message}
        </Text>
      )}
    </Panel>
  );
}
