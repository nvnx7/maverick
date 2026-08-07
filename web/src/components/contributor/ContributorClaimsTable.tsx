"use client";

import { Table } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { useGetContributorClaims } from "@/api/jobs";
import { CopyableHash } from "@/components/common/CopyableHash";
import { EmptyState } from "@/components/common/EmptyState";
import { ExplorerLink } from "@/components/common/ExplorerLink";
import { Mono } from "@/components/common/Mono";
import { ErrorBlock, LoadingBlock } from "@/components/common/QueryState";
import { UsdcAmount } from "@/components/common/UsdcAmount";
import { useRequestId } from "@/hooks/useRequestId";

export function ContributorClaimsTable() {
  const jobId = useRequestId();
  const { address } = useAccount();
  const { data, isPending, isError } = useGetContributorClaims({
    jobId,
    contributor: address,
  });

  if (isPending) return <LoadingBlock label="Reading your claims" />;
  if (isError) return <ErrorBlock />;

  if (data.length === 0) {
    return (
      <EmptyState
        title="No claims submitted yet"
        description="Once a claim is submitted for this request, it will show up here."
      />
    );
  }

  return (
    <Table.Root size="md" interactive borderWidth="1px" borderColor="border">
      <Table.Header>
        <Table.Row bg="bg.subtle">
          <Table.ColumnHeader color="fg.muted" fontWeight="400">
            Deliverable
          </Table.ColumnHeader>
          <Table.ColumnHeader color="fg.muted" fontWeight="400">
            Block
          </Table.ColumnHeader>
          <Table.ColumnHeader color="fg.muted" fontWeight="400">
            Transaction
          </Table.ColumnHeader>
          <Table.ColumnHeader color="fg.muted" fontWeight="400" textAlign="end">
            Cumulative
          </Table.ColumnHeader>
          <Table.ColumnHeader color="fg.muted" fontWeight="400" textAlign="end">
            Claimed
          </Table.ColumnHeader>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {data.map((claim) => (
          <Table.Row key={claim.transactionHash} bg="bg.panel">
            <Table.Cell>
              <CopyableHash value={claim.deliverable} />
            </Table.Cell>
            <Table.Cell>
              <Mono color="fg.muted">{claim.blockNumber.toString()}</Mono>
            </Table.Cell>
            <Table.Cell>
              <ExplorerLink value={claim.transactionHash} kind="tx" />
            </Table.Cell>
            <Table.Cell textAlign="end">
              <UsdcAmount
                value={claim.cumulativeAmount}
                unit={false}
                fontSize="sm"
              />
            </Table.Cell>
            <Table.Cell textAlign="end">
              <UsdcAmount
                value={claim.delta}
                unit={false}
                fontSize="sm"
                color="brand.fg"
              />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
