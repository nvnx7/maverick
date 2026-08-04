import { Box, Heading, Text } from "@chakra-ui/react";

export function HomeHero() {
  return (
    <Box pt={{ base: 6, md: 16 }} pb={{ base: 10, md: 14 }} maxW="4xl">
      <Text
        fontFamily="mono"
        fontSize="xs"
        color="brand.fg"
        textTransform="uppercase"
        letterSpacing="0.08em"
        mb={5}
      >
        AI training data · cryptographic provenance
      </Text>

      <Heading
        as="h1"
        fontWeight="500"
        letterSpacing="-0.03em"
        lineHeight="1.1"
        fontSize={{ base: "4xl", md: "6xl" }}
      >
        Every capture is signed at the source.
      </Heading>

      <Text
        fontSize={{ base: "lg", md: "2xl" }}
        color="fg.muted"
        mt={5}
        lineHeight="1.4"
        letterSpacing="-0.01em"
      >
        Payment releases when it&apos;s proven, not when someone vouches for it.
      </Text>
    </Box>
  );
}
