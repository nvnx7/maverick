"use client";

import { SimpleGrid, Stack } from "@chakra-ui/react";
import { useState } from "react";
import { useGetOpenJobs } from "@/api/jobs";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorBlock, LoadingBlock } from "@/components/common/QueryState";
import type { Modality } from "@/config/constants";
import { ModalityFilter } from "./ModalityFilter";
import { OpenRequestCard } from "./OpenRequestCard";

export function BrowseRequests() {
  const [modality, setModality] = useState<Modality | null>(null);
  const { data, isPending, isError } = useGetOpenJobs(modality ?? undefined);

  return (
    <Stack gap={6}>
      <ModalityFilter value={modality} onChange={setModality} />

      {isPending && <LoadingBlock label="Reading open requests" />}
      {isError && <ErrorBlock />}

      {data &&
        (data.length === 0 ? (
          <EmptyState
            title="No open requests match your device right now"
            description="Clear the filter to see everything currently funded."
          />
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            {data.map((request) => (
              <OpenRequestCard key={request.id} request={request} />
            ))}
          </SimpleGrid>
        ))}
    </Stack>
  );
}
