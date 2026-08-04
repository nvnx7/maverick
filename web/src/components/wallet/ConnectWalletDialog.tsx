"use client";

import {
  Button,
  CloseButton,
  Dialog,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useAccount, useConnect } from "wagmi";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ConnectWalletDialog({ open, onOpenChange }: Props) {
  const { connectors, connect, isPending, error } = useConnect();
  const { isConnected } = useAccount();

  // EIP-6963 discovery can surface the same wallet twice.
  const available = connectors.filter(
    (connector, index, all) =>
      all.findIndex((item) => item.id === connector.id) === index,
  );

  useEffect(() => {
    if (isConnected && open) onOpenChange(false);
  }, [isConnected, open, onOpenChange]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(event) => onOpenChange(event.open)}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.700" backdropFilter="blur(2px)" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border"
            maxW="sm"
          >
            <Dialog.Header pb={2}>
              <Dialog.Title fontWeight="500">Connect a wallet</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body pb={6}>
              <Text fontSize="sm" color="fg.muted" mb={5}>
                Maverick never takes custody. Funds move between your wallet and
                the escrow contract directly.
              </Text>

              {available.length === 0 ? (
                <Text fontSize="sm" color="fg.muted">
                  No wallet detected in this browser. Install a wallet
                  extension, then reload.
                </Text>
              ) : (
                <VStack gap={2} align="stretch">
                  {available.map((connector) => (
                    <Button
                      key={connector.uid}
                      variant="outline"
                      borderColor="border"
                      justifyContent="flex-start"
                      loading={isPending}
                      onClick={() => connect({ connector })}
                      _hover={{ bg: "bg.emphasized", borderColor: "brand.600" }}
                    >
                      {connector.name}
                    </Button>
                  ))}
                </VStack>
              )}

              {error && (
                <Text fontSize="sm" color="warn.fg" mt={4}>
                  {error.message}
                </Text>
              )}
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
