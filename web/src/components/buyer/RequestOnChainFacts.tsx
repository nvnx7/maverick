"use client";

import { Box, Heading, Stack, Text, SimpleGrid } from "@chakra-ui/react";
import { useState } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { useGetJob } from "@/api/jobs";
import { Button } from "@/components/common/Button";
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
      border="1px solid"
      borderColor="border.chrome"
      bg="surfaceNeutral"
      p={4}
    >
      <Text textStyle="label-mono" fontSize="10px" color="fg.subtle" fontWeight="700" mb={1}>
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
    <Panel mb={10} p={8}>
      <Heading textStyle="body-lg" fontWeight="700" color="primary" mb={6}>
        Request Specifications
      </Heading>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={4} mb={4}>
        <InfoCard label="DATA MODALITY">
          <Text textStyle="body-md" fontWeight="700" color="primary">
            {MODALITY_LABELS[data.spec.modality]}
          </Text>
        </InfoCard>
        <InfoCard label="MINIMUM QUOTA">
          <Mono color="primary" fontSize="14px" fontWeight="700">
            {data.spec.minItems.toLocaleString("en-US")} items
          </Mono>
        </InfoCard>
        <InfoCard label="EXPIRATION TIMESTAMP">
          <Mono color="primary" fontSize="14px" fontWeight="700">
            {formatDate(data.expiredAt)}
          </Mono>
        </InfoCard>
        <InfoCard label="DEVICE REQUIREMENTS">
          <Text textStyle="body-md" color="primary" fontWeight="600">
            {data.spec.deviceRequirements}
          </Text>
        </InfoCard>
      </SimpleGrid>

      {data.description && (
        <Box border="1px solid" borderColor="border.chrome" bg="surfaceNeutral" p={4} mb={4}>
          <Text textStyle="label-mono" fontSize="10px" color="fg.subtle" fontWeight="700" mb={2}>
            DESCRIPTION
          </Text>
          <Text textStyle="body-md" color="primary">
            {data.description}
          </Text>
        </Box>
      )}

      <Box mt={4} pt={4} borderTop="1px solid" borderColor="border.chrome">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          w="full"
          justifyContent="space-between"
          px={3}
          py={3}
        >
          <Text textStyle="label-mono" fontSize="11px" fontWeight="700">ADVANCED ON-CHAIN FACTS</Text>
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

