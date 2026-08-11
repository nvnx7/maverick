"use client";

import { Box, Heading, Stack, Text } from "@chakra-ui/react";
import { useGetJob } from "@/api/jobs";
import { DataRow } from "@/components/common/DataRow";
import { Mono } from "@/components/common/Mono";
import { Panel } from "@/components/common/Panel";
import { UsdcAmount } from "@/components/common/UsdcAmount";
import { useRequestId } from "@/hooks/useRequestId";
import { JobStatus } from "@/types";
import { formatDateTime } from "@/utils/format";

/**
 * What a request means once it's past the buyer's control, stated per lifecycle state.
 * Open is deliberately excluded — RequestProviderReview owns that stage because it still
 * has an action attached.
 */
const COPY: Partial<
  Record<JobStatus, { label: string; title: string; body: string }>
> = {
  [JobStatus.Funded]: {
    label: "ESCROW LOCKED · COLLECTING SUBMISSIONS",
    title: "Funded and open for contributions",
    body: "Your USDC is held by the escrow contract. Contributors can submit captures against this request now, and each verified submission releases its share automatically — nothing pays out in one lump at the end.",
  },
  [JobStatus.Submitted]: {
    label: "AWAITING EVALUATION",
    title: "Deliverable submitted",
    body: "The provider submitted a final deliverable. The evaluator agent verifies it before the remaining escrow is released to contributors or refunded to you.",
  },
  [JobStatus.Completed]: {
    label: "COMPLETED",
    title: "This request is settled",
    body: "The evaluator approved the work and the escrow has been released. Nothing further is owed.",
  },
  [JobStatus.Rejected]: {
    label: "REJECTED",
    title: "This request was rejected",
    body: "The unspent portion of the escrow was refunded to your wallet. Anything already released for verified submissions stays paid.",
  },
  [JobStatus.Expired]: {
    label: "EXPIRED",
    title: "This request passed its deadline",
    body: "The unspent escrow was refunded to your wallet. Post a new request to keep collecting data.",
  },
};

export function RequestStatusPanel() {
  const id = useRequestId();
  const { data } = useGetJob(id);

  if (!data) return null;

  const copy = COPY[data.status];
  if (!copy) return null;

  const remaining = data.budget - data.spent;

  return (
    <Panel mb={6} p={8}>
      <Text
        textStyle="label-mono"
        fontSize="12px"
        color="fg.subtle"
        fontWeight="700"
        mb={2}
      >
        {copy.label}
      </Text>
      <Heading textStyle="body-lg" fontWeight="700" color="primary" mb={2}>
        {copy.title}
      </Heading>
      <Text fontSize="14px" color="fg.muted" mb={4} lineHeight="1.6">
        {copy.body}
      </Text>

      <Box
        bg="surfaceNeutral"
        p={4}
        border="1px solid"
        borderColor="border.chrome"
      >
        <Stack gap={1}>
          <DataRow label="Released so far">
            <UsdcAmount
              value={data.spent}
              color="primary"
              fontWeight="700"
              fontSize="14px"
            />
          </DataRow>
          <DataRow label="Remaining in escrow">
            <UsdcAmount
              value={remaining}
              color="primary"
              fontWeight="700"
              fontSize="14px"
            />
          </DataRow>
          <DataRow label="Deadline">
            <Mono color="primary" fontWeight="700">
              {formatDateTime(data.expiredAt)}
            </Mono>
          </DataRow>
        </Stack>
      </Box>
    </Panel>
  );
}
