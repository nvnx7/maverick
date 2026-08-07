"use client";

import { SimpleGrid, Stack } from "@chakra-ui/react";
import { useState } from "react";
import { useGetFundedJobs } from "@/api/jobs";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorBlock, LoadingBlock } from "@/components/common/QueryState";
import type { Modality } from "@/config/constants";
import { FundedRequestCard } from "./FundedRequestCard";
import { ModalityFilter } from "./ModalityFilter";

export function BrowseRequests() {
  const [modality, setModality] = useState<Modality | null>(null);
  const { data, isPending, isError } = useGetFundedJobs(modality ?? undefined);

  return (
    <Stack gap={6}>
      <ModalityFilter value={modality} onChange={setModality} />

      {isPending && <LoadingBlock label="Reading funded requests" />}
      {isError && <ErrorBlock />}

      {data &&
        (data.length === 0 ? (
          <EmptyState
            title="No funded requests match your device right now"
            description="Clear the filter to see every funded request."
          />
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            {data.map((request) => (
              <FundedRequestCard key={request.id} request={request} />
            ))}
          </SimpleGrid>
        ))}
    </Stack>
  );
}
