"use client";

import { Button, HStack, Stack, Text } from "@chakra-ui/react";
import { useFundJob } from "@/api/fundJob";
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
    <Panel>
      <StepLabel step={2} label="Fund this request" />

      <Text color="fg.muted" fontSize="sm" mb={5}>
        The provider agreed. Approving this transaction moves USDC from your
        wallet into the escrow contract, where it stays until submissions are
        verified.
      </Text>

      <Stack gap={0} mb={6}>
        <DataRow label="Request">
          <Mono>#{created.jobId}</Mono>
        </DataRow>
        <DataRow label="Modality">
          <Text fontSize="sm">{MODALITY_LABELS[created.spec.modality]}</Text>
        </DataRow>
        <DataRow label="Minimum items">
          <Mono>{created.spec.minItems.toLocaleString("en-US")}</Mono>
        </DataRow>
        <DataRow label="Amount to escrow">
          <UsdcAmount value={created.budget} color="brand.fg" fontSize="md" />
        </DataRow>
      </Stack>

      <HStack gap={4}>
        <Button
          colorPalette="brand"
          onClick={handleFund}
          loading={fundJob.isPending}
          loadingText="Confirm in your wallet"
        >
          Fund request
        </Button>
        {fundJob.isError && (
          <Text fontSize="sm" color="warn.fg">
            {fundJob.error.message}
          </Text>
        )}
      </HStack>
    </Panel>
  );
}
