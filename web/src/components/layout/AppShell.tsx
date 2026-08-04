import { Box, Container } from "@chakra-ui/react";
import { WalletDialogProvider } from "@/components/wallet/WalletDialogProvider";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <WalletDialogProvider>
      <Box display="flex" flexDirection="column" minH="100dvh">
        <Header />
        <Container
          as="main"
          maxW="6xl"
          flex="1"
          px={{ base: 5, md: 8 }}
          py={{ base: 8, md: 12 }}
        >
          {children}
        </Container>
        <Footer />
      </Box>
    </WalletDialogProvider>
  );
}
