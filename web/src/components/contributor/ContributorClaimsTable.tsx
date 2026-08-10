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
      <Table.Root size="md" interactive border="1px solid" borderColor="primary">
        <Table.Header bg="primary">
          <Table.Row>
            <Table.ColumnHeader color="onPrimary" textStyle="label-mono" fontSize="11px" fontWeight="700">
              DELIVERABLE PROVENANCE
            </Table.ColumnHeader>
            <Table.ColumnHeader color="onPrimary" textStyle="label-mono" fontSize="11px" fontWeight="700">
              BLOCK
            </Table.ColumnHeader>
            <Table.ColumnHeader color="onPrimary" textStyle="label-mono" fontSize="11px" fontWeight="700">
              TRANSACTION HASH
            </Table.ColumnHeader>
            <Table.ColumnHeader
              color="onPrimary"
              textStyle="label-mono"
              fontSize="11px"
              fontWeight="700"
              textAlign="end"
            >
              CUMULATIVE
            </Table.ColumnHeader>
            <Table.ColumnHeader
              color="onPrimary"
              textStyle="label-mono"
              fontSize="11px"
              fontWeight="700"
              textAlign="end"
            >
              CLAIMED PAYOUT
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {data.map((claim) => (
            <Table.Row
              key={claim.transactionHash}
              bg="surfaceNeutral"
              cursor="pointer"
              transition="all 0.15s ease"
              _hover={{ bg: "bg.panel" }}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(claim);
              }}
            >
              <Table.Cell borderBottom="1px solid" borderColor="border.chrome" onClick={(event) => event.stopPropagation()}>
                <CopyableHash value={claim.deliverable} />
              </Table.Cell>
              <Table.Cell borderBottom="1px solid" borderColor="border.chrome">
                <Mono color="primary" fontWeight="700">{claim.blockNumber.toString()}</Mono>
              </Table.Cell>
              <Table.Cell borderBottom="1px solid" borderColor="border.chrome">
                <ExplorerLink value={claim.transactionHash} kind="tx" />
              </Table.Cell>
              <Table.Cell textAlign="end" color="primary" borderBottom="1px solid" borderColor="border.chrome">
                <UsdcAmount
                  value={claim.cumulativeAmount}
                  unit={false}
                  fontSize="14px"
                  fontWeight="700"
                />
              </Table.Cell>
              <Table.Cell textAlign="end" color="primary" borderBottom="1px solid" borderColor="border.chrome">
                {claim.settled || claim.approved ? (
                  <UsdcAmount
                    value={claim.delta}
                    unit={false}
                    fontSize="14px"
                    fontWeight="700"
                  />
                ) : (
                  <Text color="fg.subtle" fontSize="13px">
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
