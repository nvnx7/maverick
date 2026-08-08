import { Box, Container, Flex, Text, HStack, Link } from "@chakra-ui/react";
import NextLink from "next/link";

export function Footer() {
  return (
    <Box as="footer" borderTopWidth="1px" borderColor="border.DEFAULT" mt={20}>
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
              <NextLink href="#">Terms</NextLink>
            </Link>
            <Link asChild _hover={{ color: "primary" }}>
              <NextLink href="#">Privacy</NextLink>
            </Link>
            <Link asChild _hover={{ color: "primary" }}>
              <NextLink href="#">Twitter</NextLink>
            </Link>
            <Link asChild _hover={{ color: "primary" }}>
              <NextLink href="#">Discord</NextLink>
            </Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
