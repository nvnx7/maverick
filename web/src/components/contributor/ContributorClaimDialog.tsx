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
import { useRequestEvaluatorReview } from "@/api/submissions";
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
  const settle = useRequestEvaluatorReview();
  const [settled, setSettled] = useState(false);

  if (!claim) return null;

  async function handleSettle() {
    if (!claim) return;
    await settle.mutateAsync({
      jobId: claim.jobId,
      dataHash: claim.deliverable,
      cumulativeAmount: claim.cumulativeAmount,
      contributor: claim.contributor,
    });
    setSettled(true);
  }

  const isPaid = claim.settled || claim.approved || settled;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(event) => {
        onOpenChange(event.open);
        if (!event.open) setSettled(false);
      }}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.700" backdropFilter="blur(2px)" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border.DEFAULT"
            borderRadius="0"
            maxW="xl"
          >
            <Dialog.Header pb={2}>
              <Dialog.Title textStyle="headline-md" color="primary">Submission details</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body pb={6}>
              <Stack gap={0} mb={6}>
                <DataRow label="Job">
                  <Mono color="primary">#{claim.jobId}</Mono>
                </DataRow>
                <DataRow label="Contributor">
                  <ExplorerLink value={claim.contributor} kind="address" />
                </DataRow>
                <DataRow label="Deliverable">
                  <CopyableHash value={claim.deliverable} />
                </DataRow>
                <DataRow label="Block">
                  <Mono color="primary">{claim.blockNumber.toString()}</Mono>
                </DataRow>
                <DataRow label="Transaction">
                  <ExplorerLink value={claim.transactionHash} kind="tx" />
                </DataRow>
                <DataRow label="Claimed">
                  {isPaid ? (
                    <UsdcAmount value={claim.delta} unit={false} color="primary" />
                  ) : (
                    <Text color="fg.subtle">--</Text>
                  )}
                </DataRow>
                <DataRow label="Cumulative claim">
                  <UsdcAmount value={claim.cumulativeAmount} unit={false} color="primary" />
                </DataRow>
              </Stack>

              {isPaid ? (
                <Text textStyle="body-sm" color="successGreen" fontWeight="500">
                  Settled — payout has been sent to your wallet.
                </Text>
              ) : (
                <Button
                  variant="solid"
                  bg="primary"
                  color="onPrimary"
                  borderRadius="0"
                  _hover={{ bg: "onSurfaceVariant", color: "onPrimary" }}
                  onClick={handleSettle}
                  loading={settle.isPending}
                  loadingText="Settling claim"
                >
                  Settle & Collect Payout
                </Button>
              )}

              {settle.isError && (
                <Text fontSize="sm" color="warn.fg" mt={4}>
                  {settle.error?.message}
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
