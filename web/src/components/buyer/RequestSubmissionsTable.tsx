"use client";

import { Badge, Box, Heading, Table, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useGetRequestSubmissions } from "@/api/submissions";
import { CopyableHash } from "@/components/common/CopyableHash";

import { Mono } from "@/components/common/Mono";
import { ErrorBlock, LoadingBlock } from "@/components/common/QueryState";
import { UsdcAmount } from "@/components/common/UsdcAmount";
import { useRequestId } from "@/hooks/useRequestId";
import type { Submission } from "@/types";
import { formatDateTime } from "@/utils/format";
import { SUBMISSION_STATUS_COPY } from "@/utils/submission";
import { SubmissionDetailDialog } from "./SubmissionDetailDialog";
import { SubmissionPreview } from "./SubmissionPreview";
import { SubmissionDownloadButton } from "./SubmissionDownloadButton";
import { Flex } from "@chakra-ui/react";

export function RequestSubmissionsTable() {
  const id = useRequestId();
  const { data, isPending, isError } = useGetRequestSubmissions(id);
  const [selected, setSelected] = useState<Submission | null>(null);

  const firstSubmission = data?.[0];

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading textStyle="body-md" fontWeight="600" color="primary">
          Submissions
        </Heading>
        <SubmissionDownloadButton jobId={id} />
      </Flex>
      
      <SubmissionPreview jobId={id} />

      {isPending && <LoadingBlock label="Reading the submission ledger" />}
      {isError && <ErrorBlock />}

      {data && data.length === 0 && (
        <Box
          borderWidth="1px"
          borderColor="border.DEFAULT"
          bg="surfaceNeutral"
          py={12}
          textAlign="center"
        >
          <Text fontWeight="500" color="fg.muted" mb={1}>
            No submissions yet
          </Text>
          <Text fontSize="sm" color="fg.subtle">
            Submissions from contributors will appear here once received.
          </Text>
        </Box>
      )}

      {data && data.length > 0 && (
          <>
            <Table.Root
              size="md"
              interactive
              borderWidth="1px"
              borderColor="border.DEFAULT"
            >
              <Table.Header>
                <Table.Row bg="surfaceNeutral">
                  <Table.ColumnHeader color="fg.subtle" textStyle="label-mono">
                    Data hash
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="fg.subtle" textStyle="label-mono">
                    Submitted
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="fg.subtle" textStyle="label-mono">
                    Claim
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="fg.subtle"
                    textStyle="label-mono"
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
                      _hover={{ bg: "surfaceNeutral" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(submission);
                      }}
                    >
                      <Table.Cell onClick={(event) => event.stopPropagation()}>
                        <CopyableHash value={submission.dataHash} />
                      </Table.Cell>
                      <Table.Cell>
                        <Mono color="primary">
                          {formatDateTime(submission.submittedAt)}
                        </Mono>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          colorPalette={status.tone}
                          variant="outline"
                          fontSize="xs"
                          borderRadius="0"
                        >
                          {status.label}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell textAlign="end" color="primary">
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
        )}
    </Box>
  );
}
