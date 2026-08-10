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
import type { FundedRequest } from "@/types";

export function FundedRequestCard({ request }: { request: FundedRequest }) {
  return (
    <LinkBox
      as="article"
      bg="surfaceNeutral"
      border="1px solid"
      borderColor="primary"
      borderRadius="0"
      p={7}
      transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        bg: "bg.panel",
        transform: "translate(-3px, -3px)",
        boxShadow: "5px 5px 0px 0px #000000",
      }}
    >
      <Flex justify="space-between" align="start" gap={4} mb={4}>
        <Box>
          <Heading textStyle="body-lg" fontWeight="700" color="primary" fontSize="18px">
            <LinkOverlay asChild>
              <NextLink href={routes.contributor.fulfill(request.id)}>
                {MODALITY_LABELS[request.spec.modality]}
              </NextLink>
            </LinkOverlay>
          </Heading>
          <Mono color="fg.subtle" fontSize="11px" mt={1} fontWeight="600">
            REQ #{request.id}
          </Mono>
        </Box>
        <JobStatusBadge status={request.status} />
      </Flex>

      <Box bg="primary" color="onPrimary" p={4} my={4}>
        <Text textStyle="label-mono" color="#888888" fontSize="10px" mb={1}>
          PAYOUT PER ITEM
        </Text>
        <UsdcAmount
          value={request.pricePerItem}
          fontSize="22px"
          fontWeight="800"
          color="onPrimary"
          display="block"
        />
      </Box>

      <Text textStyle="body-sm" color="fg.muted" lineHeight="1.6" mb={4} fontSize="14px">
        {request.spec.deviceRequirements}
      </Text>

      <Flex
        justify="space-between"
        align="center"
        borderTop="1px solid"
        borderColor="border.chrome"
        pt={3.5}
      >
        <Text textStyle="label-mono" fontSize="11px" color="fg.subtle">
          BUDGET REMAINING
        </Text>
        <UsdcAmount value={request.budgetRemaining} fontSize="12px" fontWeight="700" color="primary" />
      </Flex>
    </LinkBox>
  );
}

