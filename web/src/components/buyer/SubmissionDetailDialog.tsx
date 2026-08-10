"use client";

import {
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
import { Button } from "@/components/common/Button";
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
                <DataRow label="Submission ID">
                  <Mono color="primary" fontWeight="700">
                    {submission.id}
                  </Mono>
                </DataRow>
                <DataRow label="Request ID">
                  <Mono color="primary" fontWeight="700">
                    #{submission.jobId}
                  </Mono>
                </DataRow>
                <DataRow label="Contributor Address">
                  <ExplorerLink value={submission.contributor} kind="address" />
                </DataRow>
                <DataRow label="Deliverable Hash">
                  <CopyableHash value={submission.dataHash} />
                </DataRow>
                <DataRow label="Submitted Timestamp">
                  <Mono color="primary" fontWeight="700">
                    {formatDateTime(submission.submittedAt)}
                  </Mono>
                </DataRow>
                <DataRow label="Claim Status">
                  <Mono color="secondary" fontWeight="700">
                    {submission.status.toUpperCase()}
                  </Mono>
                </DataRow>
                <DataRow label="Claim Amount">
                  <UsdcAmount
                    value={submission.amount}
                    unit={false}
                    color="primary"
                    fontWeight="700"
                    fontSize="14px"
                  />
                </DataRow>
                <DataRow label="Cumulative Claimed">
                  <UsdcAmount
                    value={submission.cumulativeAmount}
                    unit={false}
                    color="primary"
                    fontWeight="700"
                    fontSize="14px"
                  />
                </DataRow>
                {submission.payoutTxHash && (
                  <DataRow label="Payout Tx">
                    <ExplorerLink value={submission.payoutTxHash} kind="tx" />
                  </DataRow>
                )}
              </Stack>

              {submission.status === "pending" && (
                <HStack gap={3} wrap="wrap">
                  <Button
                    variant="outline"
                    px={5}
                    py={4}
                    fontSize="sm"
                    onClick={handleRequestReview}
                    loading={requestReview.isPending}
                    loadingText="Requesting Review"
                  >
                    Request Evaluator Review
                  </Button>
                  <Button
                    variant="primary"
                    px={5}
                    py={4}
                    fontSize="sm"
                    onClick={handleApproveClaim}
                    loading={approveClaim.isPending}
                    loadingText="Approving Claim"
                  >
                    Approve Claim
                  </Button>
                </HStack>
              )}

              {submission.status === "verified" && (
                <Button
                  variant="primary"
                  px={6}
                  py={5}
                  fontSize="sm"
                  onClick={handleSettleClaim}
                  loading={settleClaim.isPending}
                  loadingText="Settling Claim"
                >
                  Settle Claim
                </Button>
              )}

              {submission.status === "paid" && (
                <Text textStyle="body-sm" color="successGreen" fontWeight="700">
                  ✓ Claim Settled & Payout Disbursed.
                </Text>
              )}

              {reviewRequested && (
                <Text fontSize="14px" color="secondary" fontWeight="600" mt={4}>
                  Evaluator review requested successfully.
                </Text>
              )}
              {(requestReview.isError ||
                approveClaim.isError ||
                settleClaim.isError) && (
                <Text fontSize="14px" color="red.600" fontWeight="600" mt={4}>
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
