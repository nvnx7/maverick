import { Box, Heading } from "@chakra-ui/react";
import { NewRequestFlow } from "@/components/buyer/new-request/NewRequestFlow";
import { WalletGate } from "@/components/wallet/WalletGate";

export default function NewRequestPage() {
  return (
    <Box pt={{ base: 8, md: 12 }} pb={{ base: 12, md: 24 }}>
      <Heading as="h1" textStyle="headline-lg" color="primary" mb={10}>
        Request For Data
      </Heading>

      <WalletGate>
        <NewRequestFlow />
      </WalletGate>
    </Box>
  );
}
