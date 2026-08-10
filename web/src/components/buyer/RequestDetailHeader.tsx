"use client";

import { Box, Flex, Heading, HStack, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import { useGetJob } from "@/api/jobs";
import { JobStatusBadge } from "@/components/common/JobStatusBadge";
import { Panel } from "@/components/common/Panel";
import { ErrorBlock, LoadingBlock } from "@/components/common/QueryState";
import { UsdcAmount } from "@/components/common/UsdcAmount";
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

  const hasBudget = data.budget > 0n;

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

      <Panel>
        <Flex justify="space-between" align="start" gap={6} wrap="wrap" mb={6}>
          <Box>
            <Heading textStyle="headline-lg" color="primary" mb={2}>
              Request #{data.id}
            </Heading>
            <Text fontSize="sm" color="fg.muted">
              {data.submissionCount} submission
              {data.submissionCount !== 1 && "s"}
            </Text>
          </Box>
          <JobStatusBadge status={data.status} fontSize="sm" px={4} py={1.5} />
        </Flex>

        {hasBudget && (
          <Box borderTopWidth="1px" borderColor="border.DEFAULT" pt={5}>
            <Flex gap={8} wrap="wrap" mb={4}>
              <Box>
                <Text
                  fontSize="xs"
                  color="fg.muted"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  mb={1}
                >
                  Total Budget
                </Text>
                <UsdcAmount
                  value={data.budget}
                  fontSize="2xl"
                  fontWeight="600"
                  color="primary"
                />
              </Box>
              <Box>
                <Text
                  fontSize="xs"
                  color="fg.muted"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  mb={1}
                >
                  Spent
                </Text>
                <UsdcAmount
                  value={data.spent}
                  fontSize="2xl"
                  fontWeight="600"
                  color="brand.fg"
                />
              </Box>
            </Flex>
            <RequestSpendBar budget={data.budget} spent={data.spent} />
          </Box>
        )}
      </Panel>
    </Box>
  );
}
