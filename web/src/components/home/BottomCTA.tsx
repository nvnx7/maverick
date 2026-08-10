"use client";

import { Box, Flex, Heading, Icon, HStack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { LuArrowRight } from "react-icons/lu";
import { Button } from "@/components/common/Button";
import { routes } from "@/config/routes";

export function BottomCTA() {
  return (
    <Box 
      bg="primary" 
      color="onPrimary" 
      py={{ base: 24, md: 32 }} 
      w="100vw"
      position="relative"
      left="50%"
      right="50%"
      ml="-50vw"
      mr="-50vw"
    >
      {/* Subtle Grid Overlay */}
      <Box 
        position="absolute" 
        inset={0} 
        opacity={0.15} 
        backgroundImage="linear-gradient(to right, #FFFFFF 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)" 
        backgroundSize="40px 40px" 
        style={{ WebkitMaskImage: "radial-gradient(circle at center, black 0%, transparent 80%)", maskImage: "radial-gradient(circle at center, black 0%, transparent 80%)" }}
        zIndex={0}
        pointerEvents="none"
      />

      <Flex 
        position="relative" 
        zIndex={1} 
        direction="column" 
        align="center" 
        justify="center" 
        textAlign="center"
        px={4}
      >
        <Text textStyle="label-mono" color="#27C93F" mb={4} fontWeight="700" letterSpacing="0.1em">
          // DECENTRALIZED DATA COMMERCE
        </Text>

        <Heading as="h2" textStyle="display-lg" maxW="700px" mb={6} fontSize={{ base: "32px", md: "48px" }} color="onPrimary">
          Build the Open Economy for AI Data
        </Heading>

        <Text color="#A1A1AA" maxW="540px" mb={10} fontSize="17px">
          Whether you need millions of verified captures or want to earn by sourcing data, Maverick powers trustless execution on Arc.
        </Text>

        <HStack gap={4} mb={12} flexWrap="wrap" justify="center">
          <Button 
            asChild 
            variant="dark"
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
            borderColor="onPrimary"
            color="onPrimary"
            px={8} 
            py={7}
            fontSize="md"
            _hover={{ bg: "#111111" }}
          >
            <NextLink href={routes.contributor.browse}>
              Browse Marketplace <Icon as={LuArrowRight} ml={2} />
            </NextLink>
          </Button>
        </HStack>

        <HStack gap={4} textStyle="label-mono" color="#888888" fontSize="11px">
          <Text color="#60A5FA">CONTRACT: 0xB77D...6b5e</Text>
          <Text>·</Text>
          <Text color="#27C93F">ARC TESTNET</Text>
          <Text>·</Text>
          <Text color="#FFFFFF">ERC-8183 ESCROW</Text>
        </HStack>
      </Flex>
    </Box>
  );
}

