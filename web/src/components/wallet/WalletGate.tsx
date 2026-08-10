"use client";

import { useAccount } from "wagmi";
import { Button } from "@/components/common/Button";
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
        <Button variant="primary" size="sm" mt={3} px={6} py={5} onClick={openConnect}>
          Connect Wallet
        </Button>
      </EmptyState>
    );
  }

  return <>{children}</>;
}

