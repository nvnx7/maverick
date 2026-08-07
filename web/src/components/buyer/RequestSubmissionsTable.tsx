"use client";

import { Badge, Box, Heading, Table } from "@chakra-ui/react";
import { useState } from "react";
import { useGetRequestSubmissions } from "@/api/submissions";
import { CopyableHash } from "@/components/common/CopyableHash";
import { EmptyState } from "@/components/common/EmptyState";
import { Mono } from "@/components/common/Mono";
import { ErrorBlock, LoadingBlock } from "@/components/common/QueryState";
import { UsdcAmount } from "@/components/common/UsdcAmount";
import { useRequestId } from "@/hooks/useRequestId";
import type { Submission } from "@/types";
import { formatDateTime } from "@/utils/format";
import { SUBMISSION_STATUS_COPY } from "@/utils/submission";
import { SubmissionDetailDialog } from "./SubmissionDetailDialog";

export function RequestSubmissionsTable() {
  const id = useRequestId();
  const { data, isPending, isError } = useGetRequestSubmissions(id);
  const [selected, setSelected] = useState<Submission | null>(null);

  return (
    <Box>
      <Heading size="sm" fontWeight="500" color="fg.muted" mb={4}>
        Submissions
      </Heading>

      {isPending && <LoadingBlock label="Reading the submission ledger" />}
      {isError && <ErrorBlock />}

      {data &&
        (data.length === 0 ? (
          <EmptyState
            title="No submissions yet"
            description="Contributors can submit as soon as the request is funded."
          />
        ) : (
          <>
            <Table.Root
              size="md"
              interactive
              borderWidth="1px"
              borderColor="border"
            >
              <Table.Header>
                <Table.Row bg="bg.subtle">
                  <Table.ColumnHeader color="fg.muted" fontWeight="400">
                    Data hash
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="fg.muted" fontWeight="400">
                    Submitted
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="fg.muted" fontWeight="400">
                    Claim
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="fg.muted"
                    fontWeight="400"
                    textAlign="end"
                  >
                    Amount
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {data.map((submission) => {
                  const status = SUBMISSION_STATUS_COPY[submission.status];
                  return (
                    <Table.Row
                      key={submission.id}
                      bg="bg.panel"
                      cursor="pointer"
                      onClick={() => setSelected(submission)}
                    >
                      <Table.Cell onClick={(event) => event.stopPropagation()}>
                        <CopyableHash value={submission.dataHash} />
                      </Table.Cell>
                      <Table.Cell>
                        <Mono color="fg.muted">
                          {formatDateTime(submission.submittedAt)}
                        </Mono>
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
                      <Table.Cell textAlign="end">
                        <UsdcAmount
                          value={submission.amount}
                          unit={false}
                          fontSize="sm"
                        />
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
            <SubmissionDetailDialog
              submission={selected}
              open={selected !== null}
              onOpenChange={(open) => {
                if (!open) setSelected(null);
              }}
            />
          </>
        ))}
    </Box>
  );
}
