"use client";

import { Box, SimpleGrid, Heading, Text, Flex, Icon } from "@chakra-ui/react";
import { LuFileText, LuWallet, LuUsers, LuBanknote } from "react-icons/lu";

const steps = [
  {
    num: "01",
    title: "Request",
    body: "Buyers define data needs and budget.",
    icon: LuFileText,
  },
  {
    num: "02",
    title: "Fund",
    body: "Providers review and fund approved jobs.",
    icon: LuWallet,
  },
  {
    num: "03",
    title: "Contribute",
    body: "Anyone picks up jobs and submits data.",
    icon: LuUsers,
  },
  {
    num: "04",
    title: "Earn",
    body: "Transparent USDC payouts for accepted work.",
    icon: LuBanknote,
  },
];

export function ProtocolSection() {
  return (
    <Box py={{ base: 16, md: 24 }} bg="bg.panel" borderBottomWidth="1px" borderColor="border.DEFAULT">
      <Heading as="h2" textStyle="headline-lg" color="primary" mb={12}>
        The Protocol
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={0} borderWidth="1px" borderColor="border.DEFAULT" bg="surfaceNeutral">
        {steps.map((step, i) => (
          <Box 
            key={step.num} 
            p={8} 
            borderRightWidth={{ base: 0, lg: i === steps.length - 1 ? 0 : "1px" }}
            borderBottomWidth={{ base: "1px", lg: 0 }}
            borderColor="border.DEFAULT"
          >
            <Flex justify="space-between" align="flex-start" mb={12}>
              <Text textStyle="label-mono" color="fg.subtle">{step.num}</Text>
              <Icon as={step.icon} boxSize={5} color="primary" />
            </Flex>
            <Heading as="h3" textStyle="body-lg" fontWeight="600" color="primary" mb={3}>
              {step.title}
            </Heading>
            <Text textStyle="body-md" color="fg.muted">
              {step.body}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
