import { Box, Container, Flex, Text, HStack, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { routes } from "@/config/routes";

export function Footer() {
  return (
    <Box as="footer" borderTopWidth="1px" borderColor="border.chrome" mt={20}>
      <Container maxW="1280px" px={{ base: "16px", md: "40px" }} py={6}>
        <Flex
          justify="space-between"
          align="center"
          gap={3}
          direction={{ base: "column", sm: "row" }}
        >
          <Text textStyle="label-mono" color="fg.subtle">
            © 2024 Maverick AI Infrastructure. All rights reserved.
          </Text>
          <HStack gap={6} textStyle="label-mono" color="fg.subtle">
            <Link asChild _hover={{ color: "primary" }}>
              <NextLink href={routes.contributor.browse}>Marketplace</NextLink>
            </Link>
            <Link asChild _hover={{ color: "primary" }}>
              <NextLink href="https://github.com/nvnx7/maverick#readme">Docs</NextLink>
            </Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
