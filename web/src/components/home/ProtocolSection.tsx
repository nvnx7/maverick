"use client";

import {
  Badge,
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { LuBanknote, LuFileText, LuUsers, LuWallet } from "react-icons/lu";

const steps = [
  {
    num: "01",
    role: "BUYER",
    badgeColor: "secondary",
    title: "Post & Fund Request",
    body: "Buyers define data specifications, set unit prices, and lock funds into ERC-8183 Escrow.",
    icon: LuFileText,
  },
  {
    num: "02",
    role: "PROVIDER AGENT",
    badgeColor: "primary",
    title: "Review & Authorize",
    body: "Provider agent validates job parameters and opens dataset collection on Arc.",
    icon: LuWallet,
  },
  {
    num: "03",
    role: "CONTRIBUTOR",
    badgeColor: "successGreen",
    title: "Capture & Hardware Sign",
    body: "Contributors record data signed directly by device enclave for cryptographic provenance.",
    icon: LuUsers,
  },
  {
    num: "04",
    role: "EVALUATOR AGENT",
    badgeColor: "primary",
    title: "Verify & Disburse",
    body: "Evaluator agent verifies authenticity and unlocks USDC payouts directly to the contributor.",
    icon: LuBanknote,
  },
];

export function ProtocolSection() {
  return (
    <Box
      py={{ base: 16, md: 24 }}
      bg="bg"
      borderBottomWidth="1px"
      borderColor="border.DEFAULT"
    >
      <Flex direction="column" mb={12}>
        <HStack gap={2} mb={2}>
          <Text textStyle="label-mono" color="secondary" fontWeight="700">
            // HOW IT WORKS
          </Text>
        </HStack>
        <Heading
          as="h2"
          textStyle="headline-lg"
          color="primary"
          fontSize={{ base: "28px", md: "36px" }}
        >
          Autonomous 4-Step Verification & Disbursal
        </Heading>
      </Flex>

      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 4 }}
        gap={6}
        alignContent="stretch"
      >
        {steps.map((step) => (
          <Flex
            key={step.num}
            direction="column"
            justify="space-between"
            p={7}
            h="100%"
            minH="260px"
            border="1px solid"
            borderColor="primary"
            position="relative"
            overflow="hidden"
            bg="surfaceNeutral"
            transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
              bg: "bg.panel",
              transform: "translate(-4px, -4px)",
              borderColor: "primary",
              boxShadow: "6px 6px 0px 0px #000000",
              zIndex: 2,
            }}
          >
            {/* Watermark Number */}
            <Text
              position="absolute"
              bottom="-4"
              right="-2"
              fontSize="120px"
              fontWeight="900"
              color="border.DEFAULT"
              opacity={0.25}
              lineHeight="1"
              pointerEvents="none"
              userSelect="none"
              zIndex={0}
            >
              {step.num}
            </Text>

            <Box position="relative" zIndex={1}>
              <Flex justify="space-between" align="center" mb={6}>
                <Badge
                  bg="primary"
                  color="onPrimary"
                  borderRadius="0"
                  px={2.5}
                  py={1}
                  textStyle="label-mono"
                  fontSize="11px"
                  fontWeight="700"
                >
                  STEP {step.num}
                </Badge>
                <Badge
                  variant="outline"
                  borderColor="border.input"
                  color={step.badgeColor}
                  borderRadius="0"
                  px={2.5}
                  py={1}
                  textStyle="label-mono"
                  fontSize="11px"
                  fontWeight="700"
                >
                  {step.role}
                </Badge>
              </Flex>

              <Flex align="center" gap={3} mb={3}>
                <Box
                  p={2}
                  bg="bg.panel"
                  border="1px solid"
                  borderColor="border.DEFAULT"
                >
                  <Icon as={step.icon} boxSize={5} color="primary" />
                </Box>
                <Heading
                  as="h3"
                  textStyle="body-lg"
                  fontWeight="700"
                  color="primary"
                  fontSize="18px"
                >
                  {step.title}
                </Heading>
              </Flex>

              <Text
                textStyle="body-md"
                color="fg.muted"
                fontSize="14px"
                lineHeight="1.6"
              >
                {step.body}
              </Text>
            </Box>
          </Flex>
        ))}
      </SimpleGrid>
    </Box>
  );
}
