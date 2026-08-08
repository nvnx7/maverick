"use client";

import { Box, Container, Flex, HStack, Link, Text } from "@chakra-ui/react";
import Image from "next/image";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { buyerNav, contributorNav, routes } from "@/config/routes";
import { NavLink } from "./NavLink";

export function Header() {
  const pathname = usePathname();

  // Keep contextual nav for internal routes, but use the global layout for the home page.
  const nav = pathname.startsWith("/buyer")
    ? buyerNav
    : pathname.startsWith("/contributor")
      ? contributorNav
      : [
          { href: routes.home, label: "Home" },
          { href: routes.contributor.browse, label: "Marketplace" },
          { href: "https://github.com/nvnx7/maverick#readme", label: "Docs" },
        ];

  return (
    <Box
      as="header"
      borderBottomWidth="1px"
      borderColor="border.DEFAULT"
      bg="bg"
      position="sticky"
      top={0}
      zIndex="docked"
    >
      <Container maxW="1280px" px={{ base: "16px", md: "40px" }}>
        <Flex h="80px" align="center" justify="space-between">
          <Link
            asChild
            _hover={{ textDecoration: "none" }}
            _focusVisible={{ outline: "none" }}
          >
            <NextLink href={routes.home}>
              <HStack gap={3}>
                <Image
                  src="/logo.svg"
                  alt="Maverick logo"
                  width={48}
                  height={48}
                />
                <Text
                  textStyle="headline-md"
                  fontWeight="700"
                  letterSpacing="-0.02em"
                  color="primary"
                >
                  Maverick
                </Text>
              </HStack>
            </NextLink>
          </Link>

          <HStack
            gap={8}
            display={{ base: "none", md: "flex" }}
            position="absolute"
            left="50%"
            transform="translateX(-50%)"
          >
            {nav.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </HStack>

          <HStack gap={6}>
            <ConnectWalletButton />
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
