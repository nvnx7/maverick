import { Box, Container, Flex, Text } from "@chakra-ui/react";
import { chain } from "@/config/chain";

export function Footer() {
  return (
    <Box as="footer" borderTopWidth="1px" borderColor="border" mt={20}>
      <Container maxW="6xl" px={{ base: 5, md: 8 }} py={6}>
        <Flex
          justify="space-between"
          gap={3}
          direction={{ base: "column", sm: "row" }}
        >
          <Text fontSize="xs" color="fg.muted">
            Device registration is self-attested in this MVP — a registered key
            is not proof of a real capture device.
          </Text>
          <Text fontSize="xs" color="fg.muted" fontFamily="mono" flexShrink={0}>
            {chain.name} · {chain.id}
          </Text>
        </Flex>
      </Container>
    </Box>
  );
}
