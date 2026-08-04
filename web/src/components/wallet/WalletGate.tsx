"use client";

import { Button } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { EmptyState } from "@/components/common/EmptyState";
import { useWalletDialog } from "./WalletDialogProvider";

/** Wraps anything that can't render without a connected account. */
export function WalletGate({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const { openConnect } = useWalletDialog();

  if (!isConnected) {
    return (
      <EmptyState
        title="Connect a wallet to continue"
        description="Requests and payouts are tied to your address. Nothing is stored against an account on our side."
      >
        <Button colorPalette="brand" size="sm" mt={2} onClick={openConnect}>
          Connect wallet
        </Button>
      </EmptyState>
    );
  }

  return <>{children}</>;
}
