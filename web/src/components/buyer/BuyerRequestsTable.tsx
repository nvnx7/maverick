"use client";

import { Link, Table, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useGetBuyerJobs } from "@/api/jobs";
import { Button } from "@/components/common/Button";
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
  const { data, isPending, isError, error } = useGetBuyerJobs({
    buyer: address,
  });

  if (isPending) return <LoadingBlock label="Reading your requests" />;
  if (isError) return <ErrorBlock message={error?.message} />;

  if (data.length === 0) {
    return (
      <EmptyState
        title="No requests posted yet"
        description="Post a request to start collecting hardware-signed dataset captures against a locked USDC budget."
      >
        <Button asChild variant="primary" px={6} py={5} fontSize="sm" mt={3}>
          <NextLink href={routes.buyer.newRequest}>Post New Request</NextLink>
        </Button>
      </EmptyState>
    );
  }

  return (
    <Table.Root size="md" interactive border="1px solid" borderColor="primary">
      <Table.Header bg="primary">
        <Table.Row bg="primary">
          <Table.ColumnHeader
            bg="primary"
            color="onPrimary"
            textStyle="label-mono"
            fontSize="11px"
            fontWeight="700"
          >
            REQUEST ID & MODALITY
          </Table.ColumnHeader>
          <Table.ColumnHeader
            bg="primary"
            color="onPrimary"
            textStyle="label-mono"
            fontSize="11px"
            fontWeight="700"
          >
            STATUS
          </Table.ColumnHeader>
          <Table.ColumnHeader
            bg="primary"
            color="onPrimary"
            textStyle="label-mono"
            fontSize="11px"
            fontWeight="700"
            textAlign="end"
          >
            TOTAL BUDGET
          </Table.ColumnHeader>
          <Table.ColumnHeader
            bg="primary"
            color="onPrimary"
            textStyle="label-mono"
            fontSize="11px"
            fontWeight="700"
            textAlign="end"
          >
            SUBMISSIONS
          </Table.ColumnHeader>
          <Table.ColumnHeader
            bg="primary"
            color="onPrimary"
            textStyle="label-mono"
            fontSize="11px"
            fontWeight="700"
            textAlign="end"
          >
            CREATED DATE
          </Table.ColumnHeader>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {data.map((request) => (
          <Table.Row
            key={request.id}
            cursor="pointer"
            bg="surfaceNeutral"
            onClick={() => router.push(routes.buyer.request(request.id))}
            transition="all 0.15s ease"
            _hover={{ bg: "bg.panel" }}
          >
            <Table.Cell borderBottom="1px solid" borderColor="border.chrome">
              <Link asChild _hover={{ textDecoration: "none" }}>
                <NextLink href={routes.buyer.request(request.id)}>
                  <Mono color="primary" fontWeight="700" fontSize="14px">
                    #{request.id}
                  </Mono>
                </NextLink>
              </Link>
              <Text
                textStyle="body-sm"
                color="fg.muted"
                fontSize="13px"
                mt={0.5}
              >
                {MODALITY_LABELS[request.spec.modality]}
              </Text>
            </Table.Cell>
            <Table.Cell borderBottom="1px solid" borderColor="border.chrome">
              <JobStatusBadge status={request.status} />
            </Table.Cell>
            <Table.Cell
              textAlign="end"
              borderBottom="1px solid"
              borderColor="border.chrome"
            >
              <UsdcAmount
                value={request.budget}
                unit={false}
                fontSize="14px"
                fontWeight="700"
                color="primary"
              />
            </Table.Cell>
            <Table.Cell
              textAlign="end"
              borderBottom="1px solid"
              borderColor="border.chrome"
            >
              <Mono
                color={request.submissionCount > 0 ? "secondary" : "fg.subtle"}
                fontWeight="700"
              >
                {request.submissionCount}
              </Mono>
            </Table.Cell>
            <Table.Cell
              textAlign="end"
              borderBottom="1px solid"
              borderColor="border.chrome"
            >
              <Mono color="fg.subtle" fontSize="12px">
                {formatDate(request.createdAt)}
              </Mono>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
