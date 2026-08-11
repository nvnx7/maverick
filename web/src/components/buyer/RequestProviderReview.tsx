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
import { formatDateTime } from "@/utils/format";

/**
 * The buyer's action panel while a request is still Open.
 *
 * Open covers two distinct stages, told apart by whether a budget is on-chain:
 * the provider writes the quote via setBudget while the job is still Open, so
 * `budget > 0` already proves it reviewed and agreed. Past that point the only thing
 * left for the buyer is to fund, and re-polling the provider API would just restate
 * what the chain already says.
 */
export function RequestProviderReview() {
  const id = useRequestId();
  const [checked, setChecked] = useState(false);
  const job = useGetJob(id);
  const quoted = (job.data?.budget ?? 0n) > 0n;

  // Only consulted before a quote exists on-chain.
  const status = useGetRequestStatus({ id, enabled: checked && !quoted });
  const activate = useActivateRequest();
  const fund = useFundJob();

  if (!job.data) return null;
  if (job.data.status !== JobStatus.Open) return null;

  const expired = Date.now() / 1000 >= job.data.expiredAt;
  const report = status.data;
  const agreed = report?.providerDecision === "agreed";
  const declined = report?.providerDecision === "declined";
  const busy = activate.isPending || fund.isPending;

  async function fundWith(amount: bigint) {
    await fund.mutateAsync({ jobId: id, amount });
    await job.refetch?.();
  }

  async function handleAgreeAndFund() {
    const result = await activate.mutateAsync(id);
    if (!result.budget) return;
    await fundWith(result.budget);
  }

  const errors = [status.error, activate.error, fund.error].filter(Boolean);

  // ── Quote already on-chain: the only remaining step is funding. ──
  if (quoted) {
    return (
      <Panel mb={6} p={8}>
        <Text
          textStyle="label-mono"
          fontSize="12px"
          color="fg.subtle"
          fontWeight="700"
          mb={2}
        >
          STEP 2 OF 2 · AWAITING YOUR FUNDING
        </Text>
        <Heading textStyle="body-lg" fontWeight="700" color="primary" mb={2}>
          Fund This Request
        </Heading>
        <Text fontSize="14px" color="fg.muted" mb={4} lineHeight="1.6">
          The provider agent reviewed this request and wrote its quote on-chain.
          Funding moves USDC into the escrow contract, where it stays until each
          submission is verified.
        </Text>

        <Stack
          gap={1}
          mb={4}
          bg="surfaceNeutral"
          p={4}
          border="1px solid"
          borderColor="border.chrome"
        >
          <DataRow label="Quoted budget">
            <UsdcAmount
              value={job.data.budget}
              color="primary"
              fontWeight="700"
              fontSize="14px"
            />
          </DataRow>
          <DataRow label="Escrow deadline">
            <Mono color="primary" fontWeight="700">
              {formatDateTime(job.data.expiredAt)}
            </Mono>
          </DataRow>
        </Stack>

        {expired ? (
          <Box
            border="1px solid"
            borderColor="red.600"
            bg="surfaceNeutral"
            p={4}
          >
            <Text fontSize="14px" color="primary" fontWeight="600">
              This request passed its deadline before it was funded. It can no
              longer be funded — post a new request instead.
            </Text>
          </Box>
        ) : (
          <Button
            variant="primary"
            px={6}
            py={5}
            fontSize="sm"
            onClick={() => fundWith(job.data?.budget ?? 0n)}
            loading={fund.isPending}
            loadingText="Confirm in your wallet"
          >
            Fund Request
          </Button>
        )}

        {fund.isError && (
          <Text fontSize="sm" color="red.600" mt={3}>
            {fund.error.message}
          </Text>
        )}
      </Panel>
    );
  }

  // ── No quote yet: the provider agent still has to review. ──
  return (
    <Panel mb={6} p={8}>
      <Text
        textStyle="label-mono"
        fontSize="12px"
        color="fg.subtle"
        fontWeight="700"
        mb={2}
      >
        STEP 1 OF 2 · AWAITING PROVIDER QUOTE
      </Text>
      <Heading textStyle="body-lg" fontWeight="700" color="primary" mb={2}>
        Provider Agent Review & Quote
      </Heading>

      <Text fontSize="14px" color="fg.muted" mb={4} lineHeight="1.6">
        No budget has been written on-chain yet. Check the provider agent's
        decision before locking any escrow.
      </Text>

      {report && (
        <Stack
          gap={1}
          mb={4}
          bg="surfaceNeutral"
          p={4}
          border="1px solid"
          borderColor="border.chrome"
        >
          <DataRow label="On-chain status">
            <Mono color="primary" fontWeight="700">
              {report.onChainStatus}
            </Mono>
          </DataRow>
          <DataRow label="Provider decision">
            <Mono color={declined ? "red.600" : "secondary"} fontWeight="700">
              {report.providerDecision.toUpperCase()}
            </Mono>
          </DataRow>
          {agreed && (
            <DataRow label="Quoted budget">
              <UsdcAmount
                value={report.intendedBudget}
                color="primary"
                fontWeight="700"
                fontSize="14px"
              />
            </DataRow>
          )}
        </Stack>
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
          </HStack>
        )}
      </Stack>

      {errors.map((error) => (
        <Text key={error?.message} fontSize="sm" color="red.600" mt={3}>
          {error?.message}
        </Text>
      ))}
    </Panel>
  );
}
