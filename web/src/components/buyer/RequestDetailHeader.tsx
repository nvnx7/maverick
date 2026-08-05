"use client";

import { Box, Flex, Heading, HStack, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import { useGetJob } from "@/api/getJob";
import { JobStatusBadge } from "@/components/common/JobStatusBadge";
import { Panel } from "@/components/common/Panel";
import { ErrorBlock, LoadingBlock } from "@/components/common/QueryState";
import { MODALITY_LABELS } from "@/config/constants";
import { routes } from "@/config/routes";
import { useRequestId } from "@/hooks/useRequestId";
import { RequestSpendBar } from "./RequestSpendBar";

export function RequestDetailHeader() {
  const id = useRequestId();
  const { data, isPending, isError } = useGetJob(id);

  if (isPending) return <LoadingBlock label="Reading the job from chain" />;
  if (isError) return <ErrorBlock />;
  if (!data) {
    return (
      <ErrorBlock message={`No job with id ${id} exists on this chain.`} />
    );
  }

  return (
    <Box mb={6}>
      <Link
        asChild
        fontSize="sm"
        color="fg.muted"
        gap={2}
        mb={6}
        _hover={{ color: "fg", textDecoration: "none" }}
      >
        <NextLink href={routes.buyer.dashboard}>
          <LuArrowLeft size={14} /> All requests
        </NextLink>
      </Link>

      <Flex justify="space-between" align="start" gap={4} wrap="wrap" mb={2}>
        <HStack gap={3}>
          <Heading size="2xl" fontWeight="500" fontFamily="mono">
            #{data.id}
          </Heading>
          <JobStatusBadge status={data.status} />
        </HStack>
      </Flex>

      <Text color="fg.muted" mb={6}>
        {MODALITY_LABELS[data.spec.modality]} · {data.spec.deviceRequirements}
      </Text>

      <Panel>
        <RequestSpendBar budget={data.budget} spent={data.spent} />
      </Panel>
    </Box>
  );
}
