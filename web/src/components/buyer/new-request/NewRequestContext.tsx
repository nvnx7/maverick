"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Hash } from "viem";
import type { RequestSpec } from "@/types";

type Stage = "form" | "review" | "fund" | "funded";

type CreatedRequest = {
  jobId: string;
  txHash: Hash;
  spec: RequestSpec;
  budget: bigint;
};

type NewRequestValue = {
  stage: Stage;
  created: CreatedRequest | null;
  fundTxHash: Hash | null;
  markCreated: (request: CreatedRequest) => void;
  markAgreed: () => void;
  markFunded: (txHash: Hash) => void;
};

const NewRequestContext = createContext<NewRequestValue | null>(null);

/** Holds the two-transaction flow together without threading props between steps. */
export function NewRequestProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [stage, setStage] = useState<Stage>("form");
  const [created, setCreated] = useState<CreatedRequest | null>(null);
  const [fundTxHash, setFundTxHash] = useState<Hash | null>(null);

  const markCreated = useCallback((request: CreatedRequest) => {
    setCreated(request);
    setStage("review");
  }, []);

  const markAgreed = useCallback(() => setStage("fund"), []);

  const markFunded = useCallback((txHash: Hash) => {
    setFundTxHash(txHash);
    setStage("funded");
  }, []);

  const value = useMemo(
    () => ({ stage, created, fundTxHash, markCreated, markAgreed, markFunded }),
    [stage, created, fundTxHash, markCreated, markAgreed, markFunded],
  );

  return (
    <NewRequestContext.Provider value={value}>
      {children}
    </NewRequestContext.Provider>
  );
}

export function useNewRequest() {
  const context = useContext(NewRequestContext);
  if (!context) {
    throw new Error("useNewRequest must be used within NewRequestProvider");
  }
  return context;
}
