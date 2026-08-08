"use client";

import {
  Button,
  CloseButton,
  Dialog,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import type { ContributorClaim } from "@/api/jobs";
import { useGetJob } from "@/api/jobs";
import { useRequestEvaluatorReview, useSettleClaim } from "@/api/submissions";
import { CopyableHash } from "@/components/common/CopyableHash";
import { DataRow } from "@/components/common/DataRow";
import { ExplorerLink } from "@/components/common/ExplorerLink";
import { Mono } from "@/components/common/Mono";
import { UsdcAmount } from "@/components/common/UsdcAmount";

type Props = {
  claim: ContributorClaim | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ContributorClaimDialog({ claim, open, onOpenChange }: Props) {
  const { data: job, refetch: refetchJob } = useGetJob(claim?.jobId);
  const requestReview = useRequestEvaluatorReview();
  const settleClaim = useSettleClaim();
  const [approved, setApproved] = useState(false);

  if (!claim) return null;

  const settled = job ? claim.cumulativeAmount <= job.spent : false;

  async function handleCheckApproval() {
    if (!claim) return;
    await requestReview.mutateAsync({
      jobId: claim.jobId,
      dataHash: claim.deliverable,
      cumulativeAmount: claim.cumulativeAmount,
      contributor: claim.contributor,
    });
    setApproved(true);
  }

  async function handleClaim() {
    if (!claim) return;
    await settleClaim.mutateAsync({
      jobId: claim.jobId,
      cumulativeAmount: claim.cumulativeAmount,
      deliverable: claim.deliverable,
      contributor: claim.contributor,
    });
    await refetchJob();
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(event) => {
        onOpenChange(event.open);
        if (!event.open) setApproved(false);
      }}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.700" backdropFilter="blur(2px)" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border"
            maxW="xl"
          >
            <Dialog.Header pb={2}>
              <Dialog.Title fontWeight="500">Submission details</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body pb={6}>
              <Stack gap={0} mb={6}>
                <DataRow label="Job">
                  <Mono>#{claim.jobId}</Mono>
                </DataRow>
                <DataRow label="Contributor">
                  <ExplorerLink value={claim.contributor} kind="address" />
                </DataRow>
                <DataRow label="Deliverable">
                  <CopyableHash value={claim.deliverable} />
                </DataRow>
                <DataRow label="Block">
                  <Mono color="fg.muted">{claim.blockNumber.toString()}</Mono>
                </DataRow>
                <DataRow label="Transaction">
                  <ExplorerLink value={claim.transactionHash} kind="tx" />
                </DataRow>
                <DataRow label="Claimed">
                  <UsdcAmount value={claim.delta} unit={false} />
                </DataRow>
                <DataRow label="Cumulative claim">
                  <UsdcAmount value={claim.cumulativeAmount} unit={false} />
                </DataRow>
              </Stack>

              {settled ? (
                <Text fontSize="sm" color="fg.muted">
                  This claim has already been settled.
                </Text>
              ) : approved ? (
                <Button
                  colorPalette="brand"
                  onClick={handleClaim}
                  loading={settleClaim.isPending}
                  loadingText="Claiming"
                >
                  Claim
                </Button>
              ) : (
                <Button
                  variant="outline"
                  borderColor="border"
                  onClick={handleCheckApproval}
                  loading={requestReview.isPending}
                  loadingText="Checking"
                >
                  Check Approval
                </Button>
              )}

              {(requestReview.isError || settleClaim.isError) && (
                <Text fontSize="sm" color="warn.fg" mt={4}>
                  {requestReview.error?.message ?? settleClaim.error?.message}
                </Text>
              )}
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
