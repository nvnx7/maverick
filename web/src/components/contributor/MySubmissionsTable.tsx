"use client";

import { Badge, Button, Table, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { useAccount } from "wagmi";
import { useGetMySubmissions } from "@/api/getMySubmissions";
import { CopyableHash } from "@/components/common/CopyableHash";
import { EmptyState } from "@/components/common/EmptyState";
import { ExplorerLink } from "@/components/common/ExplorerLink";
import { Mono } from "@/components/common/Mono";
import { ErrorBlock, LoadingBlock } from "@/components/common/QueryState";
import { UsdcAmount } from "@/components/common/UsdcAmount";
import { routes } from "@/config/routes";
import { formatDateTime } from "@/utils/format";
import { SUBMISSION_STATUS_COPY } from "@/utils/submission";

export function MySubmissionsTable() {
  const { address } = useAccount();
  const { data, isPending, isError } = useGetMySubmissions(address);

  if (isPending) return <LoadingBlock label="Reading your submissions" />;
  if (isError) return <ErrorBlock />;

  if (data.length === 0) {
    return (
      <EmptyState
        title="No submissions yet"
        description="Pick an open request and submit a signed capture to get started."
      >
        <Button asChild colorPalette="brand" size="sm" mt={2}>
          <NextLink href={routes.contributor.browse}>Browse requests</NextLink>
        </Button>
      </EmptyState>
    );
  }

  return (
    <Table.Root size="md" interactive borderWidth="1px" borderColor="border">
      <Table.Header>
        <Table.Row bg="bg.subtle">
          <Table.ColumnHeader color="fg.muted" fontWeight="400">
            Data hash
          </Table.ColumnHeader>
          <Table.ColumnHeader color="fg.muted" fontWeight="400">
            Request
          </Table.ColumnHeader>
          <Table.ColumnHeader color="fg.muted" fontWeight="400">
            Status
          </Table.ColumnHeader>
          <Table.ColumnHeader color="fg.muted" fontWeight="400">
            Payout
          </Table.ColumnHeader>
          <Table.ColumnHeader color="fg.muted" fontWeight="400" textAlign="end">
            Amount
          </Table.ColumnHeader>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {data.map((submission) => {
          const status = SUBMISSION_STATUS_COPY[submission.status];
          return (
            <Table.Row key={submission.id} bg="bg.panel">
              <Table.Cell>
                <CopyableHash value={submission.dataHash} />
                <Text fontSize="xs" color="fg.muted" mt={1}>
                  {formatDateTime(submission.submittedAt)}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Mono color="fg.muted">#{submission.jobId}</Mono>
              </Table.Cell>
              <Table.Cell>
                <Badge
                  colorPalette={status.tone}
                  variant="surface"
                  fontSize="xs"
                >
                  {status.label}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                {submission.payoutTxHash ? (
                  <ExplorerLink
                    value={submission.payoutTxHash}
                    kind="tx"
                    lead={8}
                    tail={6}
                  />
                ) : (
                  <Text fontSize="sm" color="fg.subtle">
                    —
                  </Text>
                )}
              </Table.Cell>
              <Table.Cell textAlign="end">
                <UsdcAmount
                  value={submission.amount}
                  unit={false}
                  fontSize="sm"
                  color={submission.status === "paid" ? "brand.fg" : "fg"}
                />
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table.Root>
  );
}
