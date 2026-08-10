"use client";

import {
  Badge,
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Text,
} from "@chakra-ui/react";
import Image from "next/image";
import NextLink from "next/link";
import { LuArrowRight } from "react-icons/lu";
import { Button } from "@/components/common/Button";
import { routes } from "@/config/routes";

export function HeroSection() {
  return (
    <Box
      py={{ base: 12, md: 24 }}
      borderBottomWidth="1px"
      borderColor="border.DEFAULT"
    >
      <Flex direction={{ base: "column", lg: "row" }} gap={16} align="center">
        {/* Left Column: Hero Copy & CTA */}
        <Box flex="1" maxW="620px">
          {/* Pulsing Status Pill */}
          <HStack
            display="inline-flex"
            bg="surfaceNeutral"
            border="1px solid"
            borderColor="border.DEFAULT"
            px={3}
            py={1.5}
            mb={6}
            gap={2}
          >
            <Box
              w="8px"
              h="8px"
              borderRadius="full"
              bg="successGreen"
              boxShadow="0 0 8px #10B981"
            />
            <Text textStyle="label-mono" color="primary" fontSize="11px" fontWeight="600">
              ERC-8183 DATA ESCROW LIVE ON ARC TESTNET
            </Text>
          </HStack>

          <Heading
            as="h1"
            textStyle="display-lg"
            color="primary"
            mb={6}
            lineHeight="1.1"
            letterSpacing="-0.03em"
            fontSize={{ base: "36px", md: "52px" }}
          >
            Democratize The World’s AI Data
          </Heading>

          <Text textStyle="body-lg" color="fg.muted" mb={8} fontSize={{ base: "16px", md: "18px" }}>
            An open decentralized protocol where AI builders source verifiable training datasets, and contributors earn transparent USDC disburser payouts.
          </Text>

          {/* Action Buttons */}
          <HStack gap={4} mb={10} flexWrap="wrap">
            <Button
              asChild
              variant="primary"
              px={8}
              py={7}
              fontSize="md"
            >
              <NextLink href={routes.buyer.newRequest}>
                Post Data Job <Icon as={LuArrowRight} ml={2} />
              </NextLink>
            </Button>
            <Button
              asChild
              variant="outline"
              px={8}
              py={7}
              fontSize="md"
            >
              <NextLink href={routes.contributor.browse}>
                Become Contributor <Icon as={LuArrowRight} ml={2} />
              </NextLink>
            </Button>
          </HStack>

          {/* Protocol Tags */}
          <HStack gap={3} textStyle="label-mono" color="fg.subtle" flexWrap="wrap" pt={4} borderTop="1px solid" borderColor="border.chrome">
            <Text mr={1} fontWeight="700">BUILT ON</Text>
            <Badge bg="surfaceNeutral" color="primary" border="1px solid" borderColor="border.DEFAULT" borderRadius="0" px={2.5} py={1} textStyle="label-mono">Arc Testnet</Badge>
            <Badge bg="surfaceNeutral" color="primary" border="1px solid" borderColor="border.DEFAULT" borderRadius="0" px={2.5} py={1} textStyle="label-mono">ERC-8183 Escrow</Badge>
            <Badge bg="surfaceNeutral" color="primary" border="1px solid" borderColor="border.DEFAULT" borderRadius="0" px={2.5} py={1} textStyle="label-mono">USDC Rails</Badge>
          </HStack>
        </Box>

        {/* Right Column: Terminal Architecture Frame */}
        <Box flex="1" w="full">
          <Box
            bg="primary"
            border="1px solid"
            borderColor="primary"
            boxShadow="8px 8px 0px 0px #000000"
            transition="all 0.3s ease"
            _hover={{
              transform: "translate(-2px, -2px)",
              boxShadow: "10px 10px 0px 0px #000000",
            }}
          >
            {/* Terminal Header */}
            <Flex
              bg="#111111"
              px={4}
              py={3}
              align="center"
              justify="space-between"
              borderBottom="1px solid"
              borderColor="#222222"
            >
              <HStack gap={2}>
                <Box w="10px" h="10px" borderRadius="full" bg="#FF5F56" />
                <Box w="10px" h="10px" borderRadius="full" bg="#FFBD2E" />
                <Box w="10px" h="10px" borderRadius="full" bg="#27C93F" />
                <Text textStyle="label-mono" color="#888888" fontSize="11px" ml={2}>
                  maverick-protocol-v1.0 --arc-testnet
                </Text>
              </HStack>
              <Badge bg="#1E293B" color="#60A5FA" border="1px solid" borderColor="#334155" borderRadius="0" px={2} py={0.5} textStyle="label-mono" fontSize="10px">
                ACTIVE PIPELINE
              </Badge>
            </Flex>

            {/* Architecture Canvas */}
            <Box p={4} bg="bg.panel" position="relative" minH={{ base: "320px", lg: "480px" }}>
              <Image
                src="/hero.png"
                alt="Maverick Architecture Diagram"
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </Box>

            {/* Terminal Footer Bar */}
            <Flex
              bg="#F8FAFC"
              px={4}
              py={2.5}
              align="center"
              justify="space-between"
              borderTop="1px solid"
              borderColor="border.DEFAULT"
              flexWrap="wrap"
              gap={2}
            >
              <HStack gap={2} textStyle="label-mono" fontSize="11px" color="fg.subtle">
                <Text color="primary" fontWeight="700">COMMERCE</Text>
                <Text>0xB77D...6b5e</Text>
              </HStack>
              <HStack gap={2} textStyle="label-mono" fontSize="11px" color="fg.subtle">
                <Text color="successGreen" fontWeight="700">STATUS</Text>
                <Text>VERIFIED AGENT RELEASE</Text>
              </HStack>
            </Flex>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}

