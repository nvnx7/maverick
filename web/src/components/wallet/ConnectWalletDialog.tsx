"use client";

import {
  CloseButton,
  Dialog,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { Button } from "@/components/common/Button";

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
            border="1px solid"
            borderColor="primary"
            borderRadius="0"
            maxW="sm"
          >
            <Dialog.Header pb={2}>
              <Dialog.Title textStyle="headline-md" color="primary">Connect a Wallet</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body pb={6}>
              <Text fontSize="14px" color="fg.muted" mb={5} lineHeight="1.5">
                Maverick never takes custody. Funds move directly between your wallet and the ERC-8183 escrow contract.
              </Text>

              {available.length === 0 ? (
                <Text fontSize="14px" color="fg.muted">
                  No web3 wallet detected in this browser. Install MetaMask, Rabby, or Coinbase Wallet, then reload.
                </Text>
              ) : (
                <VStack gap={3} align="stretch">
                  {available.map((connector) => (
                    <Button
                      key={connector.uid}
                      variant="outline"
                      px={5}
                      py={5}
                      fontSize="sm"
                      justifyContent="flex-start"
                      loading={isPending}
                      onClick={() => connect({ connector })}
                    >
                      {connector.name}
                    </Button>
                  ))}
                </VStack>
              )}

              {error && (
                <Text fontSize="14px" color="red.600" fontWeight="600" mt={4}>
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

