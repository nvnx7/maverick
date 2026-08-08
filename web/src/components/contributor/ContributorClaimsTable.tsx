"use client";

import { Table, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useAccount } from "wagmi";
import { type ContributorClaim, useGetContributorClaims } from "@/api/jobs";
import { CopyableHash } from "@/components/common/CopyableHash";
import { EmptyState } from "@/components/common/EmptyState";
import { ExplorerLink } from "@/components/common/ExplorerLink";
import { Mono } from "@/components/common/Mono";
import { ErrorBlock, LoadingBlock } from "@/components/common/QueryState";
import { UsdcAmount } from "@/components/common/UsdcAmount";
import { useRequestId } from "@/hooks/useRequestId";
import { ContributorClaimDialog } from "./ContributorClaimDialog";

export function ContributorClaimsTable() {
  const jobId = useRequestId();
  const { address } = useAccount();
  const { data, isPending, isError } = useGetContributorClaims({
    jobId,
    contributor: address,
  });
  const [selected, setSelected] = useState<ContributorClaim | null>(null);

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
    <>
      <Table.Root size="md" interactive borderWidth="1px" borderColor="border.DEFAULT">
        <Table.Header>
          <Table.Row bg="surfaceNeutral">
            <Table.ColumnHeader color="fg.subtle" textStyle="label-mono">
              Deliverable
            </Table.ColumnHeader>
            <Table.ColumnHeader color="fg.subtle" textStyle="label-mono">
              Block
            </Table.ColumnHeader>
            <Table.ColumnHeader color="fg.subtle" textStyle="label-mono">
              Transaction
            </Table.ColumnHeader>
            <Table.ColumnHeader
              color="fg.subtle"
              textStyle="label-mono"
              textAlign="end"
            >
              Cumulative
            </Table.ColumnHeader>
            <Table.ColumnHeader
              color="fg.subtle"
              textStyle="label-mono"
              textAlign="end"
            >
              Claimed
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {data.map((claim) => (
            <Table.Row
              key={claim.transactionHash}
              bg="bg.panel"
              cursor="pointer"
              _hover={{ bg: "surfaceNeutral" }}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(claim);
              }}
            >
              <Table.Cell onClick={(event) => event.stopPropagation()}>
                <CopyableHash value={claim.deliverable} />
              </Table.Cell>
              <Table.Cell>
                <Mono color="primary">{claim.blockNumber.toString()}</Mono>
              </Table.Cell>
              <Table.Cell>
                <ExplorerLink value={claim.transactionHash} kind="tx" />
              </Table.Cell>
              <Table.Cell textAlign="end" color="primary">
                <UsdcAmount
                  value={claim.cumulativeAmount}
                  unit={false}
                  fontSize="sm"
                />
              </Table.Cell>
              <Table.Cell textAlign="end" color="primary">
                {claim.settled || claim.approved ? (
                  <UsdcAmount
                    value={claim.delta}
                    unit={false}
                    fontSize="sm"
                  />
                ) : (
                  <Text color="fg.subtle" fontSize="sm">
                    --
                  </Text>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <ContributorClaimDialog
        claim={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </>
  );
}
