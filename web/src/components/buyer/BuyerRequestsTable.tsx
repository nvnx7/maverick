"use client";

import { Button, Link, Table, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useGetBuyerJobs } from "@/api/jobs";
import { EmptyState } from "@/components/common/EmptyState";
import { JobStatusBadge } from "@/components/common/JobStatusBadge";
import { Mono } from "@/components/common/Mono";
import { ErrorBlock, LoadingBlock } from "@/components/common/QueryState";
import { UsdcAmount } from "@/components/common/UsdcAmount";
import { MODALITY_LABELS } from "@/config/constants";
import { routes } from "@/config/routes";
import { formatDate } from "@/utils/format";

export function BuyerRequestsTable() {
  const router = useRouter();
  const { address } = useAccount();
  const { data, isPending, isError, error } = useGetBuyerJobs(address);

  if (isPending) return <LoadingBlock label="Reading your requests" />;
  if (isError) return <ErrorBlock message={error?.message} />;

  if (data.length === 0) {
    return (
      <EmptyState
        title="No requests yet"
        description="Post one to start collecting signed captures against a funded budget."
      >
        <Button asChild colorPalette="brand" size="sm" mt={2}>
          <NextLink href={routes.buyer.newRequest}>New request</NextLink>
        </Button>
      </EmptyState>
    );
  }

  return (
    <Table.Root size="md" interactive borderWidth="1px" borderColor="border">
      <Table.Header>
        <Table.Row bg="bg.subtle">
          <Table.ColumnHeader color="fg.muted" fontWeight="400">
            Request
          </Table.ColumnHeader>
          <Table.ColumnHeader color="fg.muted" fontWeight="400">
            Status
          </Table.ColumnHeader>
          <Table.ColumnHeader color="fg.muted" fontWeight="400" textAlign="end">
            Budget
          </Table.ColumnHeader>
          <Table.ColumnHeader color="fg.muted" fontWeight="400" textAlign="end">
            Submissions
          </Table.ColumnHeader>
          <Table.ColumnHeader color="fg.muted" fontWeight="400" textAlign="end">
            Created
          </Table.ColumnHeader>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {data.map((request) => (
          <Table.Row
            key={request.id}
            cursor="pointer"
            bg="bg.panel"
            onClick={() => router.push(routes.buyer.request(request.id))}
            _hover={{ bg: "bg.emphasized" }}
          >
            <Table.Cell>
              <Link asChild _hover={{ textDecoration: "none" }}>
                <NextLink href={routes.buyer.request(request.id)}>
                  <Mono color="fg">#{request.id}</Mono>
                </NextLink>
              </Link>
              <Text fontSize="sm" color="fg.muted" mt={0.5}>
                {MODALITY_LABELS[request.spec.modality]}
              </Text>
            </Table.Cell>
            <Table.Cell>
              <JobStatusBadge status={request.status} />
            </Table.Cell>
            <Table.Cell textAlign="end">
              <UsdcAmount value={request.budget} unit={false} fontSize="sm" />
            </Table.Cell>
            <Table.Cell textAlign="end">
              <Mono color={request.submissionCount > 0 ? "fg" : "fg.muted"}>
                {request.submissionCount}
              </Mono>
            </Table.Cell>
            <Table.Cell textAlign="end">
              <Mono color="fg.muted">{formatDate(request.createdAt)}</Mono>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
