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
          border="1px solid"
          borderColor="primary"
          borderRadius="0"
          bg="surfaceNeutral"
          py={12}
          textAlign="center"
        >
          <Text textStyle="body-lg" fontWeight="700" color="primary" mb={1}>
            No Submissions Recorded Yet
          </Text>
          <Text fontSize="14px" color="fg.subtle">
            Contributor hardware captures will appear here once submitted to the ledger.
          </Text>
        </Box>
      )}

      {data && data.length > 0 && (
          <>
            <Table.Root
              size="md"
              interactive
              border="1px solid"
              borderColor="primary"
            >
              <Table.Header bg="primary">
                <Table.Row>
                  <Table.ColumnHeader color="onPrimary" textStyle="label-mono" fontSize="11px" fontWeight="700">
                    DATA HASH PROVENANCE
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="onPrimary" textStyle="label-mono" fontSize="11px" fontWeight="700">
                    SUBMITTED TIMESTAMP
                  </Table.ColumnHeader>
                  <Table.ColumnHeader color="onPrimary" textStyle="label-mono" fontSize="11px" fontWeight="700">
                    CLAIM STATUS
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color="onPrimary"
                    textStyle="label-mono"
                    fontSize="11px"
                    fontWeight="700"
                    textAlign="end"
                  >
                    USDC AMOUNT
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {data.map((submission) => {
                  const status = SUBMISSION_STATUS_COPY[submission.status];
                  return (
                    <Table.Row
                      key={submission.id}
                      bg="surfaceNeutral"
                      cursor="pointer"
                      transition="all 0.15s ease"
                      _hover={{ bg: "bg.panel" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(submission);
                      }}
                    >
                      <Table.Cell borderBottom="1px solid" borderColor="border.chrome" onClick={(event) => event.stopPropagation()}>
                        <CopyableHash value={submission.dataHash} />
                      </Table.Cell>
                      <Table.Cell borderBottom="1px solid" borderColor="border.chrome">
                        <Mono color="primary" fontWeight="700">
                          {formatDateTime(submission.submittedAt)}
                        </Mono>
                      </Table.Cell>
                      <Table.Cell borderBottom="1px solid" borderColor="border.chrome">
                        <Badge
                          colorPalette={status.tone}
                          variant="outline"
                          textStyle="label-mono"
                          fontSize="10px"
                          fontWeight="700"
                          borderRadius="0"
                          border="1px solid"
                          borderColor="primary"
                          px={2.5}
                          py={1}
                        >
                          {status.label}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell textAlign="end" color="primary" borderBottom="1px solid" borderColor="border.chrome">
                        <UsdcAmount
                          value={submission.amount}
                          unit={false}
                          fontSize="14px"
                          fontWeight="700"
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
