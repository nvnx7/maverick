"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Hash } from "viem";

type FulfillValue = {
  files: File[];
  dataHash: Hash | null;
  signature: Hash | null;
  setFiles: (files: File[]) => void;
  setDataHash: (hash: Hash | null) => void;
  setSignature: (signature: Hash | null) => void;
};

const FulfillContext = createContext<FulfillValue | null>(null);

/** Holds only state — the uploader and the step list each own their behaviour. */
export function FulfillProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<File[]>([]);
  const [dataHash, setDataHash] = useState<Hash | null>(null);
  const [signature, setSignature] = useState<Hash | null>(null);

  const value = useMemo(
    () => ({
      files,
      dataHash,
      signature,
      setFiles,
      setDataHash,
      setSignature,
    }),
    [files, dataHash, signature],
  );

  return (
    <FulfillContext.Provider value={value}>{children}</FulfillContext.Provider>
  );
}

export function useFulfill() {
  const context = useContext(FulfillContext);
  if (!context) {
    throw new Error("useFulfill must be used within FulfillProvider");
  }
  return context;
}
