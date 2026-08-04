import {
  Box,
  Flex,
  Heading,
  LinkBox,
  LinkOverlay,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { JobStatusBadge } from "@/components/common/JobStatusBadge";
import { Mono } from "@/components/common/Mono";
import { UsdcAmount } from "@/components/common/UsdcAmount";
import { MODALITY_LABELS } from "@/config/constants";
import { routes } from "@/config/routes";
import type { OpenRequest } from "@/types";

export function OpenRequestCard({ request }: { request: OpenRequest }) {
  return (
    <LinkBox
      as="article"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      p={6}
      transition="border-color 0.15s, background 0.15s"
      _hover={{ borderColor: "brand.600", bg: "bg.subtle" }}
    >
      <Flex justify="space-between" align="start" gap={4} mb={4}>
        <Box>
          <Heading size="md" fontWeight="500">
            <LinkOverlay asChild>
              <NextLink href={routes.contributor.fulfill(request.id)}>
                {MODALITY_LABELS[request.spec.modality]}
              </NextLink>
            </LinkOverlay>
          </Heading>
          <Mono color="fg.muted" fontSize="xs" mt={1}>
            #{request.id}
          </Mono>
        </Box>
        <JobStatusBadge status={request.status} />
      </Flex>

      <UsdcAmount
        value={request.pricePerItem}
        fontSize="2xl"
        color="brand.fg"
        display="block"
      />
      <Text fontSize="xs" color="fg.muted" mt={1} mb={4}>
        per accepted item
      </Text>

      <Text fontSize="sm" color="fg.muted" lineHeight="1.6" mb={4}>
        {request.spec.deviceRequirements}
      </Text>

      <Flex
        justify="space-between"
        borderTopWidth="1px"
        borderColor="border.muted"
        pt={3}
      >
        <Text fontSize="xs" color="fg.muted">
          Budget remaining
        </Text>
        <UsdcAmount value={request.budgetRemaining} fontSize="xs" />
      </Flex>
    </LinkBox>
  );
}
