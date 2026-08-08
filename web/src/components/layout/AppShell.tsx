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
          maxW="1280px"
          flex="1"
          px={{ base: "16px", md: "40px" }}
          py={{ base: 4, md: 0 }}
        >
          {children}
        </Container>
        <Footer />
      </Box>
    </WalletDialogProvider>
  );
}
