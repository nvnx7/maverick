"use client";

import { HStack, Stack, Text } from "@chakra-ui/react";
import { useFundJob } from "@/api/jobs";
import { Button } from "@/components/common/Button";
import { DataRow } from "@/components/common/DataRow";
import { Mono } from "@/components/common/Mono";
import { Panel } from "@/components/common/Panel";
import { UsdcAmount } from "@/components/common/UsdcAmount";
import { MODALITY_LABELS } from "@/config/constants";
import { useNewRequest } from "./NewRequestContext";
import { StepLabel } from "./StepLabel";

export function FundRequestStep() {
  const { created, markFunded } = useNewRequest();
  const fundJob = useFundJob();

  if (!created) return null;

  async function handleFund() {
    if (!created) return;
    const result = await fundJob.mutateAsync({
      jobId: created.jobId,
      amount: created.budget,
    });
    markFunded(result.txHash);
  }

  return (
    <Panel p={8}>
      <StepLabel step={2} label="Fund this request into ERC-8183 Escrow" />

      <Text color="fg.muted" fontSize="14px" mb={5} lineHeight="1.6">
        The provider agent approved your request specs. Approving this transaction transfers USDC from your wallet into the on-chain escrow contract, unlocking contributor collection.
      </Text>

      <Stack gap={1} mb={6} bg="surfaceNeutral" p={4} border="1px solid" borderColor="border.chrome">
        <DataRow label="Request ID">
          <Mono color="primary" fontWeight="700">#{created.jobId}</Mono>
        </DataRow>
        <DataRow label="Data Modality">
          <Text fontSize="14px" fontWeight="600" color="primary">{MODALITY_LABELS[created.spec.modality]}</Text>
        </DataRow>
        <DataRow label="Minimum Quota">
          <Mono color="primary" fontWeight="700">{created.spec.minItems.toLocaleString("en-US")} items</Mono>
        </DataRow>
        <DataRow label="Amount to Escrow">
          <UsdcAmount value={created.budget} color="primary" fontSize="16px" fontWeight="800" />
        </DataRow>
      </Stack>

      <HStack gap={4}>
        <Button
          variant="primary"
          px={8}
          py={6}
          fontSize="md"
          onClick={handleFund}
          loading={fundJob.isPending}
          loadingText="Confirming Transaction"
        >
          Lock Funds in Escrow
        </Button>
        {fundJob.isError && (
          <Text fontSize="sm" color="red.600" fontWeight="600">
            {fundJob.error.message}
          </Text>
        )}
      </HStack>
    </Panel>
  );
}

