"use client";

import { Box, Flex, Heading, Text, HStack, Link, Icon, Button } from "@chakra-ui/react";
import NextLink from "next/link";
import { LuArrowRight } from "react-icons/lu";
import { routes } from "@/config/routes";

export function HeroSection() {
  return (
    <Box py={{ base: 12, md: 24 }} borderBottomWidth="1px" borderColor="border.DEFAULT">
      <Flex direction={{ base: "column", lg: "row" }} gap={16} align="center">
        <Box flex="1" maxW="600px">
          <Heading as="h1" textStyle="display-lg" color="primary" mb={6}>
            Democratise the World’s AI Data
          </Heading>
          <Text textStyle="body-lg" color="fg.muted" mb={10}>
            An open marketplace where AI builders can source the data they need, and contributors anywhere can earn by providing it.
          </Text>

          <HStack gap={4} mb={16}>
            <Button asChild bg="primary" color="onPrimary" borderRadius="0" px={6} py={6} _hover={{ bg: "onSurfaceVariant", color: "onPrimary" }}>
              <NextLink href={routes.buyer.newRequest}>
                Post a Data Job <Icon as={LuArrowRight} ml={1} />
              </NextLink>
            </Button>
            <Button asChild variant="outline" borderColor="primary" borderWidth="1px" color="primary" borderRadius="0" px={6} py={6} _hover={{ bg: "surfaceNeutral" }}>
              <NextLink href={routes.contributor.browse}>
                Become a Contributor <Icon as={LuArrowRight} ml={1} />
              </NextLink>
            </Button>
          </HStack>

          <HStack gap={4} textStyle="label-mono" color="fg.subtle">
            <Text>BUILT ON</Text>
            <Text color="primary">ERC-8183</Text>
            <Text>·</Text>
            <Text color="primary">Arc</Text>
            <Text>·</Text>
            <Text color="primary">USDC</Text>
          </HStack>
        </Box>
        
        <Box flex="1" w="full" bg="bg.subtle" h="320px" display="flex" alignItems="center" justifyContent="center" borderWidth="1px" borderColor="border.DEFAULT">
          {/* Placeholder for the diagram */}
          <Text textStyle="label-mono" color="fg.subtle">SYSTEM_ARCHITECTURE_V1</Text>
        </Box>
      </Flex>
    </Box>
  );
}
