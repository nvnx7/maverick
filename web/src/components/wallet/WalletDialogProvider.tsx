"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { ConnectWalletDialog } from "./ConnectWalletDialog";

type WalletDialogValue = { openConnect: () => void };

const WalletDialogContext = createContext<WalletDialogValue | null>(null);

/** Any component can prompt for a wallet without threading props to it. */
export function WalletDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ openConnect: () => setOpen(true) }), []);

  return (
    <WalletDialogContext.Provider value={value}>
      {children}
      <ConnectWalletDialog open={open} onOpenChange={setOpen} />
    </WalletDialogContext.Provider>
  );
}

export function useWalletDialog() {
  const context = useContext(WalletDialogContext);
  if (!context) {
    throw new Error("useWalletDialog must be used within WalletDialogProvider");
  }
  return context;
}
