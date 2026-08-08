"use client";

import { Box, Button, Heading, Stack, Text, Flex, SimpleGrid } from "@chakra-ui/react";
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

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box
      borderWidth="1px"
      borderColor="border.DEFAULT"
      bg="surfaceNeutral"
      p={4}
    >
      <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider" mb={1}>
        {label}
      </Text>
      {children}
    </Box>
  );
}

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

      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={3} mb={4}>
        <InfoCard label="Modality">
          <Text textStyle="body-md" fontWeight="500" color="primary">
            {MODALITY_LABELS[data.spec.modality]}
          </Text>
        </InfoCard>
        <InfoCard label="Minimum items">
          <Mono color="primary" fontSize="md" fontWeight="500">
            {data.spec.minItems.toLocaleString("en-US")}
          </Mono>
        </InfoCard>
        <InfoCard label="Expiration">
          <Mono color="primary" fontSize="md" fontWeight="500">
            {formatDate(data.expiredAt)}
          </Mono>
        </InfoCard>
        <InfoCard label="Device requirements">
          <Text textStyle="body-md" color="primary" fontWeight="500">
            {data.spec.deviceRequirements}
          </Text>
        </InfoCard>
      </SimpleGrid>

      {data.description && (
        <Box borderWidth="1px" borderColor="border.DEFAULT" bg="surfaceNeutral" p={4} mb={4}>
          <Text fontSize="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider" mb={2}>
            Description
          </Text>
          <Text textStyle="body-md" color="fg.subtle">
            {data.description}
          </Text>
        </Box>
      )}

      <Box mt={4} pt={4} borderTopWidth="1px" borderColor="border.DEFAULT">
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

