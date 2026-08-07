"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Hash } from "viem";
import type { PresignedUpload } from "@/api/submissions";

export type UploadTarget = {
  uploadPath: string;
  /** Presigned POST policy (url + form fields) per file, keyed by file name. */
  uploadUrls: Record<string, PresignedUpload>;
};

type FulfillValue = {
  files: File[];
  uploadTarget: UploadTarget | null;
  uploaded: boolean;
  dataHash: Hash | null;
  signature: Hash | null;
  setFiles: (files: File[]) => void;
  setUploadTarget: (uploadTarget: UploadTarget | null) => void;
  setUploaded: (uploaded: boolean) => void;
  setDataHash: (hash: Hash | null) => void;
  setSignature: (signature: Hash | null) => void;
};

const FulfillContext = createContext<FulfillValue | null>(null);

/** Holds only state — the uploader and the step list each own their behaviour. */
export function FulfillProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadTarget, setUploadTarget] = useState<UploadTarget | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const [dataHash, setDataHash] = useState<Hash | null>(null);
  const [signature, setSignature] = useState<Hash | null>(null);

  const value = useMemo(
    () => ({
      files,
      uploadTarget,
      uploaded,
      dataHash,
      signature,
      setFiles,
      setUploadTarget,
      setUploaded,
      setDataHash,
      setSignature,
    }),
    [files, uploadTarget, uploaded, dataHash, signature],
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
