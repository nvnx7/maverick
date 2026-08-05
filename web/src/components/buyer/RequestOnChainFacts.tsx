"use client";

import { Heading } from "@chakra-ui/react";
import { useGetJob } from "@/api/getJob";
import { DataRow } from "@/components/common/DataRow";
import { ExplorerLink } from "@/components/common/ExplorerLink";
import { Mono } from "@/components/common/Mono";
import { Panel } from "@/components/common/Panel";
import { useRequestId } from "@/hooks/useRequestId";
import { formatDate } from "@/utils/format";

export function RequestOnChainFacts() {
  const id = useRequestId();
  const { data } = useGetJob(id);

  if (!data) return null;

  return (
    <Panel mb={6}>
      <Heading size="sm" fontWeight="500" color="fg.muted" mb={2}>
        On-chain
      </Heading>

      <DataRow label="Escrow contract">
        <ExplorerLink value={data.contract} kind="address" />
      </DataRow>
      <DataRow label="Client">
        <ExplorerLink value={data.client} kind="address" />
      </DataRow>
      <DataRow label="Provider">
        <ExplorerLink value={data.provider} kind="address" />
      </DataRow>
      <DataRow label="Evaluator">
        <ExplorerLink value={data.evaluator} kind="address" />
      </DataRow>
      <DataRow label="Created">
        <ExplorerLink value={data.createdTxHash} kind="tx" />
      </DataRow>
      <DataRow label="Expires">
        <Mono color="fg.muted">{formatDate(data.expiredAt)}</Mono>
      </DataRow>
      <DataRow label="Minimum items">
        <Mono>{data.spec.minItems.toLocaleString("en-US")}</Mono>
      </DataRow>
    </Panel>
  );
}
