import { Box, Heading, SimpleGrid, Text } from "@chakra-ui/react";

const steps = [
  {
    title: "Buyer posts a request",
    body: "Modality, device requirements, budget. USDC goes into the escrow contract, not into a platform account.",
  },
  {
    title: "Provider agent reviews it",
    body: "It checks the spec on-chain and either sets the budget or rejects the job with a reason you can read.",
  },
  {
    title: "Contributor captures and signs",
    body: "The device signs the data hash at capture time. Files are hashed locally before anything uploads.",
  },
  {
    title: "Verified, then paid",
    body: "The signature is checked against the on-chain device registry. USDC releases directly to the contributor.",
  },
];

export function HowItWorks() {
  return (
    <Box mt={{ base: 16, md: 28 }}>
      <Heading size="md" fontWeight="500" color="fg.muted" mb={8}>
        How it works
      </Heading>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={0}>
        {steps.map((step, index) => (
          <Box
            key={step.title}
            borderTopWidth="1px"
            borderColor="border"
            pt={5}
            pe={{ base: 0, lg: 6 }}
            pb={{ base: 6, lg: 0 }}
          >
            <Text fontFamily="mono" fontSize="xs" color="brand.fg" mb={3}>
              {String(index + 1).padStart(2, "0")}
            </Text>
            <Text fontWeight="500" mb={2}>
              {step.title}
            </Text>
            <Text fontSize="sm" color="fg.muted" lineHeight="1.6">
              {step.body}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
