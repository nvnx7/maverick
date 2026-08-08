"use client";

import {
  Box,
  Flex,
  Heading,
  HStack,
  Link,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
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

function InfoCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      borderWidth="1px"
      borderColor="border.DEFAULT"
      bg="surfaceNeutral"
      p={4}
    >
      <Text
        fontSize="xs"
        color="fg.muted"
        textTransform="uppercase"
        letterSpacing="wider"
        mb={1}
      >
        {label}
      </Text>
      {children}
    </Box>
  );
}

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
        <Flex justify="space-between" align="start" gap={6} wrap="wrap" mb={6}>
          <Box>
            <Heading size="lg" fontWeight="500" mb={1}>
              Job #{data.id}
            </Heading>
          </Box>
          <JobStatusBadge status={data.status} fontSize="sm" px={4} py={1.5} />
        </Flex>

        <Box
          borderWidth="1px"
          borderColor="brand.muted"
          bg="brand.subtle"
          p={5}
          mb={5}
        >
          <Text
            fontSize="xs"
            color="fg.muted"
            textTransform="uppercase"
            letterSpacing="wider"
            mb={1}
          >
            Per accepted item
          </Text>
          <UsdcAmount
            value={data.pricePerItem}
            fontSize="2xl"
            fontWeight="600"
            color="brand.fg"
          />
        </Box>

        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
          <InfoCard label="Modality">
            <Text textStyle="body-md" fontWeight="500" color="primary">
              {MODALITY_LABELS[data.spec.modality]}
            </Text>
          </InfoCard>
          <InfoCard label="Budget remaining">
            <UsdcAmount
              value={data.budgetRemaining}
              fontSize="md"
              fontWeight="500"
              color="primary"
            />
          </InfoCard>
          <InfoCard label="Minimum items">
            <Mono color="primary" fontSize="md" fontWeight="500">
              {data.spec.minItems?.toLocaleString("en-US") ?? "—"}
            </Mono>
          </InfoCard>
          <InfoCard label="Device requirements">
            <Text textStyle="body-md" color="primary" fontWeight="500">
              {data.spec.deviceRequirements}
            </Text>
          </InfoCard>
        </SimpleGrid>
      </Panel>
    </>
  );
}
