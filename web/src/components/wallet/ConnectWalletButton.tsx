"use client";

import { HStack, IconButton, Text } from "@chakra-ui/react";
import { LuLogOut, LuWallet } from "react-icons/lu";
import { useAccount, useDisconnect } from "wagmi";
import { Button } from "@/components/common/Button";
import { truncateMiddle } from "@/utils/format";
import { useWalletDialog } from "./WalletDialogProvider";

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnect } = useWalletDialog();

  if (!isConnected || !address) {
    return (
      <Button size="sm" variant="primary" px={4} py={2} onClick={openConnect}>
        <LuWallet /> Connect Wallet
      </Button>
    );
  }

  return (
    <HStack gap={0} borderWidth="1px" borderColor="border" bg="bg.panel">
      <Text px={3} fontFamily="mono" fontSize="sm">
        {truncateMiddle(address, 6, 4)}
      </Text>
      <IconButton
        aria-label="Disconnect wallet"
        size="sm"
        variant="ghost"
        color="fg.muted"
        onClick={() => disconnect()}
        _hover={{ color: "fg", bg: "bg.emphasized" }}
      >
        <LuLogOut />
      </IconButton>
    </HStack>
  );
}
