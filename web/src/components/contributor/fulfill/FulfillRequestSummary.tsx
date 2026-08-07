"use client";

import { Flex, Heading, HStack, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import { useGetFundedJob } from "@/api/jobs";
import { JobStatusBadge } from "@/components/common/JobStatusBadge";
import { Mono } from "@/components/common/Mono";
import { Panel } from "@/components/common/Panel";
import { ErrorBlock, LoadingBlock } from "@/components/common/QueryState";
import { UsdcAmount } from "@/components/common/UsdcAmount";
import { MODALITY_LABELS } from "@/config/constants";
import { routes } from "@/config/routes";
import { useRequestId } from "@/hooks/useRequestId";

export function FulfillRequestSummary() {
  const id = useRequestId();
  const { data, isPending, isError } = useGetFundedJob(id);

  if (isPending) return <LoadingBlock label="Reading the request" />;
  if (isError) return <ErrorBlock />;
  if (!data) {
    return (
      <ErrorBlock message={`Request #${id} isn't open for submissions.`} />
    );
  }

  return (
    <>
      <Flex justify="space-between" align="center" mb={6}>
        <Link
          asChild
          fontSize="sm"
          color="fg.muted"
          gap={2}
          _hover={{ color: "fg", textDecoration: "none" }}
        >
          <NextLink href={routes.contributor.browse}>
            <LuArrowLeft size={14} /> Open requests
          </NextLink>
        </Link>

        <Link
          asChild
          fontSize="sm"
          color="fg.muted"
          _hover={{ color: "fg", textDecoration: "none" }}
        >
          <NextLink href={routes.contributor.submissions(id)}>
            Your submissions
          </NextLink>
        </Link>
      </Flex>

      <Panel mb={6}>
        <Flex justify="space-between" align="start" gap={6} wrap="wrap">
          <div>
            <HStack gap={3} mb={2}>
              <Heading size="lg" fontWeight="500">
                {MODALITY_LABELS[data.spec.modality]}
              </Heading>
              <JobStatusBadge status={data.status} />
            </HStack>
            <Mono color="fg.muted" fontSize="xs">
              #{data.id}
            </Mono>
            <Text color="fg.muted" fontSize="sm" mt={3} maxW="xl">
              {data.spec.deviceRequirements}
            </Text>
          </div>

          <div>
            <Text fontSize="xs" color="fg.muted" mb={1} textAlign="end">
              Per accepted item
            </Text>
            <UsdcAmount
              value={data.pricePerItem}
              fontSize="2xl"
              color="brand.fg"
              display="block"
              textAlign="end"
            />
          </div>
        </Flex>
      </Panel>
    </>
  );
}
