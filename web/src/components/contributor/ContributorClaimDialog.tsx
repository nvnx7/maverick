"use client";

import { CloseButton, Dialog, Portal, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import type { ContributorClaim } from "@/api/jobs";
import { useRequestEvaluatorReview } from "@/api/submissions";
import { Button } from "@/components/common/Button";
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
            border="1px solid"
            borderColor="primary"
            borderRadius="0"
            maxW="xl"
          >
            <Dialog.Header pb={2}>
              <Dialog.Title textStyle="headline-md" color="primary">
                Submission Details
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body pb={6}>
              <Stack
                gap={1}
                mb={6}
                bg="surfaceNeutral"
                p={4}
                border="1px solid"
                borderColor="border.chrome"
              >
                <DataRow label="Request ID">
                  <Mono color="primary" fontWeight="700">
                    #{claim.jobId}
                  </Mono>
                </DataRow>
                <DataRow label="Contributor Address">
                  <ExplorerLink value={claim.contributor} kind="address" />
                </DataRow>
                <DataRow label="Deliverable Hash">
                  <CopyableHash value={claim.deliverable} />
                </DataRow>
                <DataRow label="Block Number">
                  <Mono color="primary" fontWeight="700">
                    {claim.blockNumber.toString()}
                  </Mono>
                </DataRow>
                <DataRow label="Transaction Hash">
                  <ExplorerLink value={claim.transactionHash} kind="tx" />
                </DataRow>
                <DataRow label="Claimed Amount">
                  {isPaid ? (
                    <UsdcAmount
                      value={claim.delta}
                      unit={false}
                      color="primary"
                      fontWeight="700"
                      fontSize="14px"
                    />
                  ) : (
                    <Text color="fg.subtle">--</Text>
                  )}
                </DataRow>
                <DataRow label="Cumulative Claimed">
                  <UsdcAmount
                    value={claim.cumulativeAmount}
                    unit={false}
                    color="primary"
                    fontWeight="700"
                    fontSize="14px"
                  />
                </DataRow>
              </Stack>

              {isPaid ? (
                <Text textStyle="body-sm" color="successGreen" fontWeight="700">
                  ✓ Settled — USDC payout has been released directly to your
                  wallet.
                </Text>
              ) : (
                <Button
                  variant="primary"
                  px={6}
                  py={5}
                  fontSize="sm"
                  onClick={handleSettle}
                  loading={settle.isPending}
                  loadingText="Settling Claim"
                >
                  Settle & Collect Payout
                </Button>
              )}

              {settle.isError && (
                <Text fontSize="sm" color="red.600" fontWeight="600" mt={4}>
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
