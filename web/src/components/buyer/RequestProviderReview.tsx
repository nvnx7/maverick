"use client";

import { Box, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useFundJob, useGetJob } from "@/api/jobs";
import { useActivateRequest, useGetRequestStatus } from "@/api/review";
import { Button } from "@/components/common/Button";
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
    <Panel mb={6} p={8}>
      <Heading textStyle="body-lg" fontWeight="700" color="primary" mb={2}>
        Provider Agent Review & Quote
      </Heading>

      <Text fontSize="14px" color="fg.muted" mb={4} lineHeight="1.6">
        Inspect the provider agent's quote and decision status before writing an escrow budget on-chain.
      </Text>

      {report && (
        <Stack gap={1} mb={4} bg="surfaceNeutral" p={4} border="1px solid" borderColor="border.chrome">
          <DataRow label="On-chain status">
            <Mono color="primary" fontWeight="700">{report.onChainStatus}</Mono>
          </DataRow>
          <DataRow label="Budget set on-chain">
            <UsdcAmount value={report.budget} color="primary" fontWeight="700" fontSize="14px" />
          </DataRow>
          <DataRow label="Provider decision">
            <Mono color={declined ? "red.600" : "secondary"} fontWeight="700">
              {report.providerDecision.toUpperCase()}
            </Mono>
          </DataRow>
        </Stack>
      )}

      {agreed && quotedBudget !== undefined && (
        <Box
          border="1px solid"
          borderColor="primary"
          bg="surfaceNeutral"
          p={4}
          mb={4}
        >
          <Text fontSize="12px" textStyle="label-mono" color="fg.subtle" fontWeight="700" mb={1}>
            PROVIDER QUOTED BUDGET
          </Text>
          <UsdcAmount value={quotedBudget} color="primary" fontSize="20px" fontWeight="800" />
        </Box>
      )}

      {declined && (
        <Box
          border="1px solid"
          borderColor="red.600"
          bg="surfaceNeutral"
          p={4}
          mb={4}
        >
          <Text fontSize="14px" color="primary" fontWeight="600" mb={2}>
            {declineCopy(report?.declineReason)}
          </Text>
          <Mono fontSize="12px" color="red.600" fontWeight="700">
            {report?.declineReason}
          </Mono>
        </Box>
      )}

      {activate.data?.txHash && (
        <Box mb={4}>
          <DataRow label="Activation Tx">
            <ExplorerLink value={activate.data.txHash} kind="tx" />
          </DataRow>
        </Box>
      )}

      {activate.data?.alreadyActivated && (
        <Text fontSize="14px" color="fg.subtle" mb={4}>
          Already acted on — provider reported current state.
        </Text>
      )}

      <Stack gap={3}>
        {!agreed && !declined && (
          <HStack gap={3} wrap="wrap">
            <Button
              variant="outline"
              px={5}
              py={4}
              fontSize="sm"
              onClick={() => {
                setChecked(true);
                if (checked) status.refetch();
              }}
              loading={status.isFetching}
              loadingText="Checking Status"
            >
              Check Provider Status
            </Button>
          </HStack>
        )}

        {agreed && (
          <HStack gap={3} wrap="wrap">
            <Button
              variant="primary"
              px={6}
              py={5}
              fontSize="sm"
              onClick={handleAgreeAndFund}
              loading={busy}
              loadingText={activate.isPending ? "Activating" : "Funding"}
            >
              Agree & Lock Escrow
            </Button>
            <Button variant="outline" px={5} py={5} fontSize="sm">
              Decline Quote
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
