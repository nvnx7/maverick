"use client";

import { Box, Button, Heading, Stack, Text, Flex } from "@chakra-ui/react";
import { useState } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { useGetJob } from "@/api/jobs";
import { DataRow } from "@/components/common/DataRow";
import { ExplorerLink } from "@/components/common/ExplorerLink";
import { Mono } from "@/components/common/Mono";
import { Panel } from "@/components/common/Panel";
import { MODALITY_LABELS } from "@/config/constants";
import { useRequestId } from "@/hooks/useRequestId";
import { formatDate } from "@/utils/format";
import { formatUsdc } from "@/utils/format";

export function RequestOnChainFacts() {
  const id = useRequestId();
  const { data } = useGetJob(id);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!data) return null;

  return (
    <Panel mb={10}>
      <Heading textStyle="body-md" fontWeight="600" color="primary" mb={6}>
        Request Details
      </Heading>

      <Stack gap={0}>
        <DataRow label="Modality">
          <Text textStyle="body-md" color="primary">{MODALITY_LABELS[data.spec.modality]}</Text>
        </DataRow>
        
        <DataRow label="Minimum items">
          <Mono color="primary">{data.spec.minItems.toLocaleString("en-US")}</Mono>
        </DataRow>
        
        <DataRow label="Device requirements">
          <Text textStyle="body-md" color="primary" maxW="300px" textAlign="end">
            {data.spec.deviceRequirements}
          </Text>
        </DataRow>

        <DataRow label="Total budget">
          <Mono color="primary">{formatUsdc(data.budget)} USDC</Mono>
        </DataRow>
        
        <DataRow label="Expiration">
          <Mono color="primary">{formatDate(data.expiredAt)}</Mono>
        </DataRow>

        {data.description && (
          <DataRow label="Description">
            <Text textStyle="body-md" color="fg.subtle" maxW="300px" textAlign="end">
              {data.description}
            </Text>
          </DataRow>
        )}
      </Stack>

      <Box mt={6} pt={6} borderTopWidth="1px" borderColor="border.DEFAULT">
        <Button
          variant="ghost"
          size="sm"
          color="fg.subtle"
          onClick={() => setShowAdvanced(!showAdvanced)}
          w="full"
          justifyContent="space-between"
          px={0}
          _hover={{ bg: "transparent", color: "primary" }}
        >
          <Text textStyle="label-mono">Advanced On-Chain Details</Text>
          {showAdvanced ? <LuChevronUp /> : <LuChevronDown />}
        </Button>

        {showAdvanced && (
          <Stack gap={0} mt={4} pt={4} borderTopWidth="1px" borderColor="border.DEFAULT">
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
            {data.createdTxHash && (
              <DataRow label="Created Tx">
                <ExplorerLink value={data.createdTxHash} kind="tx" />
              </DataRow>
            )}
          </Stack>
        )}
      </Box>
    </Panel>
  );
}
