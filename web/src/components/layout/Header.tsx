"use client";

import { Box, Container, Flex, HStack, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { buyerNav, contributorNav, routes } from "@/config/routes";
import { NavLink } from "./NavLink";

export function Header() {
  const pathname = usePathname();

  const nav = pathname.startsWith("/buyer")
    ? buyerNav
    : pathname.startsWith("/contributor")
      ? contributorNav
      : [];

  return (
    <Box
      as="header"
      borderBottomWidth="1px"
      borderColor="border"
      bg="bg"
      position="sticky"
      top={0}
      zIndex="docked"
    >
      <Container maxW="6xl" px={{ base: 5, md: 8 }}>
        <Flex h="60px" align="center" justify="space-between" gap={6}>
          <HStack gap={8}>
            <Link
              asChild
              _hover={{ textDecoration: "none" }}
              _focusVisible={{ outline: "none" }}
            >
              <NextLink href={routes.home}>
                <HStack gap={2.5}>
                  <Box boxSize="10px" bg="brand.500" />
                  <Text fontWeight="600" letterSpacing="-0.01em">
                    Maverick
                  </Text>
                </HStack>
              </NextLink>
            </Link>

            <HStack gap={6} display={{ base: "none", md: "flex" }}>
              {nav.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} />
              ))}
            </HStack>
          </HStack>

          <ConnectWalletButton />
        </Flex>
      </Container>
    </Box>
  );
}
