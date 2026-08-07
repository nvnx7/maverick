"use client";

import { Box, Button, Heading, HStack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useGetJob } from "@/api/jobs";
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

  if (!job.data) return null;

  const report = status.data;
  const agreed = report?.providerDecision === "agreed";
  const declined = report?.providerDecision === "declined";
  // The provider only writes a budget while the job is still Open.
  const activatable = agreed && job.data.status === JobStatus.Open;

  console.log({ job });

  return (
    <Panel mb={6}>
      <Heading size="sm" fontWeight="500" color="fg.muted" mb={2}>
        Provider review
      </Heading>

      <Text fontSize="sm" color="fg.muted" mb={4}>
        Ask the provider what it would charge for this spec. Checking is
        read-only; activating asks it to write that budget on-chain so you can
        fund the job.
      </Text>

      {report && (
        <Box mb={4}>
          <DataRow label="On-chain status">
            <Mono>{report.onChainStatus}</Mono>
          </DataRow>
          <DataRow label="Quoted budget">
            <UsdcAmount value={report.intendedBudget} color="brand.fg" />
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

      <HStack gap={3} wrap="wrap">
        <Button
          variant="outline"
          borderColor="border"
          onClick={() => {
            setChecked(true);
            if (checked) status.refetch();
          }}
          loading={status.isFetching}
          loadingText="Asking the provider"
        >
          Check status
        </Button>

        <Button
          colorPalette="brand"
          disabled={!activatable}
          onClick={() => activate.mutate(id)}
          loading={activate.isPending}
          loadingText="Confirm with the provider"
        >
          Activate
        </Button>
      </HStack>

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
    </Panel>
  );
}
