"use client";

import { Box, Flex, Heading, Button, Icon } from "@chakra-ui/react";
import NextLink from "next/link";
import { LuArrowRight } from "react-icons/lu";
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
      {/* Subtle Dark Grid Overlay */}
      <Box 
        position="absolute" 
        inset={0} 
        opacity={0.15} 
        backgroundImage="linear-gradient(to right, #FFFFFF 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)" 
        backgroundSize="40px 40px" 
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
        <Heading as="h2" textStyle="display-lg" maxW="600px" mb={10}>
          Build the Open Economy for AI Data
        </Heading>

        <Button 
          asChild 
          bg="onPrimary" 
          color="primary" 
          textStyle="label-mono" 
          px={6} 
          py={6}
          borderRadius={0}
          _hover={{ bg: "border.subtle", color: "primary" }}
        >
          <NextLink href={routes.buyer.newRequest}>
            Start Building <Icon as={LuArrowRight} ml={2} />
          </NextLink>
        </Button>
      </Flex>
    </Box>
  );
}
