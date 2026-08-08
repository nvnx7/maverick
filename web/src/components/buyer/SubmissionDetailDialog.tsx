"use client";

import {
  Button,
  CloseButton,
  Dialog,
  HStack,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  useApproveClaim,
  useRequestEvaluatorReview,
  useSettleClaim,
} from "@/api/submissions";
import { CopyableHash } from "@/components/common/CopyableHash";
import { DataRow } from "@/components/common/DataRow";
import { ExplorerLink } from "@/components/common/ExplorerLink";
import { Mono } from "@/components/common/Mono";
import { UsdcAmount } from "@/components/common/UsdcAmount";
import type { Submission } from "@/types";
import { formatDateTime } from "@/utils/format";

type Props = {
  submission: Submission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SubmissionDetailDialog({
  submission,
  open,
  onOpenChange,
}: Props) {
  const requestReview = useRequestEvaluatorReview();
  const approveClaim = useApproveClaim();
  const settleClaim = useSettleClaim();
  const [reviewRequested, setReviewRequested] = useState(false);

  if (!submission) return null;

  async function handleRequestReview() {
    if (!submission) return;
    await requestReview.mutateAsync({
      jobId: submission.jobId,
      dataHash: submission.dataHash,
      cumulativeAmount: submission.cumulativeAmount,
      contributor: submission.contributor,
    });
    setReviewRequested(true);
  }

  async function handleApproveClaim() {
    if (!submission) return;
    await approveClaim.mutateAsync({
      jobId: submission.jobId,
      cumulativeAmount: submission.cumulativeAmount,
      deliverable: submission.dataHash,
      contributor: submission.contributor,
    });
  }

  async function handleSettleClaim() {
    if (!submission) return;
    await settleClaim.mutateAsync({
      jobId: submission.jobId,
      cumulativeAmount: submission.cumulativeAmount,
      deliverable: submission.dataHash,
      contributor: submission.contributor,
    });
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(event) => onOpenChange(event.open)}
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
                <DataRow label="Submission">
                  <Mono>{submission.id}</Mono>
                </DataRow>
                <DataRow label="Job">
                  <Mono>#{submission.jobId}</Mono>
                </DataRow>
                <DataRow label="Contributor">
                  <ExplorerLink value={submission.contributor} kind="address" />
                </DataRow>
                <DataRow label="Deliverable">
                  <CopyableHash value={submission.dataHash} />
                </DataRow>
                <DataRow label="Submitted">
                  <Mono color="fg.muted">
                    {formatDateTime(submission.submittedAt)}
                  </Mono>
                </DataRow>
                <DataRow label="Status">
                  <Mono>{submission.status}</Mono>
                </DataRow>
                <DataRow label="Claim amount">
                  <UsdcAmount value={submission.amount} unit={false} />
                </DataRow>
                <DataRow label="Cumulative claim">
                  <UsdcAmount
                    value={submission.cumulativeAmount}
                    unit={false}
                  />
                </DataRow>
                {submission.payoutTxHash && (
                  <DataRow label="Payout tx">
                    <ExplorerLink value={submission.payoutTxHash} kind="tx" />
                  </DataRow>
                )}
              </Stack>

              {submission.status === "pending" && (
                <HStack gap={3} wrap="wrap">
                  <Button
                    variant="outline"
                    borderColor="border"
                    onClick={handleRequestReview}
                    loading={requestReview.isPending}
                    loadingText="Requesting"
                  >
                    Request evaluator review
                  </Button>
                  <Button
                    colorPalette="brand"
                    onClick={handleApproveClaim}
                    loading={approveClaim.isPending}
                    loadingText="Approving"
                  >
                    Approve claim
                  </Button>
                </HStack>
              )}

              {submission.status === "verified" && (
                <Button
                  colorPalette="brand"
                  onClick={handleSettleClaim}
                  loading={settleClaim.isPending}
                  loadingText="Settling"
                >
                  Settle claim
                </Button>
              )}

              {submission.status === "paid" && (
                <Text fontSize="sm" color="fg.muted">
                  This claim has already been paid.
                </Text>
              )}

              {reviewRequested && (
                <Text fontSize="sm" color="brand.fg" mt={4}>
                  Evaluator review requested.
                </Text>
              )}
              {(requestReview.isError ||
                approveClaim.isError ||
                settleClaim.isError) && (
                <Text fontSize="sm" color="warn.fg" mt={4}>
                  {requestReview.error?.message ??
                    approveClaim.error?.message ??
                    settleClaim.error?.message}
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
